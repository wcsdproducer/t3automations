const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'studio-1410114603-9e1f6' });
const auth = getAuth();
const db = getFirestore();

async function main() {
    console.log('Finding user john@t3kniq.com...');
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail('john@t3kniq.com');
    } catch(err) {
      console.error('User not found.');
      return;
    }
    
    const uid = userRecord.uid;
    console.log('Found UID:', uid);
    
    const agentsSnapshot = await db.collection(`businessProfiles/${uid}/agents`).get();
    if (agentsSnapshot.empty) {
      console.log('No agents found for this user in Firestore.');
      return;
    }
    
    const agentDoc = agentsSnapshot.docs[0];
    const agentData = agentDoc.data();
    
    console.log('Found Agent in Firestore:', agentData.elevenLabsAgentId);
    
    if (!agentData.elevenLabsAgentId) {
      console.log('No elevenLabsAgentId in Firestore document.');
      return;
    }
    
    const elevenLabsApiKey = 'sk_b06b81f582875e9a2222df104f36a3da38fd173d8022e73a';
    const formattedName = `Tenant Agent (UID: ${uid.slice(-6)})`;
    
    const defaultPrompt = `Placeholder Substitution Instruction:
Before processing this prompt, replace all placeholders (e.g., {BOTNAME}, {COMPANY}) in the prompt body below with the corresponding values provided in the Placeholder Fields section above. For example, replace every instance of {BOTNAME} with the value entered for BOTNAME (e.g., "Alex"), {COMPANY} with the value entered for COMPANY (e.g., "Bright Smiles Dental"), and so on for all 9 placeholders. Ensure all replacements are applied consistently throughout the prompt to create a seamless, customized experience.

1. BOTNAME: ...`;

    const systemPrompt = agentData.systemPrompt || defaultPrompt;
    const firstMessage = agentData.firstMessage || 'Hello! How can I assist you today?';
    const voiceId = agentData.voiceId || 'cjVigY5qzO86Huf0OWa1';

    const payload = {
      name: formattedName,
      conversation_config: {
        agent: {
          first_message: firstMessage,
          prompt: {
            prompt: systemPrompt,
            llm: "gemini-1.5-flash"
          }
        },
        tts: {
          voice_id: voiceId
        }
      }
    };

    console.log('Syncing to ElevenLabs API...');
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentData.elevenLabsAgentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Failed to sync to ElevenLabs:', err);
      return;
    }
    
    console.log('Successfully synced to ElevenLabs! Agent name updated to:', formattedName);
}
main().catch(console.error);
