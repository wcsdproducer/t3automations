# ElevenLabs Agent Integration

## 1. Knowledge Base Synchronization
When a user adds knowledge (either as text or by scraping a URL) to an agent via the `AgentSettingsPage` (`/dashboard/[userId]/agent-settings`), the application automatically syncs this document with the ElevenLabs API using the multipart endpoint (`/api/elevenlabs/agents/[agentId]/knowledge`).

This ensures the conversational agent has up-to-date context about the business.

## 2. Server Tools (Booking Webhook)
We have implemented a webhook at `/api/elevenlabs/tools/book-calendar` which allows the ElevenLabs agent to book appointments during a call.

### How to configure in ElevenLabs:
1. Go to your ElevenLabs Dashboard -> Agents.
2. Select your agent and navigate to the **Tools** section.
3. Click **Add Tool** -> **Server Tool** (or Webhook).
4. Set the Webhook URL to: `https://<YOUR_APP_DOMAIN>/api/elevenlabs/tools/book-calendar?agent_id=<YOUR_AGENT_ID>`
   *(Note: The agent_id query parameter is required to identify which business the call belongs to).*
5. Add an HTTP Header for authentication:
   - Key: `Authorization`
   - Value: `Bearer <YOUR_SECRET_TOKEN>` (This must match the `ELEVENLABS_WEBHOOK_SECRET` in your `.env` and App Hosting configuration).
6. Set the **Tool Schema**. You can copy and paste the contents of `elevenlabs_book_calendar_tool_schema.json` into the schema definition.

### Booking Webhook Behavior:
When the agent triggers the tool:
- The system verifies the authentication token.
- It looks up the business profile associated with the `agent_id`.
- If the phone number matches an existing lead, it updates that lead's status to "contacted" and adds a note.
- If it's a new phone number, it creates a new lead in the CRM.
- It logs the appointment in the `appointments` collection under the business profile.
- It returns a success message and a random booking reference to the agent, which the agent will read out to the customer.
