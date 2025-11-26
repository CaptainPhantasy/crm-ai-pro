import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's account
  const { data: userData } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await request.json()
  const { 
    jobId, 
    latitude, 
    longitude, 
    accuracy, 
    eventType = 'auto',
    metadata = {} 
  } = body

  // Validate coordinates
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // Insert GPS log
  const { data: log, error } = await supabase
    .from('gps_logs')
    .insert({
      account_id: userData.account_id,
      user_id: user.id,
      job_id: jobId || null,
      latitude,
      longitude,
      accuracy,
      event_type: eventType,
      metadata,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If this is an arrival, update job start location
  if (eventType === 'arrival' && jobId) {
    await supabase
      .from('jobs')
      .update({
        start_location_lat: latitude,
        start_location_lng: longitude,
        status: 'in_progress',
      })
      .eq('id', jobId)
  }

  // If this is a departure, update job complete location
  if (eventType === 'departure' && jobId) {
    await supabase
      .from('jobs')
      .update({
        complete_location_lat: latitude,
        complete_location_lng: longitude,
      })
      .eq('id', jobId)
  }

  return NextResponse.json({ success: true, log })
}

export async function GET(request: Request) {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  const userId = searchParams.get('userId')

  let query = supabase
    .from('gps_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (jobId) {
    query = query.eq('job_id', jobId)
  }
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data: logs, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ logs })
}

