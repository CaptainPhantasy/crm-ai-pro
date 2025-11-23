# Zapier MCP Setup for CRM-AI Pro

## Overview
This guide shows how to expose your CRM APIs to ElevenLabs via Zapier MCP using "Webhooks by Zapier" actions.

## How It Works
1. Create an MCP server on `mcp.zapier.com`
2. Add "Webhooks by Zapier" actions that call your CRM API endpoints
3. Connect ElevenLabs to the MCP server
4. ElevenLabs can now call your CRM APIs through Zapier

## Step 1: Create MCP Server on Zapier

1. Go to https://mcp.zapier.com
2. Click **"+ New MCP Server"**
3. Select **"Other"** as the client (since ElevenLabs isn't listed)
4. Name it: **"CRM-AI Pro"**
5. Click **"Create MCP Server"**

## Step 2: Add Webhook Tools

For each CRM API endpoint, add a "Webhooks by Zapier" action:

### Tool 1: Create Job
1. Click **"+ Add tool"**
2. Search for **"Webhooks by Zapier"**
3. Select **"POST"** action
4. Configure:
   - **URL**: `https://your-domain.com/api/jobs`
   - **Method**: `POST`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_BEARER_TOKEN
     Content-Type: application/json
     ```
   - **Data**: 
     ```json
     {
       "contactId": "{{contactId}}",
       "description": "{{description}}",
       "scheduledTime": "{{scheduledTime}}"
     }
     ```
5. Name the tool: **"create_job"**
6. Click **"Save"**

### Tool 2: Search Contacts
1. Click **"+ Add tool"**
2. Search for **"Webhooks by Zapier"**
3. Select **"GET"** action
4. Configure:
   - **URL**: `https://your-domain.com/api/contacts?search={{search}}`
   - **Method**: `GET`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_BEARER_TOKEN
     ```
5. Name the tool: **"search_contacts"**
6. Click **"Save"**

### Tool 3: Get Jobs
1. Click **"+ Add tool"**
2. Search for **"Webhooks by Zapier"**
3. Select **"GET"** action
4. Configure:
   - **URL**: `https://your-domain.com/api/jobs?status={{status}}`
   - **Method**: `GET`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_BEARER_TOKEN
     ```
5. Name the tool: **"get_jobs"**
6. Click **"Save"**

### Tool 4: Update Job Status
1. Click **"+ Add tool"**
2. Search for **"Webhooks by Zapier"**
3. Select **"PATCH"** action
4. Configure:
   - **URL**: `https://your-domain.com/api/jobs/{{jobId}}/status`
   - **Method**: `PATCH`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_BEARER_TOKEN
     Content-Type: application/json
     ```
   - **Data**: 
     ```json
     {
       "status": "{{status}}"
     }
     ```
5. Name the tool: **"update_job_status"**
6. Click **"Save"**

### Tool 5: Assign Technician
1. Click **"+ Add tool"**
2. Search for **"Webhooks by Zapier"**
3. Select **"PATCH"** action
4. Configure:
   - **URL**: `https://your-domain.com/api/jobs/{{jobId}}/assign`
   - **Method**: `PATCH`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_BEARER_TOKEN
     Content-Type: application/json
     ```
   - **Data**: 
     ```json
     {
       "techId": "{{techId}}"
     }
     ```
5. Name the tool: **"assign_tech"**
6. Click **"Save"**

### Tool 6: Send Email
1. Click **"+ Add tool"**
2. Search for **"Webhooks by Zapier"**
3. Select **"POST"** action
4. Configure:
   - **URL**: `https://your-domain.com/api/send-message`
   - **Method**: `POST`
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_BEARER_TOKEN
     Content-Type: application/json
     ```
   - **Data**: 
     ```json
     {
       "conversationId": "{{conversationId}}",
       "message": "{{message}}"
     }
     ```
5. Name the tool: **"send_email"**
6. Click **"Save"**

## Step 3: Get MCP Connection Details

1. Click the **"Connect"** tab in your MCP server
2. Copy the **MCP Server URL** (looks like: `https://mcp.zapier.com/mcp/servers/...`)
3. Copy the **API Key** (if provided)

## Step 4: Configure ElevenLabs

1. In ElevenLabs dashboard, go to your agent settings
2. Add MCP server:
   - **Server URL**: The URL from Step 3
   - **API Key**: The key from Step 3 (if required)
3. Save configuration

## Step 5: Test

1. In ElevenLabs, test with: **"Create a job for John Smith, plumbing repair, tomorrow at 2pm"**
2. Check the MCP server's **"History"** tab in Zapier to see if the call was made
3. Verify the job was created in your CRM

## Important Notes

### Authentication
- You'll need to generate a Bearer token for your CRM APIs
- Store this securely in Zapier's webhook configuration
- Consider using Zapier's "Code by Zapier" to dynamically generate tokens

### API Endpoints
Make sure these endpoints are publicly accessible:
- `/api/jobs` (POST, GET)
- `/api/jobs/[id]/status` (PATCH)
- `/api/jobs/[id]/assign` (PATCH)
- `/api/contacts` (GET)
- `/api/send-message` (POST)

### Rate Limits
- Zapier MCP uses 2 tasks per tool call
- Monitor your Zapier task quota
- Consider caching responses for read operations

## Alternative: Use Zapier's HTTP Action

If "Webhooks by Zapier" doesn't work, you can use Zapier's generic HTTP action:
1. Search for **"HTTP by Zapier"** instead
2. Configure the same way as above
3. This gives you more control over request formatting

## Troubleshooting

### Tools not showing in ElevenLabs
- Check that the MCP server is connected
- Verify the server URL is correct
- Check Zapier MCP server status

### API calls failing
- Verify the Bearer token is valid
- Check API endpoint URLs are correct
- Review Zapier MCP server History tab for error details
- Ensure your API endpoints accept the request format

### Authentication issues
- Regenerate Bearer token if expired
- Check token has correct permissions
- Verify Authorization header format

