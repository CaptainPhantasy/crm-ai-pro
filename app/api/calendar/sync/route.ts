import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth-helper'
import { listCalendarEvents } from '@/lib/calendar/service'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { startDate, endDate } = body

    // Get user's account ID
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: user } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Sync events from calendar provider
    const events = await listCalendarEvents(
      user.account_id,
      startDate,
      endDate,
      session.user.id
    )

    // Store/update events in database
    for (const event of events) {
      // Check if event already exists
      const { data: existing } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('account_id', user.account_id)
        .eq('start_time', event.startTime)
        .eq('title', event.title)
        .single()

      if (!existing) {
        // Create new event
        await supabase.from('calendar_events').insert({
          account_id: user.account_id,
          provider: 'google', // TODO: Detect provider
          provider_event_id: `sync_${Date.now()}_${Math.random()}`,
          title: event.title,
          description: event.description,
          start_time: event.startTime,
          end_time: event.endTime,
          location: event.location,
          contact_id: event.contactId,
          job_id: event.jobId,
          conversation_id: event.conversationId,
        })
      }
    }

    return NextResponse.json({
      success: true,
      synced: events.length,
    })
  } catch (error) {
    console.error('Error syncing calendar:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}

