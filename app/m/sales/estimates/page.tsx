'use client'

import { useState, useEffect } from 'react'
import { FileText, DollarSign, User, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SalesBottomNav } from '@/components/mobile/bottom-nav'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
import Link from 'next/link'

interface Estimate {
  id: string
  contact: {
    firstName: string
    lastName: string
    company?: string
  }
  total: number
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'converted'
  createdAt: string
  validUntil: string
  description?: string
}

export default function SalesEstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchEstimates()
  }, [])

  const fetchEstimates = async () => {
    try {
      const res = await fetch('/api/estimates')
      if (res.ok) {
        const data = await res.json()
        setEstimates(data.estimates || [])
      }
    } catch (error) {
      console.error('Failed to fetch estimates:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent-primary)]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 pb-24">
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="sales" />

      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estimates</h1>
          <p className="text-[var(--color-text-secondary)]">
            {estimates.length} estimate{estimates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </header>

      {/* Estimates List */}
      <div className="space-y-4">
        {estimates.map((estimate) => (
          <Link
            key={estimate.id}
            href={`/estimates/${estimate.id}`} // Navigate to desktop estimate page
            className="block"
          >
            <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
                    <div className="font-bold text-lg">
                      {estimate.contact.firstName} {estimate.contact.lastName}
                    </div>
                  </div>
                  
                  {estimate.description && (
                    <div className="text-[var(--color-text-secondary)] text-sm mb-3">{estimate.description}</div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-[var(--color-text-subtle)]" />
                      <span className="font-bold">{formatCurrency(estimate.total)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[var(--color-text-subtle)] text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(estimate.validUntil)}</span>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                    estimate.status === 'draft' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                    estimate.status === 'sent' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    estimate.status === 'viewed' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                    estimate.status === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    estimate.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    estimate.status === 'converted' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    'bg-[var(--color-bg-surface)]/50 text-[var(--color-text-subtle)] border-[var(--color-border)]'
                  }`}>
                    {estimate.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                    {estimate.status === 'rejected' && <XCircle className="w-3 h-3" />}
                    {estimate.status === 'converted' && <TrendingUp className="w-3 h-3" />}
                    {estimate.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {estimates.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-[var(--color-text-subtle)]">
              No estimates available
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <SalesBottomNav />
    </div>
  )
}