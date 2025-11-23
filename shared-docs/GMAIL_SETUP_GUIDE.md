# Gmail Workspace Integration Setup Guide

## Overview

This integration allows **your clients** (each account in the CRM) to connect their own Gmail Workspace accounts. Each client can:
- Connect their business Gmail Workspace
- Send emails from their company email address
- Maintain their own email branding and domain

**Note:** This integration works with **both personal Gmail accounts AND Gmail Workspace accounts**. Configure the OAuth consent screen as "External" to allow all Google accounts. See `GMAIL_OAUTH_CONFIGURATION.md` for detailed setup.

## Quick Start

### 1. Install Dependencies ✅
Already installed:
- `googleapis` - Google APIs client library
- `google-auth-library` - OAuth 2.0 authentication

### 2. Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Copy contents from: supabase/add-gmail-integration.sql
```

This creates:
- `email_providers` table
- RLS policies
- Indexes
- Trigger for updated_at

### 3. Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create or select a project

2. **Enable Gmail API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

3. **Configure OAuth Consent Screen** (IMPORTANT - Do this FIRST)
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select **External** user type (allows both personal Gmail and Workspace)
   - Fill in app information (name, support email, etc.)
   - Add required scopes:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/userinfo.email`
   - **For Testing**: Add test users (both personal Gmail and Workspace emails)
   - **For Production**: Submit for verification (allows any Google account)

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "CRM AI Pro - Gmail Integration"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/integrations/gmail/callback` (dev)
     - `https://your-domain.com/api/integrations/gmail/callback` (production)
   - **Note:** These credentials work for both personal Gmail and Workspace accounts

5. **Copy Credentials**
   - Copy Client ID
   - Copy Client Secret

### 5. Environment Variables

Add to `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/gmail/callback

# Encryption Key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-64-character-hex-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Generate Encryption Key

```bash
# Generate a secure encryption key
openssl rand -hex 32
```

Copy the output to `ENCRYPTION_KEY` in `.env.local`

### 7. Test the Integration

1. Start dev server: `npm run dev`
2. Navigate to: `/settings/integrations`
3. Click "Connect Gmail Account"
4. Authorize in Google
5. You'll be redirected back
6. Gmail should show as "Connected"

## How It Works

### OAuth Flow
1. Client (account owner/admin) clicks "Connect Gmail Workspace"
2. Redirected to Google OAuth consent screen
3. Client signs in with their **Gmail Workspace account**
4. Client authorizes access for their Workspace
5. Google redirects back with authorization code
6. Server exchanges code for access + refresh tokens
7. Tokens encrypted and stored in database **per account**
8. Each account has their own isolated Gmail integration

### Email Sending
1. System checks for Gmail provider **for the specific account**
2. If found, uses that account's Gmail Workspace to send
3. Emails sent from the client's business email address
4. If token expired, automatically refreshes
5. Falls back to Resend if Gmail not available for that account

### Token Management
- Access tokens expire (typically 1 hour)
- Refresh tokens are long-lived
- System automatically refreshes expired tokens
- Tokens encrypted with AES-256-GCM

## API Endpoints

### Authorize
```
GET /api/integrations/gmail/authorize
```
Returns OAuth URL for user to authorize

### Callback
```
GET /api/integrations/gmail/callback?code=...&state=...
```
Handles OAuth callback, stores tokens

### Send Email
```
POST /api/integrations/gmail/send
Body: { to, subject, html, text, ... }
```
Sends email via Gmail API

### Status
```
GET /api/integrations/gmail/status
```
Returns connection status and providers

## Security Notes

- ✅ Tokens encrypted at rest (AES-256-GCM)
- ✅ RLS policies ensure account isolation
- ✅ OAuth scopes limited to email sending/reading
- ✅ Refresh tokens stored securely
- ✅ Automatic token refresh prevents expiration issues

## Troubleshooting

### "Google OAuth credentials not configured"
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Restart dev server after adding env vars

### "Encryption key not configured"
- Generate key: `openssl rand -hex 32`
- Add to `ENCRYPTION_KEY` in `.env.local`
- Restart dev server

### "Gmail not connected"
- Run database migration first
- Check OAuth callback URL matches Google Console
- Verify redirect URI is correct

### Token Refresh Issues
- Check refresh token is stored correctly
- Verify encryption/decryption working
- Check token expiry dates in database

## Next Steps

1. ✅ Database migration
2. ✅ Google Cloud setup
3. ✅ Environment variables
4. ⏳ Test OAuth flow
5. ⏳ Test email sending
6. ⏳ Set as default provider (optional)

## Status: ✅ READY FOR SETUP

All code is complete. Follow the setup steps above to enable Gmail integration.

