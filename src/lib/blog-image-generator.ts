import { ai } from '@/ai/genkit';
import { admin } from '@/lib/firebase-admin';
import { getRelevantBlogImage } from './blog-images';

export async function generateAndUploadBlogImage(
  userId: string,
  slug: string,
  title: string,
  serviceCategory: string
): Promise<string> {
  const cleanCategory = serviceCategory || 'Home Services';
  
  // Create a descriptive prompt for Imagen 3
  const prompt = `A professional, clean, bright, modern commercial photograph for a blog post titled "${title}" in the "${cleanCategory}" category. Photorealistic, high quality stock photography style, no text, no placeholders, no watermark.`;

  console.log(`Generating unique Imagen 3 image for blog: "${title}" (Slug: ${slug})`);
  
  const response = await ai.generate({
    model: 'vertexai/imagen-3.0-generate-002',
    prompt: prompt,
  });

  const media = response.media;
  if (!media || !media.url) {
    throw new Error('Imagen 3 failed to return media url');
  }

  // Extract base64 data
  const base64Data = media.url.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload to Firebase Storage
  const bucket = admin.storage().bucket();
  const destPath = `blogs/${userId}/${slug}.png`;
  const file = bucket.file(destPath);

  await file.save(buffer, {
    contentType: 'image/png',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  console.log(`Image saved to Firebase Storage: ${destPath}`);

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destPath)}?alt=media`;
}

export async function resolveBlogImageWithFallback(
  userId: string,
  slug: string,
  title: string,
  serviceCategory: string,
  keywords: string[] = []
): Promise<string> {
  try {
    return await generateAndUploadBlogImage(userId, slug, title, serviceCategory);
  } catch (error) {
    console.error(`Failed to generate/upload unique image for "${title}" (${slug}). Falling back to static mapping. Error:`, error);
    return getRelevantBlogImage(serviceCategory, keywords, title, slug);
  }
}
