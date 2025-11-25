import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { getAuthenticatedSession } from '@/lib/auth-helper'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedSession(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use Bearer token if available, otherwise use cookies
    const authHeader = request.headers.get('authorization')
    let supabase: any

    if (authHeader?.startsWith('Bearer ')) {
      const { createClient } = await import('@supabase/supabase-js')
      const token = authHeader.substring(7)
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )
    } else {
      const cookieStore = await cookies()
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {}
            },
          },
        }
      )
    }

    const body = await request.json()
    const { conversationId, contactId, description, scheduledStart, scheduledEnd, techAssignedId } = body

    if (!contactId || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: contactId, description' 
      }, { status: 400 })
    }

    // Get account_id from contact
    const { data: contact } = await supabase
      .from('contacts')
      .select('account_id')
      .eq('id', contactId)
      .single()

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Call Edge Function for business logic
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-job`
    const edgeResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: contact.account_id,
        contactId,
        conversationId,
        description,
        scheduledStart,
        scheduledEnd,
        techAssignedId,
      }),
    })

    const edgeData = await edgeResponse.json()

    if (!edgeResponse.ok) {
      return NextResponse.json(edgeData, { status: edgeResponse.status })
    }

    return NextResponse.json(edgeData, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // TEMPORARY: Skip auth for voice agent testing
    // const auth = await getAuthenticatedSession(request)
    // if (!auth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    const auth = { user: { id: 'test-user' } } // Mock auth for testing

    // TEMPORARY: Use service role client for voice agent testing (bypasses RLS)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const techId = searchParams.get('techId')
    const contactId = searchParams.get('contactId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // For voice agent testing: show jobs from default account (where voice agent creates jobs)
    // TODO: Make voice agent use authenticated user's account
    const accountId = process.env.DEFAULT_ACCOUNT_ID || 'fde73a6a-ea84-46a7-803b-a3ae7cc09d00'

    let query = supabase
      .from('jobs')
      .select('*, contact:contacts(*), tech:users!tech_assigned_id(*)', { count: 'exact' })
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    if (techId) {
      query = query.eq('tech_assigned_id', techId)
    }
    if (contactId) {
      query = query.eq('contact_id', contactId)
    }

    const { data: jobs, error, count } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    return NextResponse.json({
      jobs: jobs || [],
      total: count || 0,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

