'use client'

import { useState, useEffect } from 'react'
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
  Loader2 
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

const COLORS = ['#4B79FF', '#56D470', '#FFA24D', '#22B9CA', '#EE46BC', '#6938EF']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [jobAnalytics, setJobAnalytics] = useState<JobAnalytics | null>(null)
  const [contactAnalytics, setContactAnalytics] = useState<ContactAnalytics | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)

  useEffect(() => {
    fetchAllAnalytics()
  }, [dateRange])

  async function fetchAllAnalytics() {
    setLoading(true)
    try {
      const [dashboardRes, jobsRes, contactsRes, revenueRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch(`/api/analytics/jobs?${getDateRangeParams()}`),
        fetch(`/api/analytics/contacts?${getDateRangeParams()}`),
        fetch(`/api/analytics/revenue?${getDateRangeParams()}&groupBy=date`),
      ])

      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setDashboardStats(data)
      }

      if (jobsRes.ok) {
        const data = await jobsRes.json()
        setJobAnalytics(data)
      }

      if (contactsRes.ok) {
        const data = await contactsRes.json()
        setContactAnalytics(data)
      }

      if (revenueRes.ok) {
        const data = await revenueRes.json()
        setRevenueAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  function getDateRangeParams() {
    const today = new Date()
    let dateFrom: Date

    switch (dateRange) {
      case '7days':
        dateFrom = new Date(today)
        dateFrom.setDate(dateFrom.getDate() - 7)
        break
      case '30days':
        dateFrom = new Date(today)
        dateFrom.setDate(dateFrom.getDate() - 30)
        break
      case '90days':
        dateFrom = new Date(today)
        dateFrom.setDate(dateFrom.getDate() - 90)
        break
      case 'year':
        dateFrom = new Date(today.getFullYear(), 0, 1)
        break
      default:
        dateFrom = new Date(today)
        dateFrom.setDate(dateFrom.getDate() - 30)
    }

    return `dateFrom=${dateFrom.toISOString().split('T')[0]}&dateTo=${today.toISOString().split('T')[0]}`
  }

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
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#4B79FF]" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Analytics Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Comprehensive insights into your business</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
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
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 shadow-md" style={{ borderLeftColor: '#4B79FF' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-800">
              {dashboardStats ? formatCurrency(dashboardStats.revenue.total) : '$0.00'}
            </div>
            <p className="text-xs text-[#37C856] mt-1 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {dashboardStats?.revenue.thisMonth 
                ? `$${(dashboardStats.revenue.thisMonth / 100).toFixed(2)} this month`
                : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 shadow-md" style={{ borderLeftColor: '#FFA24D' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-800">
              {dashboardStats?.jobs.total || 0}
            </div>
            <p className="text-xs text-[#37C856] mt-1 font-medium">
              {dashboardStats?.jobs.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 shadow-md" style={{ borderLeftColor: '#56D470' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-800">
              {dashboardStats?.contacts.total || 0}
            </div>
            <p className="text-xs text-[#EE46BC] mt-1 font-medium">
              {dashboardStats?.contacts.newThisMonth || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 shadow-md" style={{ borderLeftColor: '#EE46BC' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-800">
              {dashboardStats?.invoices.outstanding || 0}
            </div>
            <p className="text-xs text-[#FFA24D] mt-1 font-medium">
              {dashboardStats 
                ? formatCurrency(dashboardStats.invoices.outstandingAmount)
                : '$0.00'} unpaid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueAnalytics?.breakdown && Object.keys(revenueAnalytics.breakdown).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prepareDateChartData(revenueAnalytics.breakdown)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4B79FF" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-400">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Status Breakdown */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Job Status Breakdown</CardTitle>
            <CardDescription>Distribution of jobs by status</CardDescription>
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {prepareStatusChartData(jobAnalytics.statusBreakdown).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-400">
                No job data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs Over Time */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Jobs Created Over Time</CardTitle>
            <CardDescription>Number of jobs created by date</CardDescription>
          </CardHeader>
          <CardContent>
            {jobAnalytics?.dateBreakdown && Object.keys(jobAnalytics.dateBreakdown).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareDateChartData(jobAnalytics.dateBreakdown)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4B79FF" name="Jobs" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-400">
                No job data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts Over Time */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>New Contacts Over Time</CardTitle>
            <CardDescription>Number of new contacts by date</CardDescription>
          </CardHeader>
          <CardContent>
            {contactAnalytics?.dateBreakdown && Object.keys(contactAnalytics.dateBreakdown).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareDateChartData(contactAnalytics.dateBreakdown)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#56D470" name="Contacts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-neutral-400">
                No contact data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Job Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Average Job Value</span>
              <span className="font-semibold">
                {jobAnalytics ? formatCurrency(jobAnalytics.avgJobValue) : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Completed Jobs</span>
              <span className="font-semibold">{jobAnalytics?.completedCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Paid Jobs</span>
              <span className="font-semibold">{jobAnalytics?.paidCount || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Contact Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">New Contacts</span>
              <span className="font-semibold">{contactAnalytics?.newContacts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Contacts with Jobs</span>
              <span className="font-semibold">{contactAnalytics?.contactsWithJobs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Revenue from Contacts</span>
              <span className="font-semibold">
                {contactAnalytics 
                  ? formatCurrency(contactAnalytics.revenueFromContacts || contactAnalytics.totalRevenueFromContacts || 0)
                  : '$0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Total Revenue</span>
              <span className="font-semibold">
                {revenueAnalytics ? formatCurrency(revenueAnalytics.totalRevenue) : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Today</span>
              <span className="font-semibold">
                {dashboardStats ? formatCurrency(dashboardStats.revenue.today) : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">This Week</span>
              <span className="font-semibold">
                {dashboardStats ? formatCurrency(dashboardStats.revenue.thisWeek) : '$0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

