'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Users, Star, Calendar, Download, RefreshCw, ChevronRight } from 'lucide-react'
import { BigButton } from '@/components/mobile/big-button'
import Link from 'next/link'

interface ReportData {
  revenue: {
    today: number
    week: number
    month: number
    year: number
  }
  jobs: {
    completed: number
    pending: number
    avgRevenue: number
    topServices: Array<{ name: string; count: number; revenue: number }>
  }
  customers: {
    total: number
    newThisMonth: number
    repeatRate: number
    topCustomers: Array<{ name: string; revenue: number; jobCount: number }>
  }
  techs: {
    total: number
    avgRating: number
    topPerformer: { name: string; jobsCompleted: number }
    performanceList: Array<{ name: string; jobsCompleted: number; rating: number }>
  }
}

export default function OwnerReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [period])

  const fetchReports = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      setError(null)

      // Calculate date range based on period
      const now = new Date()
      const fromDate = new Date()

      switch (period) {
        case 'week':
          fromDate.setDate(now.getDate() - 7)
          break
        case 'month':
          fromDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          fromDate.setFullYear(now.getFullYear() - 1)
          break
      }

      const from = fromDate.toISOString()
      const to = now.toISOString()

      // Fetch multiple report types in parallel
      const [revenueRes, jobPerformanceRes, customerRes, techPerformanceRes] = await Promise.all([
        fetch(`/api/reports/revenue?from=${from}&to=${to}`),
        fetch(`/api/reports/job-performance?from=${from}&to=${to}`),
        fetch(`/api/reports/customer?from=${from}&to=${to}`),
        fetch(`/api/reports/tech-performance?from=${from}&to=${to}`),
      ])

      if (!revenueRes.ok || !jobPerformanceRes.ok || !customerRes.ok || !techPerformanceRes.ok) {
        throw new Error('Failed to fetch reports')
      }

      const [revenueData, jobData, customerData, techData] = await Promise.all([
        revenueRes.json(),
        jobPerformanceRes.json(),
        customerRes.json(),
        techPerformanceRes.json(),
      ])

      // Calculate today/week/month/year revenue
      const calculatePeriodRevenue = (periodType: string) => {
        const periodDate = new Date()
        switch (periodType) {
          case 'today':
            periodDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            periodDate.setDate(periodDate.getDate() - 7)
            break
          case 'month':
            periodDate.setMonth(periodDate.getMonth() - 1)
            break
          case 'year':
            periodDate.setFullYear(periodDate.getFullYear() - 1)
            break
        }

        return revenueData.data?.revenueByPeriod
          ?.filter((r: any) => new Date(r.date) >= periodDate)
          ?.reduce((sum: number, r: any) => sum + r.revenue, 0) || 0
      }

      const aggregatedData: ReportData = {
        revenue: {
          today: calculatePeriodRevenue('today'),
          week: calculatePeriodRevenue('week'),
          month: calculatePeriodRevenue('month'),
          year: revenueData.data?.totalRevenue || 0,
        },
        jobs: {
          completed: jobData.data?.completedJobs || 0,
          pending: jobData.data?.pendingJobs || 0,
          avgRevenue: jobData.data?.totalJobs > 0
            ? Math.round((revenueData.data?.totalRevenue || 0) / jobData.data.totalJobs)
            : 0,
          topServices: revenueData.data?.revenueByServiceType
            ?.slice(0, 5)
            ?.map((s: any) => ({
              name: s.serviceType || 'Unknown',
              count: s.jobCount || 0,
              revenue: s.revenue || 0,
            })) || [],
        },
        customers: {
          total: customerData.data?.totalCustomers || 0,
          newThisMonth: customerData.data?.newCustomers || 0,
          repeatRate: customerData.data?.retentionRate || 0,
          topCustomers: revenueData.data?.revenueByCustomer
            ?.slice(0, 5)
            ?.map((c: any) => ({
              name: c.customerName,
              revenue: c.revenue,
              jobCount: c.jobCount,
            })) || [],
        },
        techs: {
          total: techData.data?.techComparison?.length || 0,
          avgRating: techData.data?.averageRating || 0,
          topPerformer: {
            name: techData.data?.techComparison?.[0]?.techName || 'N/A',
            jobsCompleted: techData.data?.techComparison?.[0]?.jobsCompleted || 0,
          },
          performanceList: techData.data?.techComparison
            ?.slice(0, 5)
            ?.map((t: any) => ({
              name: t.techName,
              jobsCompleted: t.jobsCompleted,
              rating: t.averageRating,
            })) || [],
        },
      }

      setData(aggregatedData)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      setError('Failed to load reports. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchReports(true)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export functionality coming soon')
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent-primary)] mx-auto" />
          <p className="text-gray-400 mt-4">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchReports()}
            className="px-6 py-3 bg-[var(--color-accent-primary)] text-white rounded-xl font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 pb-24">
      {/* Header */}
      <header className="mb-6">
        <Link href="/m/owner/dashboard" className="text-[var(--color-accent-primary)] mb-2 inline-flex items-center gap-1">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold">Executive Reports</h1>
            <p className="text-gray-400 text-sm">Performance analytics</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-[var(--color-bg-secondary)] active:scale-95 transition-transform"
          >
            <RefreshCw className={`w-5 h-5 text-[var(--color-accent-primary)] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {(['week', 'month', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wide transition-colors ${
              period === p
                ? 'bg-[var(--color-accent-primary)] text-white'
                : 'bg-[var(--color-bg-secondary)] text-gray-400'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {data && (
        <>
          {/* Revenue Overview */}
          <section className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              Revenue
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <ReportCard label="Today" value={`$${data.revenue.today.toLocaleString()}`} />
              <ReportCard label="This Week" value={`$${data.revenue.week.toLocaleString()}`} />
              <ReportCard label="This Month" value={`$${data.revenue.month.toLocaleString()}`} />
              <ReportCard label="This Year" value={`$${data.revenue.year.toLocaleString()}`} />
            </div>
          </section>

          {/* Jobs Overview */}
          <section className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[var(--color-accent-primary)]" />
              Jobs
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <ReportCard
                label="Completed"
                value={data.jobs.completed.toString()}
                color="primary"
              />
              <ReportCard
                label="Pending"
                value={data.jobs.pending.toString()}
                color="orange"
              />
            </div>
            <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 mb-4">
              <div className="text-gray-400 text-sm mb-1">Average Job Value</div>
              <div className="text-2xl font-bold text-[var(--color-accent-primary)]">
                ${data.jobs.avgRevenue.toLocaleString()}
              </div>
            </div>

            {/* Top Services */}
            {data.jobs.topServices.length > 0 && (
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                <h3 className="font-bold mb-3">Top Services</h3>
                {data.jobs.topServices.map((service, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.count} jobs</div>
                    </div>
                    <div className="text-green-400 font-bold">
                      ${service.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Customer Metrics */}
          <section className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Customers
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <ReportCard label="Total" value={data.customers.total.toString()} color="purple" />
              <ReportCard label="New This Month" value={data.customers.newThisMonth.toString()} color="purple" />
            </div>
            <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 mb-4">
              <div className="text-gray-400 text-sm mb-1">Repeat Customer Rate</div>
              <div className="text-2xl font-bold text-purple-400">
                {data.customers.repeatRate}%
              </div>
            </div>

            {/* Top Customers */}
            {data.customers.topCustomers.length > 0 && (
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                <h3 className="font-bold mb-3">Top Customers</h3>
                {data.customers.topCustomers.map((customer, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.jobCount} jobs</div>
                    </div>
                    <div className="text-purple-400 font-bold">
                      ${customer.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Team Performance */}
          <section className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Team
            </h2>
            <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 mb-4">
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-700">
                <span className="text-gray-400">Avg Rating</span>
                <span className="text-2xl font-bold text-yellow-400">
                  {data.techs.avgRating.toFixed(1)} ⭐
                </span>
              </div>
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-400 text-sm">Top Performer</div>
                  <div className="font-bold text-[var(--color-accent-primary)]">
                    {data.techs.topPerformer.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">Jobs</div>
                  <div className="font-bold text-[var(--color-accent-primary)]">
                    {data.techs.topPerformer.jobsCompleted}
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Performance List */}
            {data.techs.performanceList.length > 0 && (
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                <h3 className="font-bold mb-3">Team Performance</h3>
                {data.techs.performanceList.map((tech, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-sm text-gray-500">
                        {tech.jobsCompleted} jobs • {tech.rating.toFixed(1)} ⭐
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      i === 0 ? 'bg-yellow-900/50 text-yellow-400' :
                      i === 1 ? 'bg-gray-700 text-gray-300' :
                      i === 2 ? 'bg-orange-900/50 text-orange-400' :
                      'bg-[var(--color-bg-secondary)] text-gray-400'
                    }`}>
                      #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Export Button */}
          <BigButton
            icon={Download}
            label="EXPORT REPORT"
            sublabel="Download as PDF"
            variant="primary"
            onClick={handleExport}
          />
        </>
      )}
    </div>
  )
}

function ReportCard({
  label,
  value,
  color = 'primary'
}: {
  label: string
  value: string
  color?: 'primary' | 'purple' | 'green' | 'orange'
}) {
  const colors = {
    primary: 'text-[var(--color-accent-primary)]',
    purple: 'text-purple-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
  }

  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  )
}
