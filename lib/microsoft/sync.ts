/**
 * Microsoft Email Sync Service
 * Syncs emails from Microsoft 365/Outlook and extracts contact information
 */

import { Client } from '@microsoft/microsoft-graph-client'
import { refreshAccessToken } from './auth'

export interface MicrosoftMessage {
  id: string
  conversationId: string
  subject: string
  bodyPreview: string
  from: {
    emailAddress: {
      address: string
      name: string | null
    }
  }
  toRecipients: Array<{
    emailAddress: {
      address: string
      name: string | null
    }
  }>
  ccRecipients?: Array<{
    emailAddress: {
      address: string
      name: string | null
    }
  }>
  body: {
    contentType: string
    content: string
  }
  receivedDateTime: string
  internetMessageHeaders?: Array<{
    name: string
    value: string
  }>
}

export interface ParsedEmail {
  messageId: string
  threadId: string
  from: {
    email: string
    name: string | null
  }
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string | null
  bodyText: string | null
  bodyHtml: string | null
  date: Date
  inReplyTo: string | null
  references: string | null
}

/**
 * Get Microsoft Graph client
 */
function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: {
      getAccessToken: async () => accessToken,
    },
  })
}

/**
 * Fetch messages from Microsoft Graph
 */
export async function fetchMicrosoftMessages(
  accessToken: string,
  refreshToken: string,
  options: {
    maxResults?: number
    filter?: string
    top?: number
  } = {}
): Promise<{
  messages: MicrosoftMessage[]
  nextLink?: string
}> {
  try {
    const client = getGraphClient(accessToken)

    const top = options.top || options.maxResults || 50
    let url = `/me/messages?$top=${top}&$orderby=receivedDateTime desc`

    if (options.filter) {
      url += `&$filter=${encodeURIComponent(options.filter)}`
    }

    const response = await client.api(url).get()

    return {
      messages: response.value || [],
      nextLink: response['@odata.nextLink'],
    }
  } catch (error: any) {
    // If token expired, refresh and retry
    if (error.statusCode === 401 || error.code === 'InvalidAuthenticationToken') {
      const refreshed = await refreshAccessToken(refreshToken)
      return fetchMicrosoftMessages(refreshed.accessToken, refreshToken, options)
    }

    throw error
  }
}

/**
 * Parse Microsoft message into structured format
 */
export function parseMicrosoftMessage(message: MicrosoftMessage): ParsedEmail {
  const getHeader = (name: string): string | null => {
    if (!message.internetMessageHeaders) return null
    const header = message.internetMessageHeaders.find(h => h.name.toLowerCase() === name.toLowerCase())
    return header?.value || null
  }

  const from = {
    email: message.from.emailAddress.address,
    name: message.from.emailAddress.name,
  }

  const to = message.toRecipients.map(r => r.emailAddress.address)
  const cc = message.ccRecipients?.map(r => r.emailAddress.address)

  const bodyContent = message.body.content || ''
  const isHtml = message.body.contentType === 'html'

  return {
    messageId: message.id,
    threadId: message.conversationId || '',
    from,
    to,
    cc,
    bcc: undefined, // Microsoft Graph doesn't expose BCC in list view
    subject: message.subject,
    bodyText: isHtml ? null : bodyContent,
    bodyHtml: isHtml ? bodyContent : null,
    date: new Date(message.receivedDateTime),
    inReplyTo: getHeader('In-Reply-To'),
    references: getHeader('References'),
  }
}

/**
 * Sync emails from Microsoft for an account
 */
export async function syncMicrosoftEmails(
  accessToken: string,
  refreshToken: string,
  accountId: string,
  options: {
    syncFrom?: Date
    maxMessages?: number
  } = {}
): Promise<MicrosoftMessage[]> {
  // Build filter for date range
  let filter = ''
  if (options.syncFrom) {
    const dateStr = options.syncFrom.toISOString()
    filter = `receivedDateTime ge ${dateStr}`
  }

  // Fetch messages
  const { messages } = await fetchMicrosoftMessages(accessToken, refreshToken, {
    maxResults: options.maxMessages || 100,
    filter,
  })

  return messages
}

