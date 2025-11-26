# CRM AI Pro MCP Server

MCP (Model Context Protocol) server for ElevenLabs voice agent integration.

## Setup

1. Install dependencies:
```bash
cd mcp-server
npm install
```

2. Create `.env` file:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEFAULT_ACCOUNT_ID=your-account-id
RESEND_API_KEY=your-resend-key
```

3. Run the server:
```bash
npm start
```

## ElevenLabs Configuration

In your ElevenLabs agent configuration, add this MCP server:

```json
{
  "mcpServers": {
    "crm-ai-pro": {
      "command": "node",
      "args": ["/path/to/CRM-AI-PRO/mcp-server/index.ts"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key",
        "DEFAULT_ACCOUNT_ID": "your-account-id",
        "RESEND_API_KEY": "your-resend-key"
      }
    }
  }
}
```

## Available Tools

- `create_job` - Create a new job/work order
- `search_contacts` - Search for contacts
- `get_job` - Get job details
- `update_job_status` - Update job status
- `assign_tech` - Assign technician to job
- `send_email` - Send email
- `get_user_email` - Get user's email address
- `navigate` - Navigate the user to a different page in the CRM (inbox, jobs, contacts, analytics, finance, tech, campaigns, email-templates, tags, settings, integrations)
- `get_current_page` - Get information about what page the user is currently viewing

## Usage

The voice agent (Carl) can now:
- Create jobs through natural conversation
- Ask follow-up questions to collect required information
- Search contacts by name
- Update job status
- Assign technicians
- Send emails with job information

Example conversation:
- User: "Create a new job, Carl"
- Carl: "Okay, creating new job. What's the name of the customer?"
- User: "John Smith"
- Carl: "What's the address?"
- User: "123 Main St"
- Carl: "What work needs to be done?"
- User: "Fix leaky faucet"
- Carl: "Okay, we've got that. New job created. It's job number 97453. Would you like to assign a technician or add more customer information?"

