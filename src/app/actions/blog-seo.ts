'use server';

import { admin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  keywords: z.array(z.string()).optional(),
});

const seoSettingsSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  googleAnalyticsMeasurementId: z.string().optional(),
  googleSiteVerification: z.string().optional(),
  blogTargetCount: z.number().min(0).max(3).optional(),
});

/**
 * Updates an existing blog post document.
 */
export async function updateBlogPost(userId: string, slug: string, data: any) {
  try {
    const validated = blogPostSchema.parse(data);
    const db = admin.firestore();

    const blogRef = db
      .collection('businessProfiles')
      .doc(userId)
      .collection('blogs')
      .doc(slug);

    const doc = await blogRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Blog post not found' };
    }

    await blogRef.update({
      ...validated,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/pages/${userId}/blog`);
    revalidatePath(`/pages/${userId}/blog/${slug}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return { success: false, error: error.message || 'Failed to update blog post' };
  }
}

/**
 * Deletes a blog post document.
 */
export async function deleteBlogPost(userId: string, slug: string) {
  try {
    const db = admin.firestore();
    const blogRef = db
      .collection('businessProfiles')
      .doc(userId)
      .collection('blogs')
      .doc(slug);

    const doc = await blogRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Blog post not found' };
    }

    await blogRef.delete();

    revalidatePath(`/pages/${userId}/blog`);
    revalidatePath(`/pages/${userId}/blog/${slug}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return { success: false, error: error.message || 'Failed to delete blog post' };
  }
}

/**
 * Saves global business profile SEO/AEO and schedule settings.
 */
export async function saveSeoSettings(userId: string, settings: any) {
  try {
    const validated = seoSettingsSchema.parse(settings);
    const db = admin.firestore();

    const profileRef = db.collection('businessProfiles').doc(userId);
    const doc = await profileRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Business profile not found' };
    }

    await profileRef.update({
      ...validated,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/pages/${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error saving SEO settings:', error);
    return { success: false, error: error.message || 'Failed to save settings' };
  }
}

/**
 * Manually triggers the dynamic blog generation cron logic for the user's business profile.
 */
export async function triggerBlogGeneration(userId: string) {
  try {
    const headersList = await headers();
    let host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:9003';
    
    // If the host is the internal Cloud Run URL, rewrite it to the public domain to bypass ingress block
    if (host.includes('a.run.app')) {
      host = 't3automations.com';
    }
    
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Construct the query pointing to our API cron endpoint
    const secretKey = process.env.CRON_SECRET || 't3_cron_secret_key_2026';
    const url = `${protocol}://${host}/api/cron/generate-blogs?secret=${secretKey}&userId=${userId}`;

    console.log(`[blog-seo-action] Dispatching manual blog generation request to: ${url}`);
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-cron-secret': secretKey,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Server returned status ${res.status}: ${errText}` };
    }

    const result = await res.json();
    return { success: true, logs: result.logs };
  } catch (error: any) {
    console.error('Error triggering blog generation:', error);
    return { success: false, error: error.message || 'Failed to trigger blog generation' };
  }
}
