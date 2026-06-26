import { admin } from '../src/lib/firebase-admin';
import { generateAndUploadBlogImage } from '../src/lib/blog-image-generator';
import * as fs from 'fs';
import * as path from 'path';

const genericPaths = [
  '/images/appliance-gallery.png',
  '/images/appliance-hero.png',
  '/images/appliance-about.png',
  '/images/epoxy-hero.png',
  '/images/paving-hero.png',
  '/images/tree-hero.png',
  '/images/junk-removal-hero.png',
];

function isGenericFallback(url: string) {
  if (!url) return true;
  if (genericPaths.includes(url)) return true;
  if (!url.startsWith('/images/blog/') && !url.includes('firebasestorage.googleapis.com')) {
    return true;
  }
  
  // If it points to a local file under /images/blog/ but the file is missing from the public folder
  if (url.startsWith('/images/blog/')) {
    const localPath = path.join(process.cwd(), 'public', url);
    if (!fs.existsSync(localPath)) {
      console.log(`Local file missing: ${localPath}`);
      return true;
    }
  }
  
  return false;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log('Starting unique image backfill for all blogs (with missing file detection)...');
  const db = admin.firestore();
  
  const profilesSnap = await db.collection('businessProfiles').get();
  console.log(`Found ${profilesSnap.size} business profiles.`);
  
  let totalUpdated = 0;
  
  for (const profileDoc of profilesSnap.docs) {
    const userId = profileDoc.id;
    const profileData = profileDoc.data();
    const companyName = profileData.businessName || 'Local Service Pro';
    const serviceCategory = profileData.service || 'Home Services';
    
    // Skip placeholder admin accounts
    if (['6Nw77zkDqFdKearSTGxW7YMNFIf2', 'hkQbBIcZ6BODamj1qi4mRtCNQNp1', 'hrFjbsiMW4ex2RpVaHYhkOmgmp72'].includes(userId)) {
      continue;
    }
    
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing Profile: "${companyName}" (${userId}) - Niche: ${serviceCategory}`);
    
    const blogsSnap = await profileDoc.ref.collection('blogs').get();
    const blogs = blogsSnap.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    })) as any[];
    
    console.log(`Total blogs: ${blogs.length}`);
    
    // Count image occurrences
    const imageCountMap: Record<string, number> = {};
    for (const blog of blogs) {
      const url = blog.imageUrl || '';
      imageCountMap[url] = (imageCountMap[url] || 0) + 1;
    }
    
    // Identify blogs that need unique images
    const blogsToFix = blogs.filter(blog => {
      const url = blog.imageUrl || '';
      const generic = isGenericFallback(url);
      const duplicate = imageCountMap[url] > 1;
      return generic || duplicate;
    });
    
    console.log(`Blogs requiring a unique image: ${blogsToFix.length}`);
    
    for (const blog of blogsToFix) {
      const slug = blog.slug || blog.id;
      const title = blog.title || '';
      console.log(`- Fixing: "${title}" (Current: ${blog.imageUrl})`);
      
      let attempt = 0;
      let success = false;
      
      while (attempt < 3 && !success) {
        try {
          attempt++;
          // Generate and upload image
          const uniqueUrl = await generateAndUploadBlogImage(userId, slug, title, serviceCategory);
          await blog.ref.update({
            imageUrl: uniqueUrl,
            updatedAt: new Date().toISOString()
          });
          console.log(`  Success! Updated -> ${uniqueUrl}`);
          totalUpdated++;
          success = true;
          
          // Wait 6 seconds to avoid hitting rate limits
          await delay(6000);
        } catch (err: any) {
          console.error(`  Attempt ${attempt} failed for "${title}":`, err.message || err);
          if (err.message?.includes('429') || err.message?.includes('Quota exceeded')) {
            console.log('  Rate limit hit. Waiting 30 seconds before retry...');
            await delay(30000);
          } else {
            // Non-rate limit error, break early to next blog
            break;
          }
        }
      }
    }
  }
  
  console.log(`\nUnique image backfill complete! Total blogs updated: ${totalUpdated}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during backfill:', err);
  process.exit(1);
});
