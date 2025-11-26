'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Loader2,
  BarChart3
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DashboardStats {
  jobs: {
    total: number
    today: number
    completed: number
  }
  revenue: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  contacts: {
    total: number
    newThisMonth: number
  }
  invoices: {
    outstanding: number
    outstandingAmount: number
  }
}

interface JobAnalytics {
  totalJobs: number
  totalRevenue: number
  avgJobValue: number
  completedCount: number
  paidCount: number
  statusBreakdown: Record<string, number>
  dateBreakdown: Record<string, number>
}

interface ContactAnalytics {
  newContacts: number
  contactsWithJobs: number
  revenueFromContacts?: number
  totalRevenueFromContacts?: number
  dateBreakdown: Record<string, number>
}

interface RevenueAnalytics {
  totalRevenue: number
  breakdown: Record<string, number>
  groupBy?: string
}

interface AnalyticsLayoutProps {
  loading: boolean
  dateRange: string
  dashboardStats: DashboardStats | null
  jobAnalytics: JobAnalytics | null
  contactAnalytics: ContactAnalytics | null
  revenueAnalytics: RevenueAnalytics | null
  onDateRangeChange: (range: string) => void
  children?: ReactNode
}

const COLORS = ['#ff6a3c', '#22c55e', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899']

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  borderColor
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  borderColor: string
}) {
  return (
    <Card className={`border-l ${borderColor} border-theme-border`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-theme-secondary">{title}</CardTitle>
        <Icon className="h-4 w-4 text-theme-accent-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-theme-primary">{value}</div>
        {change && (
          <p className={cn(
            "text-xs mt-1 font-medium",
            changeType === 'positive' && "text-theme-accent-secondary",
            changeType === 'negative' && "text-red-500",
            changeType === 'neutral' && "text-theme-secondary"
          )}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function AnalyticsLayout({
  loading,
  dateRange,
  dashboardStats,
  jobAnalytics,
  contactAnalytics,
  revenueAnalytics,
  onDateRangeChange,
  children
}: AnalyticsLayoutProps) {
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  function prepareDateChartData(breakdown: Record<string, number>) {
    return Object.entries(breakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value,
      }))
  }

  function prepareStatusChartData(breakdown: Record<string, number>) {
    return Object.entries(breakdown).map(([status, count]) => ({
      name: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between border-b border-ops-border px-4 py-3 bg-ops-surface">
          <div>
            <div className="h-5 bg-ops-surfaceSoft rounded animate-pulse w-48 mb-1" />
            <div className="h-3 bg-ops-surfaceSoft rounded animate-pulse w-64" />
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden px-4 py-4">
          <div className="flex-1 bg-ops-surface rounded-lg border border-ops-border shadow-card flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-ops-accent" />
          </div>
          <div className="w-80 ml-4 border border-ops-border bg-ops-surfaceSoft rounded-lg shadow-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-theme-border px-4 py-3 bg-theme-surface">
        <div>
          <h1 className="text-lg font-semibold text-theme-primary">Analytics</h1>
          <p className="text-xs text-theme-secondary">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-40 border-theme-border bg-theme-input text-theme-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Charts and Metrics */}
        <section className="flex-1 overflow-y-auto space-y-6 p-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={dashboardStats ? formatCurrency(dashboardStats.revenue.total) : '$0.00'}
              change={dashboardStats?.revenue.thisMonth
                ? `$${(dashboardStats.revenue.thisMonth / 100).toFixed(2)} this month`
                : 'No data'}
              changeType="positive"
              icon={DollarSign}
              borderColor="border-l-theme-accent-primary"
            />
            <StatCard
              title="Total Jobs"
              value={dashboardStats?.jobs.total || 0}
              change={`${dashboardStats?.jobs.completed || 0} completed`}
              changeType="positive"
              icon={Briefcase}
              borderColor="border-l-orange-500"
            />
            <StatCard
              title="Total Contacts"
              value={dashboardStats?.contacts.total || 0}
              change={`${dashboardStats?.contacts.newThisMonth || 0} new this month`}
              changeType="positive"
              icon={Users}
              borderColor="border-l-theme-accent-secondary"
            />
            <StatCard
              title="Outstanding Invoices"
              value={dashboardStats?.invoices.outstanding || 0}
              change={dashboardStats
                ? formatCurrency(dashboardStats.invoices.outstandingAmount)
                : '$0.00'}
              changeType="neutral"
              icon={FileText}
              borderColor="border-l-red-500"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="border-theme-border">
              <CardHeader>
                <CardTitle className="text-theme-primary">Revenue Trend</CardTitle>
                <CardDescription className="text-theme-secondary">Revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueAnalytics?.breakdown && Object.keys(revenueAnalytics.breakdown).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={prepareDateChartData(revenueAnalytics.breakdown)}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS[0]} />
                      <XAxis dataKey="date" stroke={COLORS[1]} />
                      <YAxis stroke={COLORS[1]} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'var(--ops-surface)',
                          border: '1px solid var(--ops-border)',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS[0]}
                        strokeWidth={2}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-theme-secondary">
                    No revenue data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Status Breakdown */}
            <Card className="border-theme-border">
              <CardHeader>
                <CardTitle className="text-ops-text">Job Status Breakdown</CardTitle>
                <CardDescription className="text-ops-textMuted">Distribution of jobs by status</CardDescription>
              </CardHeader>
              <CardContent>
                {jobAnalytics?.statusBreakdown && Object.keys(jobAnalytics.statusBreakdown).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareStatusChartData(jobAnalytics.statusBreakdown)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareStatusChartData(jobAnalytics.statusBreakdown).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--ops-surface)',
                          border: '1px solid var(--ops-border)',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-ops-textMuted">
                    No job data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Jobs Over Time */}
            <Card className="border-theme-border">
              <CardHeader>
                <CardTitle className="text-ops-text">Jobs Created Over Time</CardTitle>
                <CardDescription className="text-ops-textMuted">Number of jobs created by date</CardDescription>
              </CardHeader>
              <CardContent>
                {jobAnalytics?.dateBreakdown && Object.keys(jobAnalytics.dateBreakdown).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareDateChartData(jobAnalytics.dateBreakdown)}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS[0]} />
                      <XAxis dataKey="date" stroke={COLORS[1]} />
                      <YAxis stroke={COLORS[1]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--ops-surface)',
                          border: '1px solid var(--ops-border)',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="value" fill={COLORS[0]} name="Jobs" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-ops-textMuted">
                    No job data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contacts Over Time */}
            <Card className="border-theme-border">
              <CardHeader>
                <CardTitle className="text-ops-text">New Contacts Over Time</CardTitle>
                <CardDescription className="text-ops-textMuted">Number of new contacts by date</CardDescription>
              </CardHeader>
              <CardContent>
                {contactAnalytics?.dateBreakdown && Object.keys(contactAnalytics.dateBreakdown).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareDateChartData(contactAnalytics.dateBreakdown)}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS[0]} />
                      <XAxis dataKey="date" stroke={COLORS[1]} />
                      <YAxis stroke={COLORS[1]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--ops-surface)',
                          border: '1px solid var(--ops-border)',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="value" fill={COLORS[1]} name="Contacts" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-ops-textMuted">
                    No contact data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-theme-border">
              <CardHeader>
                <CardTitle className="text-base text-ops-text">Job Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">Average Job Value</span>
                  <span className="font-semibold text-ops-text">
                    {jobAnalytics ? formatCurrency(jobAnalytics.avgJobValue) : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">Completed Jobs</span>
                  <span className="font-semibold text-ops-text">{jobAnalytics?.completedCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">Paid Jobs</span>
                  <span className="font-semibold text-ops-text">{jobAnalytics?.paidCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-theme-border">
              <CardHeader>
                <CardTitle className="text-base text-ops-text">Contact Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">New Contacts</span>
                  <span className="font-semibold text-ops-text">{contactAnalytics?.newContacts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">Contacts with Jobs</span>
                  <span className="font-semibold text-ops-text">{contactAnalytics?.contactsWithJobs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">Revenue from Contacts</span>
                  <span className="font-semibold text-ops-text">
                    {contactAnalytics
                      ? formatCurrency(contactAnalytics.revenueFromContacts || contactAnalytics.totalRevenueFromContacts || 0)
                      : '$0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-theme-border">
              <CardHeader>
                <CardTitle className="text-base text-ops-text">Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">Total Revenue</span>
                  <span className="font-semibold text-ops-text">
                    {revenueAnalytics ? formatCurrency(revenueAnalytics.totalRevenue) : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">Today</span>
                  <span className="font-semibold text-ops-text">
                    {dashboardStats ? formatCurrency(dashboardStats.revenue.today) : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ops-textMuted">This Week</span>
                  <span className="font-semibold text-ops-text">
                    {dashboardStats ? formatCurrency(dashboardStats.revenue.thisWeek) : '$0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional content */}
          {children}
        </section>

        {/* Inspector Panel */}
        <section className="w-80 ml-4 border border-theme-border bg-[var(--card-bg)] rounded-lg shadow-card">
          <div className="p-4">
            <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </h3>
            <div className="text-theme-secondary text-sm space-y-3">
              <div>
                <p className="font-medium text-theme-primary mb-1">Revenue Performance</p>
                <p>Your revenue is trending {dashboardStats?.revenue.thisMonth ? 'upward' : 'stable'} this month.</p>
              </div>
              <div>
                <p className="font-medium text-theme-primary mb-1">Job Completion Rate</p>
                <p>{jobAnalytics ? Math.round((jobAnalytics.completedCount / jobAnalytics.totalJobs) * 100) : 0}% of jobs are completed.</p>
              </div>
              <div>
                <p className="font-medium text-theme-primary mb-1">Contact Growth</p>
                <p>{contactAnalytics?.newContacts || 0} new contacts added in the selected period.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
