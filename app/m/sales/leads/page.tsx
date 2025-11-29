'use client'

import { useState, useEffect } from 'react'
import { Target, DollarSign, TrendingUp, Phone, Menu } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
import { SalesBottomNav } from '@/components/mobile/bottom-nav'

interface Lead {
  id: string
  contactName: string
  company?: string
  status: string
  value: number
  lastContact?: string
}

export default function SalesLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/sales/leads')
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
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

      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-[var(--color-text-secondary)]">{leads.length} active leads</p>
        </div>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </header>

      <div className="space-y-3">
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/m/sales/lead/${lead.id}`}
            className="block"
          >
            <Card className="p-4 hover:shadow-card-hover transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold">{lead.contactName}</div>
                  {lead.company && (
                    <div className="text-[var(--color-text-secondary)] text-sm">{lead.company}</div>
                  )}
                </div>
                <div className="text-[var(--color-accent-primary)] font-bold">
                  ${lead.value.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  lead.status === 'hot' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  lead.status === 'warm' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' :
                  'bg-[var(--color-bg-surface)] text-[var(--color-text-subtle)]'
                }`}>
                  {lead.status}
                </span>
                {lead.lastContact && (
                  <span className="text-[var(--color-text-subtle)]">
                    Last contact: {new Date(lead.lastContact).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          </Link>
        ))}

        {leads.length === 0 && (
          <Card className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50 text-[var(--color-text-subtle)]" />
            <p className="text-[var(--color-text-secondary)]">No active leads</p>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <SalesBottomNav />
    </div>
  )
}
