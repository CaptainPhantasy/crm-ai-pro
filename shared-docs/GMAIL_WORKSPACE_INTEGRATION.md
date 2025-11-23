# Gmail Workspace Integration - Client-Facing

## Overview

This integration allows **each client account** in your CRM to connect their own Gmail Workspace account. This enables:

- **Multi-tenant support**: Each client connects their own Workspace
- **Business email sending**: Clients send from their company email domain
- **Account isolation**: Each account's Gmail integration is completely separate
- **Workspace-specific**: Designed for Gmail Workspace (business accounts), not personal Gmail

## Architecture

### Account-Level Integration

```
Account A (Client 1)
  └─ Gmail Workspace: client1@company1.com
     └─ OAuth tokens stored per account
     └─ Emails sent from client1@company1.com

Account B (Client 2)
  └─ Gmail Workspace: client2@company2.com
     └─ OAuth tokens stored per account
     └─ Emails sent from client2@company2.com
```

### Database Structure

- `email_providers` table stores OAuth tokens **per account**
- `account_id` ensures complete isolation
- Each account can have multiple providers (Gmail, Resend, etc.)
- One default provider per account

### OAuth Flow

1. **Client initiates connection** (account owner/admin)
   - Navigates to `/settings/integrations`
   - Clicks "Connect Gmail Workspace"

2. **OAuth authorization**
   - Redirected to Google OAuth
   - Signs in with **their Gmail Workspace account**
   - Authorizes access for their Workspace

3. **Token storage**
   - Tokens stored with `account_id` in `email_providers`
   - Encrypted at rest
   - Isolated per account

4. **Email sending**
   - System uses account's Gmail Workspace
   - Emails sent from client's business email
   - Automatic token refresh

## Setup Requirements

### For You (Platform Owner)

1. **Google Cloud Console Setup**
   - Create OAuth 2.0 credentials
   - These credentials are shared by all clients
   - Each client authorizes their own Workspace

2. **Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=your-shared-client-id
   GOOGLE_CLIENT_SECRET=your-shared-client-secret
   GOOGLE_REDIRECT_URI=https://your-domain.com/api/integrations/gmail/callback
   ENCRYPTION_KEY=your-encryption-key
   ```

### For Your Clients

1. **Gmail Workspace Account**
   - Must have a Gmail Workspace (not personal Gmail)
   - Admin or user with email sending permissions

2. **Connection Process**
   - Go to Settings > Integrations
   - Click "Connect Gmail Workspace"
   - Sign in with Workspace account
   - Authorize access

## Security & Isolation

✅ **Account Isolation**
- Each account's tokens stored separately
- RLS policies ensure account-level access
- No cross-account token access

✅ **Token Security**
- Tokens encrypted with AES-256-GCM
- Stored per account in `email_providers`
- Automatic refresh on expiry

✅ **OAuth Scopes**
- Limited to email sending and reading
- No access to other Google services
- Client controls their own authorization

## Use Cases

### Scenario 1: Multiple Clients
- Client A connects `support@companyA.com`
- Client B connects `info@companyB.com`
- Each sends from their own domain
- Complete isolation

### Scenario 2: Multiple Workspaces per Account
- Account can connect multiple Workspace accounts
- Can set default provider
- Useful for departments or teams

### Scenario 3: Fallback to Resend
- If Gmail not connected, uses Resend
- Can use both (Gmail for replies, Resend for campaigns)
- Flexible provider selection

## API Endpoints

All endpoints are account-scoped:

- `GET /api/integrations/gmail/authorize` - Get OAuth URL (uses account from session)
- `GET /api/integrations/gmail/callback` - Handle OAuth (stores per account)
- `POST /api/integrations/gmail/send` - Send email (uses account's Gmail)
- `GET /api/integrations/gmail/status` - Check connection (account-specific)

## Benefits

1. **Client Control**: Each client manages their own email
2. **Brand Consistency**: Emails from client's domain
3. **Isolation**: Complete separation between accounts
4. **Flexibility**: Can use Gmail or Resend per account
5. **Scalability**: Works for unlimited client accounts

## Important Notes

⚠️ **Gmail Workspace Required**
- Personal Gmail accounts won't work
- Client must have Workspace access
- Admin permissions may be required

⚠️ **OAuth Credentials**
- You (platform) provide the OAuth app
- Clients authorize their own Workspaces
- One OAuth app serves all clients

⚠️ **Token Management**
- Tokens stored per account
- Automatic refresh handled
- Client can disconnect anytime

## Status: ✅ Ready for Client Use

The integration is fully implemented and ready for your clients to connect their Gmail Workspace accounts!

