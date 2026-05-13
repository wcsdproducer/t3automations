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

    const tosHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Terms of Service | ${businessName}</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
              h1, h2 { color: #111; }
              .highlight { background-color: #f8f9fa; padding: 1rem; border-left: 4px solid #0056b3; margin: 1.5rem 0; }
          </style>
      </head>
      <body>
          <h1>Terms of Service</h1>
          <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <p>Welcome to <strong>${businessName}</strong>. By accessing our website or using our services, you agree to be bound by these Terms of Service.</p>

          <h2>1. Use of Services</h2>
          <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the services does not violate any applicable laws or regulations.</p>

          <div class="highlight">
              <h2>2. Communications and Messaging</h2>
              <p>By providing your phone number, you agree to receive text messages (SMS) from <strong>${businessName}</strong>. Message and data rates may apply. Message frequency varies.</p>
              <p><strong>Opt-Out Instructions:</strong> You can opt-out of receiving SMS messages at any time by replying "STOP" to any message you receive from us. After you text "STOP", you will receive one additional message confirming that your request has been processed.</p>
              <p><strong>Help Instructions:</strong> If you need assistance, reply "HELP" to any message you receive from us, or contact us using the information provided below.</p>
          </div>

          <h2>3. Intellectual Property</h2>
          <p>The content, features, and functionality of our services are owned by <strong>${businessName}</strong> and are protected by copyright, trademark, and other intellectual property laws.</p>

          <h2>4. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, <strong>${businessName}</strong> shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the services.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about these Terms of Service, please contact us at:</p>
          <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              <li><strong>Website:</strong> <a href="${website}">${website}</a></li>
          </ul>
      </body>
      </html>
    `;

    return new NextResponse(tosHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error fetching terms of service data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
