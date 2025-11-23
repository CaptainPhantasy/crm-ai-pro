/**
 * Microsoft OAuth 2.0 Authentication Utilities
 * Uses Microsoft Identity Platform (Azure AD)
 */

import { ConfidentialClientApplication } from '@azure/msal-node'

// Microsoft Graph API Scopes
export const MICROSOFT_SCOPES = [
  'https://graph.microsoft.com/Mail.Send',
  'https://graph.microsoft.com/Mail.Read',
  'https://graph.microsoft.com/User.Read',
]

/**
 * Create MSAL client for Microsoft OAuth
 */
export function createMicrosoftOAuthClient(): ConfidentialClientApplication {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common' // 'common' for multi-tenant

  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth credentials not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET')
  }

  return new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${tenantId}`,
    },
  })
}

/**
 * Generate OAuth authorization URL
 */
export async function getMicrosoftAuthUrl(state?: string): Promise<string> {
  const msalClient = createMicrosoftOAuthClient()
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || 
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/microsoft/callback`

  const authCodeUrlParameters = {
    scopes: MICROSOFT_SCOPES,
    redirectUri,
    state: state || undefined,
    prompt: 'consent', // Force consent to get refresh token
  }

  const response = await msalClient.getAuthCodeUrl(authCodeUrlParameters)
  return response
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const msalClient = createMicrosoftOAuthClient()
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || 
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/microsoft/callback`

  const tokenRequest = {
    code,
    scopes: MICROSOFT_SCOPES,
    redirectUri,
  }

  const response = await msalClient.acquireTokenByCode(tokenRequest)

  return {
    accessToken: response?.accessToken || '',
    refreshToken: response?.refreshToken || '',
    expiryDate: response?.expiresOn ? new Date(response.expiresOn.getTime()) : null,
    account: response?.account,
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  const msalClient = createMicrosoftOAuthClient()

  const tokenRequest = {
    refreshToken,
    scopes: MICROSOFT_SCOPES,
  }

  const response = await msalClient.acquireTokenByRefreshToken(tokenRequest)

  if (!response?.accessToken) {
    throw new Error('Failed to refresh Microsoft access token')
  }

  return {
    accessToken: response.accessToken,
    expiryDate: response.expiresOn ? new Date(response.expiresOn.getTime()) : null,
  }
}

/**
 * Get user info from access token
 */
export async function getUserInfo(accessToken: string) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info from Microsoft Graph')
  }

  const data = await response.json()
  return {
    email: data.mail || data.userPrincipalName,
    name: data.displayName,
    id: data.id,
  }
}

