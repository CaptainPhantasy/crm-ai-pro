# MCP Server Deployment Guide

## Overview

The CRM-AI Pro platform has **two MCP server implementations**:

1. **HTTP-based MCP Server** - Integrated into Next.js app (`/api/mcp`)
2. **stdio-based MCP Server** - Standalone process (`mcp-server/index.ts`)

---

## Option 1: HTTP-based MCP Server (Recommended)

The HTTP-based MCP server is **automatically deployed** with your Next.js application. No separate deployment needed!

### How It Works

- **Endpoint:** `https://your-domain.com/api/mcp`
- **Protocol:** JSON-RPC 2.0 over HTTP POST
- **Authentication:** `x-api-key` header (optional, for user context)

### Deployment Steps

#### 1. Deploy Next.js App

The MCP server deploys automatically when you deploy your Next.js app to:
- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Any Node.js hosting**

```bash
# Build and deploy
npm run build
npm run start
```

#### 2. Set Environment Variables

Add these to your hosting platform's environment variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Account (Optional - has default)
DEFAULT_ACCOUNT_ID=your-account-id

# Email (Required for send_email tool)
RESEND_API_KEY=your-resend-key
```

#### 3. Verify Deployment

```bash
# Health check
curl https://your-domain.com/api/mcp

# Should return:
# {"success":true,"service":"mcp-server","status":"running"}
```

#### 4. Test MCP Server

```bash
# List all available tools
curl -X POST https://your-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'

# Call a tool (example: get dashboard stats)
curl -X POST https://your-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
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

### Integration with Clients

#### ElevenLabs Voice Agent

Configure ElevenLabs to use the HTTP endpoint:

```json
{
  "mcpServers": {
    "crm-ai-pro": {
      "url": "https://your-domain.com/api/mcp",
      "headers": {
        "x-api-key": "YOUR_API_KEY"
      }
    }
  }
}
```

#### Other MCP Clients

Any MCP-compatible client can connect via HTTP:

```typescript
const response = await fetch('https://your-domain.com/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  })
})
```

---

## Option 2: stdio-based MCP Server (Standalone)

The stdio-based server runs as a standalone process, useful for:
- Local development
- CLI tools
- Services that require stdio communication

### Deployment Steps

#### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

#### 2. Set Environment Variables

Create `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEFAULT_ACCOUNT_ID=your-account-id
RESEND_API_KEY=your-resend-key
```

#### 3. Run the Server

```bash
# Development (with watch)
npm run dev

# Production
npm start
```

The server runs on stdio and waits for MCP protocol messages.

### Integration with ElevenLabs

Configure ElevenLabs to use the stdio server:

```json
{
  "mcpServers": {
    "crm-ai-pro": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/CRM-AI-PRO/mcp-server/index.ts"],
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

### Deploying as a Service

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start server
cd mcp-server
pm2 start index.ts --interpreter tsx --name mcp-server

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

#### Using systemd (Linux)

Create `/etc/systemd/system/mcp-server.service`:

```ini
[Unit]
Description=CRM AI Pro MCP Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/CRM-AI-PRO/mcp-server
Environment="SUPABASE_URL=https://your-project.supabase.co"
Environment="SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
Environment="DEFAULT_ACCOUNT_ID=your-account-id"
Environment="RESEND_API_KEY=your-resend-key"
ExecStart=/usr/bin/npx tsx index.ts
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable mcp-server
sudo systemctl start mcp-server
```

#### Using Docker

Create `Dockerfile` in `mcp-server/`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npx", "tsx", "index.ts"]
```

Build and run:

```bash
docker build -t crm-ai-pro-mcp-server .
docker run -d \
  --name mcp-server \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  -e DEFAULT_ACCOUNT_ID=your-account-id \
  -e RESEND_API_KEY=your-resend-key \
  crm-ai-pro-mcp-server
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `RESEND_API_KEY` | Resend API key for emails | `re_xxx...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEFAULT_ACCOUNT_ID` | Default account ID for operations | `fde73a6a-ea84-46a7-803b-a3ae7cc09d00` |

---

## Security Considerations

### 1. API Key Authentication

The HTTP-based server accepts an optional `x-api-key` header for user context. For production:

- **Generate secure API keys** for each client
- **Store keys securely** (environment variables, secrets manager)
- **Rotate keys regularly**
- **Use HTTPS** for all connections

### 2. Service Role Key

The MCP server uses Supabase service role key which **bypasses RLS policies**. This is necessary for the server to function, but:

- ✅ **Keep service role key secret** - Never commit to git
- ✅ **Use environment variables** - Don't hardcode
- ✅ **Limit access** - Only trusted services should have this key
- ✅ **Monitor usage** - Watch for unusual activity

### 3. Account Isolation

The server uses `DEFAULT_ACCOUNT_ID` for operations. For multi-tenant scenarios:

- Consider adding account ID to tool parameters
- Implement account validation
- Add audit logging

---

## Testing After Deployment

### 1. Health Check

```bash
curl https://your-domain.com/api/mcp
```

Expected response:
```json
{
  "success": true,
  "service": "mcp-server",
  "status": "running"
}
```

### 2. List Tools

```bash
curl -X POST https://your-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

Should return all 22 tools.

### 3. Test Tool Execution

```bash
# Test get_dashboard_stats
curl -X POST https://your-domain.com/api/mcp \
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

### 4. Test Error Handling

```bash
# Test with invalid tool name
curl -X POST https://your-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "invalid_tool",
      "arguments": {}
    }
  }'
```

---

## Troubleshooting

### Issue: Server returns 500 error

**Check:**
1. Environment variables are set correctly
2. Supabase service role key is valid
3. Account ID exists in database
4. Check server logs for detailed error

### Issue: Tools not found

**Check:**
1. Verify `lib/mcp/tools/crm-tools.ts` is updated
2. Check `lib/mcp/tools/index.ts` registers all tools
3. Rebuild Next.js app if needed

### Issue: Authentication fails

**Check:**
1. `x-api-key` header is set (if required)
2. API key is valid
3. CORS is configured if calling from browser

### Issue: Database errors

**Check:**
1. Supabase URL is correct
2. Service role key has proper permissions
3. Tables exist in database
4. RLS policies allow service role access

---

## Monitoring

### Recommended Monitoring

1. **Health Checks** - Monitor `/api/mcp` GET endpoint
2. **Error Rates** - Track 500 errors
3. **Response Times** - Monitor tool execution times
4. **Usage Metrics** - Track which tools are used most

### Logging

The server logs errors to console. For production:

- Use structured logging (JSON)
- Log all tool calls with parameters
- Log errors with stack traces
- Set up log aggregation (e.g., Datadog, LogRocket)

---

## Next Steps

1. ✅ Deploy Next.js app (HTTP server deploys automatically)
2. ✅ Set environment variables
3. ✅ Test health check endpoint
4. ✅ Test tool execution
5. ✅ Configure ElevenLabs or other MCP clients
6. ✅ Monitor usage and errors

---

## Summary

- **HTTP-based server**: Deploys automatically with Next.js app ✅
- **stdio-based server**: Requires separate deployment (PM2, systemd, Docker)
- **Environment variables**: Required for both
- **Testing**: Use curl commands to verify deployment
- **Security**: Keep service role key secret, use HTTPS

**Recommended**: Use the HTTP-based server (Option 1) as it's simpler and deploys automatically with your Next.js app.

