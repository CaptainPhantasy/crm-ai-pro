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

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get this week's date range
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    // Get this month's date range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Batch all queries in parallel for faster loading
    const [
      { count: totalJobs },
      { count: todayJobs },
      { count: completedJobs },
      { data: allPayments },
      { count: totalContacts },
      { count: newContactsThisMonth },
      { data: outstandingInvoices },
    ] = await Promise.all([
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', user.account_id),
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', user.account_id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString()),
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', user.account_id)
        .eq('status', 'completed'),
      supabase
        .from('payments')
        .select('amount, created_at')
        .eq('account_id', user.account_id)
        .eq('status', 'completed'),
      supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', user.account_id),
      supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', user.account_id)
        .gte('created_at', monthStart.toISOString())
        .lt('created_at', monthEnd.toISOString()),
      supabase
        .from('invoices')
        .select('total_amount')
        .eq('account_id', user.account_id)
        .in('status', ['sent', 'overdue']),
    ])

    // Calculate revenue stats efficiently
    const totalRevenue = allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const todayRevenue = allPayments
      ?.filter((p) => {
        const paymentDate = new Date(p.created_at)
        return paymentDate >= today && paymentDate < tomorrow
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const weekRevenue = allPayments
      ?.filter((p) => {
        const paymentDate = new Date(p.created_at)
        return paymentDate >= weekStart && paymentDate < weekEnd
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const monthRevenue = allPayments
      ?.filter((p) => {
        const paymentDate = new Date(p.created_at)
        return paymentDate >= monthStart && paymentDate < monthEnd
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    const outstandingAmount = outstandingInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

    return NextResponse.json({
      jobs: {
        total: totalJobs || 0,
        today: todayJobs || 0,
        completed: completedJobs || 0,
      },
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        thisWeek: weekRevenue,
        thisMonth: monthRevenue,
      },
      contacts: {
        total: totalContacts || 0,
        newThisMonth: newContactsThisMonth || 0,
      },
      invoices: {
        outstanding: outstandingInvoices?.length || 0,
        outstandingAmount,
      },
    })
  } catch (error: unknown) {
    console.error('Error in GET /api/analytics/dashboard:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

