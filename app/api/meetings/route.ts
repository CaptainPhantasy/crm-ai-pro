import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAuthenticatedSession } from '@/lib/auth-helper'

export const dynamic = 'force-dynamic'

// POST - Create a new meeting (with optional transcript analysis)
export async function POST(request: Request) {
  const auth = await getAuthenticatedSession(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(c => cookieStore.set(c.name, c.value, c.options)),
      },
    }
  )

  const { data: user } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', auth.user.id)
    .single()

  if (!user?.account_id) {
    return NextResponse.json({ error: 'User account not found' }, { status: 400 })
  }

  const body = await request.json()
  const { 
    contactId, 
    contactName,
    meetingType, 
    transcript,
    title,
    location,
    scheduledAt,
  } = body

  // If contactName provided but no contactId, find the contact
  let finalContactId = contactId
  if (!finalContactId && contactName) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('account_id', user.account_id)
      .or(`first_name.ilike.%${contactName}%,last_name.ilike.%${contactName}%`)
      .limit(1)
      .single()
    
    finalContactId = contact?.id
  }

  // Create meeting record
  const { data: meeting, error } = await supabase
    .from('meetings')
    .insert({
      account_id: user.account_id,
      contact_id: finalContactId,
      user_id: auth.user.id,
      meeting_type: meetingType || 'in_person',
      title: title || 'Meeting',
      location,
      scheduled_at: scheduledAt,
      started_at: new Date().toISOString(),
      transcript,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If transcript provided, analyze it with AI
  if (transcript && meeting) {
    try {
      const analysisRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/llm-router`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: user.account_id,
          useCase: 'summary',
          prompt: `Analyze this meeting transcript and extract:
1. A 2-3 sentence summary
2. Action items (as JSON array of strings)
3. Any personal details mentioned about the customer (family, preferences, interests)
4. Overall sentiment (positive, neutral, negative, or mixed)
5. Any follow-up dates or commitments mentioned

Transcript:
${transcript}

Respond in JSON format:
{
  "summary": "...",
  "actionItems": ["item1", "item2"],
  "personalDetails": {"key": "value"},
  "sentiment": "positive|neutral|negative|mixed",
  "followUpDate": "YYYY-MM-DD or null",
  "followUpNotes": "any commitments made"
}`,
          maxTokens: 600,
          temperature: 0.3,
        }),
      })

      if (analysisRes.ok) {
        const analysis = await analysisRes.json()
        try {
          // Extract JSON from potential markdown code blocks
          const jsonMatch = analysis.text.match(/\{[\s\S]*\}/)
          const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(analysis.text)
          
          // Update meeting with analysis
          await supabase
            .from('meetings')
            .update({
              summary: parsed.summary,
              action_items: parsed.actionItems || [],
              extracted_data: {
                personalDetails: parsed.personalDetails,
              },
              sentiment: parsed.sentiment,
              follow_up_date: parsed.followUpDate ? new Date(parsed.followUpDate).toISOString() : null,
              follow_up_notes: parsed.followUpNotes,
              ended_at: new Date().toISOString(),
            })
            .eq('id', meeting.id)

          // If personal details extracted, update contact profile
          if (parsed.personalDetails && finalContactId) {
            const { data: contact } = await supabase
              .from('contacts')
              .select('profile')
              .eq('id', finalContactId)
              .single()

            const existingProfile = (contact as any)?.profile || {}
            const updatedProfile = {
              ...existingProfile,
              personal: {
                ...existingProfile.personal,
                ...parsed.personalDetails,
              },
              updatedAt: new Date().toISOString(),
              lastMeetingId: meeting.id,
            }

            await supabase
              .from('contacts')
              .update({ profile: updatedProfile })
              .eq('id', finalContactId)
          }

          // Return with analysis
          return NextResponse.json({ 
            success: true, 
            meeting: {
              ...meeting,
              summary: parsed.summary,
              action_items: parsed.actionItems,
              sentiment: parsed.sentiment,
            },
            analysis: parsed,
          })
        } catch (parseError) {
          console.error('Failed to parse analysis:', parseError)
        }
      }
    } catch (analysisError) {
      console.error('Analysis failed:', analysisError)
    }
  }

  return NextResponse.json({ success: true, meeting })
}

// GET - List meetings
export async function GET(request: Request) {
  const auth = await getAuthenticatedSession(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(c => cookieStore.set(c.name, c.value, c.options)),
      },
    }
  )

  const { data: user } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', auth.user.id)
    .single()

  if (!user?.account_id) {
    return NextResponse.json({ error: 'User account not found' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const contactId = searchParams.get('contactId')
  const today = searchParams.get('today')
  const limit = parseInt(searchParams.get('limit') || '20')

  let query = supabase
    .from('meetings')
    .select(`
      *,
      contact:contacts(id, first_name, last_name, email, phone),
      user:users(id, name, email)
    `)
    .eq('account_id', user.account_id)
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (contactId) {
    query = query.eq('contact_id', contactId)
  }

  if (today === 'true') {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    query = query
      .gte('scheduled_at', todayStart.toISOString())
      .lt('scheduled_at', todayEnd.toISOString())
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ meetings: data })
}

