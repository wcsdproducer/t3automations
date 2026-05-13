import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import * as cheerio from 'cheerio';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if it hasn't been already
if (!getApps().length) {
  // Try to use application default credentials in production, or environment variables
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      initializeApp();
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Admin:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, docId, uid } = body;

    if (!url || !docId || !uid) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
      // Fetch the website content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script, style, and noscript tags
      $('script, style, noscript, iframe, img, svg, link').remove();

      // Extract text and clean it up
      let textContent = $('body').text() || $.text();
      
      // Clean up whitespace: replace multiple spaces/newlines with single space/newline
      textContent = textContent
        .replace(/\s+/g, ' ')
        .trim();

      // Limit length if it's extremely long (e.g., to ~50k characters to avoid Firestore limits)
      if (textContent.length > 50000) {
        textContent = textContent.substring(0, 50000) + '... [Content truncated due to length]';
      }

      if (!textContent) {
        textContent = "No readable content found on this page.";
      }

      // Update Firestore document using Admin SDK
      const db = getFirestore();
      await db.collection('businessProfiles').doc(uid).collection('knowledgeBase').doc(docId).update({
        content: textContent,
        status: 'completed',
        updatedAt: new Date()
      });

      return NextResponse.json({ success: true, contentLength: textContent.length });
    } catch (scrapeError: any) {
      console.error('Scraping error:', scrapeError);
      
      // Update document to show error
      try {
        const db = getFirestore();
        await db.collection('businessProfiles').doc(uid).collection('knowledgeBase').doc(docId).update({
          content: `Failed to scrape website: ${scrapeError.message}`,
          status: 'error',
          updatedAt: new Date()
        });
      } catch (updateError) {
        console.error('Failed to update status:', updateError);
      }

      return NextResponse.json({ error: 'Scraping failed', details: scrapeError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
