import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { businessProfileId, messages } = await req.json();
    if (!businessProfileId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing businessProfileId or messages' }, { status: 400 });
    }

    // 1. Fetch business profile details
    const profileDoc = await db.collection('businessProfiles').doc(businessProfileId).get();
    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
    }
    const profile = profileDoc.data() || {};
    const config = profile.websiteConfig || {};

    const companyName = config.companyName || profile.businessName || 'Our Company';
    const service = profile.service || 'Home Services';
    const targetCity = profile.targetCity || 'Boise, ID';
    const phoneNumber = profile.phoneNumber || '';
    const aboutText = config.about?.body || '';
    const servicesList = config.services?.items || [];

    const systemPrompt = `You are a helpful, professional AI chatbot assistant for "${companyName}", a local ${service} business serving the ${targetCity} area.
Your primary goal is to answer visitor questions politely and capture inquiries for service.

Business Info:
- Company Name: ${companyName}
- Services Offered: ${servicesList.map((s: any) => `${s.title}: ${s.description}`).join('\n')}
- Area Served: ${targetCity}
- Main Phone Line: ${phoneNumber || 'Contact us via online form'}
- About Us: ${aboutText}

Conversation Guidelines:
1. Always be polite, professional, and helpful.
2. If a customer is asking about scheduling, pricing, or booking a service, politely ask for their name, phone number, and details of their request so we can have a technician reach out to them.
3. Once the customer has provided their name and phone number, invoke the "submitLead" tool to submit their request to our CRM system.
4. After invoking the tool, confirm to the user that their request has been submitted and that a technician will call or text them shortly.
`;

    // 2. Define the submitLead tool dynamically with closure
    const toolName = `submitLead_${Math.random().toString(36).slice(2, 9)}`;
    const submitLeadTool = ai.defineTool(
      {
        name: toolName,
        description: 'Submit an inquiry or service request to the CRM when the user has provided their name and phone number.',
        inputSchema: z.object({
          name: z.string().describe('The customer name'),
          phone: z.string().describe('The customer contact phone number'),
          email: z.string().nullable().optional().describe('The customer email address, if provided'),
          notes: z.string().describe('Detailed description of their service request and appliance/job details.')
        }),
        outputSchema: z.object({
          success: z.boolean(),
          message: z.string()
        })
      },
      async (input) => {
        try {
          const leadsRef = db.collection('businessProfiles').doc(businessProfileId).collection('leads');
          const newLead = {
            name: input.name,
            phone: input.phone,
            email: input.email || '',
            source: 'chatbot',
            status: 'new',
            notes: input.notes,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await leadsRef.add(newLead);
          return { success: true, message: 'Lead successfully captured in the CRM.' };
        } catch (err: any) {
          console.error('[chatbot-tool] Failed to write lead:', err);
          return { success: false, message: `Error writing lead: ${err.message}` };
        }
      }
    );

    // 3. Format chat history for Genkit
    // Genkit expects: { role: 'user' | 'model', content: [{ text: string }] }
    const formattedHistory = messages.map((msg: any) => ({
      role: msg.role === 'model' || msg.role === 'assistant' ? 'model' as const : 'user' as const,
      content: [{ text: msg.content }]
    }));

    // 4. Generate AI response
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      messages: formattedHistory,
      system: systemPrompt,
      tools: [submitLeadTool],
      config: {
        temperature: 0.3,
      }
    });

    // Check if the tool was called during generation
    const toolCalled = response.message?.content?.some(c => c.toolRequest && c.toolRequest.name === toolName) || false;

    return NextResponse.json({
      role: 'assistant',
      content: response.text,
      leadCaptured: toolCalled
    });

  } catch (error: any) {
    console.error('[chat-api] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
