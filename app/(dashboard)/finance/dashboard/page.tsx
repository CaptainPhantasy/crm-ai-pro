'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Clock, FileText } from 'lucide-react'

interface FinancialStats {
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
    total: number
  }
  outstanding: {
    count: number
    amount: number
  }
  paymentRate: number
  averageInvoice: number
}

export default function FinanceDashboardPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialData()
  }, [])

  async function fetchFinancialData() {
    try {
      const response = await fetch('/api/finance/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-neutral-500">Loading financial data...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-800">Financial Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Revenue and payment analytics</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 shadow-md" style={{ borderLeftColor: '#56D470' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-800">
              ${((stats?.revenue.today || 0) / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 shadow-md" style={{ borderLeftColor: '#4B79FF' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-800">
              ${((stats?.revenue.thisWeek || 0) / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 shadow-md" style={{ borderLeftColor: '#6938EF' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-800">
              ${((stats?.revenue.thisMonth || 0) / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 shadow-md" style={{ borderLeftColor: '#FFA24D' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-800">
              ${((stats?.revenue.total || 0) / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-neutral-800">
              {stats?.outstanding.count || 0}
            </div>
            <div className="text-sm text-neutral-500 mt-2">
              ${((stats?.outstanding.amount || 0) / 100).toFixed(2)} total
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Payment Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-neutral-800">
              {(stats?.paymentRate || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-neutral-500 mt-2">
              Of invoices paid on time
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Average Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-neutral-800">
              ${((stats?.averageInvoice || 0) / 100).toFixed(2)}
            </div>
            <div className="text-sm text-neutral-500 mt-2">
              Per invoice
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

