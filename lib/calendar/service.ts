import { createGoogleCalendarEvent, listGoogleCalendarEvents, updateGoogleCalendarEvent, deleteGoogleCalendarEvent, refreshGoogleAccessToken } from './google'
import { createMicrosoftCalendarEvent, listMicrosoftCalendarEvents, updateMicrosoftCalendarEvent, deleteMicrosoftCalendarEvent, refreshMicrosoftAccessToken } from './microsoft'
import { createClient } from '@supabase/supabase-js'
import { decrypt, encrypt } from '@/lib/gmail/encryption'

export interface CalendarEvent {
  title: string
  description?: string
  startTime: string // ISO 8601
  endTime: string // ISO 8601
  location?: string
  contactId?: string
  jobId?: string
  conversationId?: string
}

export interface CalendarProvider {
  id: string
  provider: 'google' | 'microsoft'
  providerEmail: string
  accessToken: string
  refreshToken: string
  expiresAt: Date | null
}

export async function getCalendarProvider(
  accountId: string,
  userId?: string
): Promise<CalendarProvider | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let query = supabase
    .from('calendar_providers')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true)

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.is('user_id', null)
  }

  query = query.order('is_default', { ascending: false })

  const { data: providers } = await query

  if (!providers || providers.length === 0) {
    return null
  }

  const selectedProvider = providers.find(p => p.is_default) || providers[0]

  // Check if token expired
  const expiresAt = selectedProvider.token_expires_at
    ? new Date(selectedProvider.token_expires_at)
    : null
  const now = new Date()

  let accessToken = decrypt(selectedProvider.access_token_encrypted)
  const refreshToken = decrypt(selectedProvider.refresh_token_encrypted)

  // Refresh token if expired
  if (expiresAt && expiresAt <= now) {
    try {
      const refreshed =
        selectedProvider.provider === 'google'
          ? await refreshGoogleAccessToken(refreshToken)
          : await refreshMicrosoftAccessToken(refreshToken)

      accessToken = refreshed.accessToken

      // Update stored token
      const encryptedAccess = encrypt(refreshed.accessToken)
      await supabase
        .from('calendar_providers')
        .update({
          access_token_encrypted: encryptedAccess,
          token_expires_at: refreshed.expiryDate.toISOString(),
        })
        .eq('id', selectedProvider.id)
    } catch (error) {
      console.error('Failed to refresh calendar token:', error)
      throw error
    }
  }

  return {
    id: selectedProvider.id,
    provider: selectedProvider.provider,
    providerEmail: selectedProvider.provider_email,
    accessToken,
    refreshToken,
    expiresAt,
  }
}

export async function createCalendarEvent(
  accountId: string,
  event: CalendarEvent,
  userId?: string
): Promise<{ id: string; link?: string }> {
  const provider = await getCalendarProvider(accountId, userId)

  if (!provider) {
    throw new Error('No calendar provider configured')
  }

  // Create event in provider's calendar
  let result
  if (provider.provider === 'google') {
    result = await createGoogleCalendarEvent(provider.accessToken, {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime,
        timeZone: 'America/Indiana/Indianapolis',
      },
      end: {
        dateTime: event.endTime,
        timeZone: 'America/Indiana/Indianapolis',
      },
      location: event.location,
    })
  } else {
    result = await createMicrosoftCalendarEvent(provider.accessToken, {
      subject: event.title,
      body: event.description
        ? {
            contentType: 'text',
            content: event.description,
          }
        : undefined,
      start: {
        dateTime: event.startTime,
        timeZone: 'America/Indiana/Indianapolis',
      },
      end: {
        dateTime: event.endTime,
        timeZone: 'America/Indiana/Indianapolis',
      },
      location: event.location
        ? {
            displayName: event.location,
          }
        : undefined,
    })
  }

  // Store event in database
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: calendarEvent } = await supabase
    .from('calendar_events')
    .insert({
      account_id: accountId,
      provider: provider.provider,
      provider_event_id: result.id,
      title: event.title,
      description: event.description,
      start_time: event.startTime,
      end_time: event.endTime,
      location: event.location,
      contact_id: event.contactId,
      job_id: event.jobId,
      conversation_id: event.conversationId,
    })
    .select()
    .single()

  return {
    id: calendarEvent?.id || result.id,
    link: result.htmlLink || result.webLink,
  }
}

export async function listCalendarEvents(
  accountId: string,
  startDate?: string,
  endDate?: string,
  userId?: string
): Promise<CalendarEvent[]> {
  const provider = await getCalendarProvider(accountId, userId)

  if (!provider) {
    // Fallback to database-only events
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('account_id', accountId)

    if (startDate) {
      query = query.gte('start_time', startDate)
    }
    if (endDate) {
      query = query.lte('end_time', endDate)
    }

    const { data: events } = await query

    return (events || []).map((e) => ({
      title: e.title,
      description: e.description,
      startTime: e.start_time,
      endTime: e.end_time,
      location: e.location,
      contactId: e.contact_id,
      jobId: e.job_id,
      conversationId: e.conversation_id,
    }))
  }

  // Sync from provider
  let providerEvents
  if (provider.provider === 'google') {
    providerEvents = await listGoogleCalendarEvents(
      provider.accessToken,
      startDate,
      endDate
    )
  } else {
    providerEvents = await listMicrosoftCalendarEvents(
      provider.accessToken,
      startDate,
      endDate
    )
  }

  // Map provider events to our format
  return providerEvents.map((e: any) => ({
    title: e.summary || e.subject,
    description: e.description || e.body?.content,
    startTime: e.start.dateTime || e.start.dateTime,
    endTime: e.end.dateTime || e.end.dateTime,
    location: e.location || e.location?.displayName,
  }))
}

