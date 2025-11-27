/**
 * Restart Onboarding API Route
 *
 * POST - Restart onboarding (clear completion/dismissal)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/onboarding/restart
 * Restart user's onboarding
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { userId } = body

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user can only restart their own onboarding
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Reset onboarding state
    const { data, error } = await supabase
      .from('user_onboarding_status')
      .update({
        current_step: 0,
        steps_completed: [],
        completed_at: null,
        dismissed_at: null,
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to restart onboarding' }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
