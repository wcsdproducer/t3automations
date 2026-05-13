import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const profileDoc = await db.collection('businessProfiles').doc(userId).get();

    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const data = profileDoc.data();
    const businessName = data?.legalBusinessName || data?.businessName || 'Your Business Name';
    const email = data?.contactEmail || 'contact@example.com';
    const phone = data?.phoneNumber || '1-800-000-0000';
    const website = data?.websiteUrl || 'https://example.com';

    const privacyPolicyHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Privacy Policy | ${businessName}</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
              h1, h2 { color: #111; }
              .highlight { background-color: #f8f9fa; padding: 1rem; border-left: 4px solid #0056b3; margin: 1.5rem 0; }
          </style>
      </head>
      <body>
          <h1>Privacy Policy</h1>
          <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <p>This Privacy Policy describes how <strong>${businessName}</strong> ("we," "us," or "our") collects, uses, and shares your personal information.</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you fill out a form, request a service, or communicate with us. This may include your name, email address, phone number, and any other information you choose to provide.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
              <li>Provide, maintain, and improve our services.</li>
              <li>Communicate with you, including sending updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and requests.</li>
          </ul>

          <div class="highlight">
              <h2>3. Information Sharing (No Sharing Clause)</h2>
              <p><strong>Important:</strong> We do not share, sell, rent, or trade your personal information, including phone numbers and SMS consent, with third parties or affiliates for marketing purposes. Your mobile information is strictly used for the purposes you have consented to.</p>
          </div>

          <h2>4. Data Security</h2>
          <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              <li><strong>Website:</strong> <a href="${website}">${website}</a></li>
          </ul>
      </body>
      </html>
    `;

    return new NextResponse(privacyPolicyHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error fetching privacy policy data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
