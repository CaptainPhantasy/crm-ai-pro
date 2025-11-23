import { NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth-helper'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const groupBy = searchParams.get('groupBy') || 'date' // 'date', 'tech', 'status'

    const cookieStore = await cookies()
    const supabase = createServerClient(
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
        global: {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        },
      }
    )

    // Get user's account_id
    const { data: user } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get payments
    let paymentsQuery = supabase
      .from('payments')
      .select('amount, created_at, job:jobs(tech_assigned_id, status, tech:users!tech_assigned_id(name))')
      .eq('account_id', user.account_id)
      .eq('status', 'completed')

    if (dateFrom) {
      paymentsQuery = paymentsQuery.gte('created_at', dateFrom)
    }

    if (dateTo) {
      paymentsQuery = paymentsQuery.lte('created_at', dateTo)
    }

    const { data: payments, error } = await paymentsQuery

    if (error) {
      console.error('Error fetching revenue:', error)
      return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 })
    }

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    let breakdown: Record<string, number> = {}

    if (groupBy === 'date') {
      breakdown = payments?.reduce((acc, payment) => {
        const date = new Date(payment.created_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + (payment.amount || 0)
        return acc
      }, {} as Record<string, number>) || {}
    } else if (groupBy === 'tech') {
      breakdown = payments?.reduce((acc, payment) => {
        const techName = payment.job?.tech?.name || 'Unassigned'
        acc[techName] = (acc[techName] || 0) + (payment.amount || 0)
        return acc
      }, {} as Record<string, number>) || {}
    } else if (groupBy === 'status') {
      breakdown = payments?.reduce((acc, payment) => {
        const status = payment.job?.status || 'unknown'
        acc[status] = (acc[status] || 0) + (payment.amount || 0)
        return acc
      }, {} as Record<string, number>) || {}
    }

    return NextResponse.json({
      totalRevenue,
      breakdown,
      groupBy,
    })
  } catch (error: unknown) {
    console.error('Error in GET /api/analytics/revenue:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

