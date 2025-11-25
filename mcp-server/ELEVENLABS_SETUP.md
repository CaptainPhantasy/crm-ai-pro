# ElevenLabs MCP Server Configuration

## Overview

This MCP server provides natural language access to your CRM through ElevenLabs voice agents. The agent (Carl) can have full conversations to create jobs, search contacts, update statuses, and send emails.

## Setup

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment

Create `.env` file:
```env
SUPABASE_URL=https://expbvujyegxmxvatcjqt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEFAULT_ACCOUNT_ID=fde73a6a-ea84-46a7-803b-a3ae7cc09d00
RESEND_API_KEY=your-resend-key
```

### 3. Test the Server

```bash
npm start
```

The server runs on stdio and will wait for MCP protocol messages.

## ElevenLabs Configuration

In your ElevenLabs agent settings, configure the MCP server connection:

### ElevenLabs Agent Configuration (Production)

Your agent `agent_6501katrbe2re0c834kfes3hvk2d` should be configured with:

**MCP Server URL**: `https://your-domain.com/api/mcp`

**Request Headers**:
```
Authorization: Bearer sb_publishable_PVtLOJSfyLR9b0-_4cwk3g_3BvFVflj
```

### Development Configuration

For local development, configure your ElevenLabs agent to connect to:
- **URL**: `http://localhost:3000/api/mcp`
- **Headers**: `Authorization: Bearer test-token` (or your actual auth token)

### CRM Integration

The voice agent is now embedded directly in the CRM interface using the ElevenLabs ConVA widget:

```html
<elevenlabs-convai agent-id="agent_6501katrbe2re0c834kfes3hvk2d"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
```

This allows users to interact with the voice agent while using the CRM normally, rather than in a separate demo interface.

### Option 2: Direct Command (Local Development)

For local development using stdio-based MCP server:

```json
{
  "mcpServers": {
    "crm-ai-pro": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/CRM-AI-PRO/mcp-server/index.ts"],
      "env": {
        "SUPABASE_URL": "https://expbvujyegxmxvatcjqt.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "DEFAULT_ACCOUNT_ID": "fde73a6a-ea84-46a7-803b-a3ae7cc09d00",
        "RESEND_API_KEY": "your-resend-key"
      }
    }
  }
}
```

## Example Conversation Flow

**User:** "Create a new job, Carl"

**Carl (using create_job tool):** "Okay, creating new job. What's the name of the customer?"

**User:** "John Smith"

**Carl:** "What's the address?"

**User:** "123 Main St"

**Carl:** "What work needs to be done?"

**User:** "Fix leaky faucet"

**Carl:** "Okay, we've got that. New job created. It's job number 97453. Would you like to assign a technician or add more customer information?"

**User:** "No, but go ahead and send that job information over to my email, Carl"

**Carl (using get_user_email tool):** "Okay, great. Alex, I've got your email as alex.smith@gmail.com. Is this correct?"

**User:** "Yes, Carl. That's correct."

**Carl (using send_email tool):** "I'm sending now."

## Available Tools

### create_job
Creates a new job/work order. The agent will ask for:
- Contact name (required)
- Description (required)
- Scheduled time (optional)
- Technician (optional)

### search_contacts
Search for contacts by name, email, or phone.

### get_job
Get details of a specific job by ID.

### update_job_status
Update job status (lead → scheduled → en_route → in_progress → completed → invoiced → paid).

### assign_tech
Assign a technician to a job by name.

### send_email
Send an email with job information or other content.

### get_user_email
Get the account owner's email address.

## Troubleshooting

### Server won't start
- Check that all environment variables are set
- Verify Supabase credentials are correct
- Ensure Node.js 18+ is installed

### Tools not appearing in ElevenLabs
- Verify the MCP server path is absolute
- Check that the server starts without errors
- Review ElevenLabs logs for connection issues

### Tool calls failing
- Verify Supabase service role key has proper permissions
- Check that account ID exists in database
- Review edge function logs for errors

