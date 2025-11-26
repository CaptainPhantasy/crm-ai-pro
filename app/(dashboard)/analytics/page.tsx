'use client'

import { useState, useEffect } from 'react'
import { AnalyticsLayout } from '@/components/layout/analytics-layout'

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

  return (
    <AnalyticsLayout
      loading={loading}
      dateRange={dateRange}
      dashboardStats={dashboardStats}
      jobAnalytics={jobAnalytics}
      contactAnalytics={contactAnalytics}
      revenueAnalytics={revenueAnalytics}
      onDateRangeChange={setDateRange}
    />
  )
}

