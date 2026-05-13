const fs = require('fs');

async function updateAgent() {
  const agentId = 'agent_3901krgpa3e5eaxs3ncvbhqxjq38';
  const apiKey = 'sk_ad615288ef2318e3205fa1dcc8c7531e3c6c2dd8f30215b2';
  const webhookSecret = '8e49cb112e70b6545afd7a59f914d74de2cd769a0925ef49138f03942a74c8fe';
  const appDomain = 'https://aisalesrep.live';


  // Read the schema
  const schemaPath = './elevenlabs_book_calendar_tool_schema.json';
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  // Get current agent to modify
  const getResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    headers: {
      'xi-api-key': apiKey
    }
  });

  const agentData = await getResponse.json();

  // We need to PATCH the agent
  // The API allows patching specific fields, but usually we just send the updated 'agent' object?
  // Let's check what the API expects for tools. 
  // Tools are in agent.prompt.tools
  
  const toolConfig = {
    type: "webhook",
    name: schema.name,
    description: schema.description,
    api_schema: {
      url: `${appDomain}/api/elevenlabs/tools/book-calendar?agent_id=${agentId}`,
      method: "POST",
      request_body_schema: {
        type: "object",
        properties: schema.parameters.properties,
        required: schema.parameters.required
      },
      request_headers: {
        "Authorization": `Bearer ${webhookSecret}`
      }
    }
  };

  const payload = {
    conversation_config: {
      agent: {
        prompt: {
          prompt: agentData.conversation_config.agent.prompt.prompt,
          llm: agentData.conversation_config.agent.prompt.llm,
          tools: [toolConfig]
        }
      }
    }
  };

  const patchResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await patchResponse.json();
  console.log("Response status:", patchResponse.status);
  console.dir(result, { depth: null });
}

updateAgent().catch(console.error);
