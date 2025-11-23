# Gmail OAuth Configuration - Allowing Personal Gmail Accounts

## Issue

By default, Google Cloud Console OAuth apps may be restricted to only Gmail Workspace accounts. To allow **both personal Gmail accounts AND Workspace accounts**, you need to configure the OAuth consent screen correctly.

## Solution: Configure OAuth Consent Screen

### Step 1: Access OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **OAuth consent screen**

### Step 2: Configure User Type

**Option A: External (Recommended for Multi-Client Platform)**

1. Select **External** user type
   - This allows ANY Google account (personal Gmail, Workspace, etc.)
   - Required for a multi-tenant application where clients connect their own accounts

2. Click **Create**

3. Fill in App Information:
   - **App name**: Your CRM platform name (e.g., "CRM AI Pro")
   - **User support email**: Your support email
   - **App logo**: (Optional) Your app logo
   - **Application home page**: Your app URL
   - **Application privacy policy link**: (Required for production)
   - **Application terms of service link**: (Required for production)
   - **Authorized domains**: Your domain (e.g., `yourdomain.com`)

4. **Scopes** (Add these):
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`

5. **Test users** (For Testing mode):
   - Add test Gmail addresses (personal or Workspace)
   - Only these users can connect during testing
   - Remove this restriction when publishing

### Step 3: Publishing Status

**For Development/Testing:**
- Keep app in **Testing** mode
- Add test users who can connect
- Works for both personal Gmail and Workspace accounts in test list

**For Production:**
- Submit app for **Verification** (if using sensitive scopes)
- Google will review your app
- Once verified, ANY Google account can connect
- No test user list needed

### Step 4: OAuth Client Configuration

1. Go to **APIs & Services** > **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Verify **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/integrations/gmail/callback
   https://your-domain.com/api/integrations/gmail/callback
   ```
4. **Application type**: Web application
5. **Authorized JavaScript origins** (if needed):
   ```
   http://localhost:3000
   https://your-domain.com
   ```

## Important Notes

### Personal Gmail vs Workspace

- **Personal Gmail** (`@gmail.com`): Works with External user type
- **Gmail Workspace** (`@company.com`): Also works with External user type
- **Both work** when OAuth consent screen is set to External

### Testing Mode Limitations

- In **Testing** mode, only users in the test list can connect
- Add both personal Gmail and Workspace emails to test list
- Once published/verified, any Google account can connect

### Verification Requirements

For production use with sensitive scopes:
- Privacy policy URL (required)
- Terms of service URL (required)
- App verification process
- May take 1-2 weeks for Google review

## Quick Fix for Testing

If you're in testing mode and want to allow personal Gmail:

1. Go to OAuth consent screen
2. Scroll to **Test users**
3. Click **+ ADD USERS**
4. Add the personal Gmail address you want to test with
5. Save
6. Try connecting again

## Verification Checklist

- [ ] OAuth consent screen set to **External** (not Internal)
- [ ] Test users added (if in Testing mode)
- [ ] All required scopes added
- [ ] Redirect URI matches exactly
- [ ] App information filled in
- [ ] Privacy policy and terms links (for production)

## Common Issues

### "Access blocked: This app's request is invalid"
- Check redirect URI matches exactly
- Verify OAuth client ID/secret are correct
- Check scopes are authorized

### "This app isn't verified"
- Normal in Testing mode
- Users will see warning but can proceed
- Submit for verification for production

### "User not in test list"
- Add user email to test users list
- Or publish app (requires verification)

## Code Status

✅ **The code already supports both personal Gmail and Workspace accounts**

The restriction is **only** in Google Cloud Console configuration, not in the application code. Once you configure the OAuth consent screen correctly, both types of accounts will work.

