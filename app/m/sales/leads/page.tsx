'use client'

import { useState, useEffect } from 'react'
import { Target, DollarSign, TrendingUp, Phone } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Sales Pipeline</h1>
        <p className="text-gray-400">{leads.length} active leads</p>
      </header>

      <div className="space-y-3">
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/m/sales/lead/${lead.id}`}
            className="block bg-[var(--color-bg-secondary)] rounded-xl p-4 active:bg-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold">{lead.contactName}</div>
                {lead.company && (
                  <div className="text-gray-400 text-sm">{lead.company}</div>
                )}
              </div>
              <div className="text-[var(--color-accent-primary)] font-bold">
                ${lead.value.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${
                lead.status === 'hot' ? 'bg-red-900 text-red-400' :
                lead.status === 'warm' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' :
                'bg-gray-700 text-gray-400'
              }`}>
                {lead.status}
              </span>
              {lead.lastContact && (
                <span className="text-gray-500">
                  Last contact: {new Date(lead.lastContact).toLocaleDateString()}
                </span>
              )}
            </div>
          </Link>
        ))}

        {leads.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No active leads</p>
          </div>
        )}
      </div>
    </div>
  )
}
