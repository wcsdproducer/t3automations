import { db as adminDb } from '@/lib/firebase-admin';
const telnyx = require('telnyx');

const telnyxClient = process.env.TELNYX_API_KEY ? telnyx(process.env.TELNYX_API_KEY) : null;

interface LeadAlertPayload {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
  agentSummary?: string;
}

/**
 * Triggers real-time alerts (SMS & Email) to the renter when a new lead is captured.
 * Scopes configuration from businessProfiles/{siteId}
 */
export async function triggerLeadAlerts(siteId: string, lead: LeadAlertPayload) {
  try {
    // 1. Retrieve the business profile
    const profileDoc = await adminDb.collection('businessProfiles').doc(siteId).get();
    if (!profileDoc.exists) {
      console.warn(`[Alerts Engine] Profile ${siteId} not found. Skipping alerts.`);
      return { success: false, reason: 'Profile not found' };
    }

    const profileData = profileDoc.data();
    if (!profileData) {
      return { success: false, reason: 'Empty profile data' };
    }

    const {
      businessName = 'Your Site',
      leadForwardingEnabled = true,
      leadForwardingEmail = '',
      leadForwardingPhone = '',
      phoneNumber: sitePhoneNumber = '' // Site's purchased Telnyx number
    } = profileData;

    // If alerts are disabled globally for this tenant, exit early
    if (!leadForwardingEnabled) {
      console.log(`[Alerts Engine] Alerts disabled for ${businessName} (${siteId}).`);
      return { success: true, reason: 'Alerts disabled by renter' };
    }

    console.log(`[Alerts Engine] Dispatching lead alerts for ${businessName}...`);

    const leadName = lead.name || 'Anonymous Caller';
    const leadEmail = lead.email || 'N/A';
    const leadPhone = lead.phone || 'N/A';
    const leadSource = lead.source || 'inbound-call';
    const leadDetails = lead.notes || lead.agentSummary || 'New lead received.';

    // 2. Dispatch SMS Alert
    let smsResult = null;
    if (leadForwardingPhone) {
      const smsText = `🚨 New T3 Lead for ${businessName}!\n\nName: ${leadName}\nPhone: ${leadPhone}\nEmail: ${leadEmail}\nSource: ${leadSource}\n\nLog in to your dashboard to view details.`;
      
      try {
        if (telnyxClient) {
          // Send SMS using Telnyx Client
          // Use site's purchased phone number if available, fallback to a placeholder/default env number
          const from = sitePhoneNumber || process.env.TELNYX_FROM_NUMBER || '+15551234567';
          
          const response = await telnyxClient.messages.create({
            from,
            to: leadForwardingPhone,
            text: smsText
          });
          
          smsResult = { success: true, messageId: response.data.id };
          console.log(`[Alerts Engine] SMS sent successfully. Msg ID: ${response.data.id}`);
        } else {
          smsResult = { success: true, mock: true };
          console.log(`[Alerts Engine] [MOCK SMS] to: ${leadForwardingPhone}\nText: ${smsText}`);
        }
      } catch (smsErr) {
        console.error(`[Alerts Engine] SMS sending failed:`, smsErr);
        smsResult = { success: false, error: smsErr };
      }
    }

    // 3. Dispatch Email Alert
    let emailResult = null;
    if (leadForwardingEmail) {
      const emailSubject = `🚨 New Lead Captured for ${businessName}!`;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
          <h2 style="color: #4f46e5; margin-top: 0;">New Lead Captured!</h2>
          <p>Hello,</p>
          <p>A new lead has been captured for <strong>${businessName}</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Name</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${leadName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Phone</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${leadPhone}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${leadEmail}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Source</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; text-transform: capitalize;">${leadSource}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Details</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${leadDetails}</td>
            </tr>
          </table>

          <p style="margin-top: 30px;">
            <a href="https://t3automations.com/dashboard/${siteId}/leads" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Dashboard Leads
            </a>
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center;">Sent automatically by T3 Automations.</p>
        </div>
      `;

      try {
        // Since SMTP credentials aren't in .env, we mock/log the email dispatch
        // In production, we'd use nodemailer or Resend API
        emailResult = { success: true, mock: true };
        console.log(`[Alerts Engine] [MOCK EMAIL] to: ${leadForwardingEmail}\nSubject: ${emailSubject}\nHtml: ${emailHtml.replace(/\s+/g, ' ')}`);
      } catch (emailErr) {
        console.error(`[Alerts Engine] Email sending failed:`, emailErr);
        emailResult = { success: false, error: emailErr };
      }
    }

    return {
      success: true,
      sms: smsResult,
      email: emailResult
    };

  } catch (error) {
    console.error('[Alerts Engine] Fatal error triggering lead alerts:', error);
    return { success: false, error };
  }
}
