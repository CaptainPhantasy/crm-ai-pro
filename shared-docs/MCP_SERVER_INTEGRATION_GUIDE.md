# MCP Server Integration Guide - Existing Deployment

## Your Current Setup

✅ **Deployed Website** - Next.js app is live  
✅ **Supabase** - Database and backend configured  
✅ **Storage Buckets** - Supabase Storage (job-photos bucket)

## Good News! 🎉

**The MCP server is already deployed** with your website! Since it's part of your Next.js app at `/api/mcp`, it's automatically available at:

```
https://your-deployed-domain.com/api/mcp
```

---

## Step 1: Verify MCP Server is Live

### Test the Health Check

```bash
# Replace with your actual domain
curl https://your-deployed-domain.com/api/mcp
```

**Expected Response:**
```json
{
  "success": true,
  "service": "mcp-server",
  "status": "running"
}
```

If you get this response, your MCP server is **already working**! ✅

---

## Step 2: Verify Environment Variables

The MCP server needs these environment variables in your hosting platform (Vercel, Netlify, etc.):

### Required Variables

```env
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (for send_email tool)
RESEND_API_KEY=your-resend-key
```

### Optional Variable

```env
# Account ID (has default, but set if you want specific account)
DEFAULT_ACCOUNT_ID=your-account-id
```

### How to Check/Set in Common Platforms

#### Vercel
1. Go to your project dashboard
2. Settings → Environment Variables
3. Verify all variables are set
4. Redeploy if you added new ones

#### Netlify
1. Site settings → Environment variables
2. Verify all variables are set
3. Redeploy if needed

#### Railway/Render
1. Project settings → Environment
2. Verify all variables are set
3. Redeploy if needed

---

## Step 3: Test MCP Server Tools

### List All Available Tools

```bash
curl -X POST https://your-deployed-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

**Expected Response:** Should list all 22 tools including:
- `create_job`
- `search_contacts`
- `get_dashboard_stats`
- `create_invoice`
- `list_job_photos`
- ... and 17 more

### Test a Tool (Get Dashboard Stats)

```bash
curl -X POST https://your-deployed-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_dashboard_stats",
      "arguments": {}
    }
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"jobs\":{\"total\":10,\"today\":2,\"completed\":5},\"revenue\":{\"total\":50000,\"today\":5000},\"contacts\":{\"total\":25,\"newThisMonth\":5},\"invoices\":{\"outstanding\":3,\"outstandingAmount\":15000}}"
      }
    ]
  }
}
```

---

## Step 4: Storage Buckets Integration

Your MCP server can work with your existing Supabase Storage buckets. The `list_job_photos` tool already uses your `job-photos` bucket.

### Verify Storage Bucket Setup

1. **Check Bucket Exists:**
   - Go to Supabase Dashboard → Storage
   - Verify `job-photos` bucket exists
   - Check if it's public or private

2. **Storage Policies (if private):**
   ```sql
   -- Allow service role to access (for MCP server)
   -- This is already handled by using service role key
   ```

3. **Test Photo Listing:**
   ```bash
   curl -X POST https://your-deployed-domain.com/api/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 3,
       "method": "tools/call",
       "params": {
         "name": "list_job_photos",
         "arguments": {
           "jobId": "your-job-id-here"
         }
       }
     }'
   ```

### Storage Bucket Configuration

The MCP server uses your existing Supabase Storage setup:

- **Bucket Name:** `job-photos` (as configured in your API routes)
- **Access:** Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- **Structure:** `job-photos/{jobId}/{timestamp}-{filename}`

**No additional configuration needed!** ✅

---

## Step 5: Connect External Clients

### ElevenLabs Voice Agent

Configure ElevenLabs to use your deployed MCP server:

```json
{
  "mcpServers": {
    "crm-ai-pro": {
      "url": "https://your-deployed-domain.com/api/mcp",
      "headers": {
        "x-api-key": "YOUR_OPTIONAL_API_KEY"
      }
    }
  }
}
```

### Other MCP Clients

Any MCP-compatible client can connect:

```typescript
const response = await fetch('https://your-deployed-domain.com/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_KEY' // Optional
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  })
})
```

---

## Step 6: Verify Everything Works

### Quick Test Checklist

- [ ] Health check returns success
- [ ] Tools list returns 22 tools
- [ ] `get_dashboard_stats` returns data
- [ ] `list_job_photos` works with your storage bucket
- [ ] `search_contacts` finds contacts from your database
- [ ] `create_job` creates jobs in your database

### Test Script

Save this as `test-mcp-server.sh`:

```bash
#!/bin/bash

DOMAIN="https://your-deployed-domain.com"

echo "Testing MCP Server at $DOMAIN/api/mcp"
echo ""

# Health check
echo "1. Health Check:"
curl -s "$DOMAIN/api/mcp" | jq .
echo ""

# List tools
echo "2. List Tools:"
curl -s -X POST "$DOMAIN/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools | length'
echo " tools found"
echo ""

# Get dashboard stats
echo "3. Get Dashboard Stats:"
curl -s -X POST "$DOMAIN/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_dashboard_stats","arguments":{}}}' | jq '.result.content[0].text' | jq .
echo ""

echo "✅ All tests complete!"
```

Run it:
```bash
chmod +x test-mcp-server.sh
./test-mcp-server.sh
```

---

## Troubleshooting

### Issue: 404 Not Found

**Problem:** `/api/mcp` returns 404

**Solution:**
1. Verify your Next.js app is deployed
2. Check that `app/api/mcp/route.ts` exists
3. Rebuild and redeploy your app

### Issue: 500 Internal Server Error

**Problem:** Server returns 500 error

**Solution:**
1. Check environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
2. Check server logs for detailed error
3. Verify Supabase connection works

### Issue: Tools Not Found

**Problem:** Tools list is empty or missing tools

**Solution:**
1. Verify `lib/mcp/tools/crm-tools.ts` is updated
2. Check `lib/mcp/tools/index.ts` registers all tools
3. Rebuild and redeploy

### Issue: Storage Access Denied

**Problem:** `list_job_photos` fails

**Solution:**
1. Verify `job-photos` bucket exists in Supabase
2. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Verify bucket is accessible (public or has proper policies)

---

## What's Already Working

Since your website is deployed, these are **already available**:

✅ **MCP Server Endpoint** - `/api/mcp`  
✅ **22 Tools** - All CRM operations  
✅ **Supabase Integration** - Database access  
✅ **Storage Integration** - Works with your buckets  
✅ **Email Integration** - If Resend is configured  

---

## Next Steps

1. ✅ **Verify** - Test health check endpoint
2. ✅ **Test Tools** - Run a few tool calls
3. ✅ **Connect Clients** - Configure ElevenLabs or other clients
4. ✅ **Monitor** - Watch for errors in logs
5. ✅ **Use** - Start using the MCP server with your voice agent!

---

## Summary

**Your MCP server is already deployed!** 🎉

- **Endpoint:** `https://your-deployed-domain.com/api/mcp`
- **Status:** Should be working if your website is live
- **Storage:** Already integrated with your Supabase buckets
- **Database:** Already connected to your Supabase database

**Just verify it's working and start using it!**

