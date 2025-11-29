'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, MapPin, DollarSign, Calendar, FileText } from 'lucide-react'
import { BigButton } from '@/components/mobile/big-button'
import { VoiceButton } from '@/components/mobile/voice-button'

interface Lead {
  id: string
  contactName: string
  company?: string
  status: string
  value: number
  lastContact?: string
  email: string
  phone: string
  address?: string
  notes?: string
  opportunities: Array<{
    id: string
    title: string
    value: number
    status: string
    createdAt: string
  }>
  contactHistory: Array<{
    type: 'call' | 'email' | 'meeting'
    date: string
    summary: string
  }>
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/sales/leads/${leadId}`)
      if (res.ok) {
        const data = await res.json()
        setLead(data.lead)
      }
    } catch (error) {
      console.error('Failed to fetch lead:', error)
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

  if (!lead) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center text-white">
        <div className="text-center">
          <p>Lead not found</p>
          <button onClick={() => router.back()} className="mt-4 text-[var(--color-accent-primary)]">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pb-24">
      {/* Header */}
      <header className="bg-gradient-to-b from-[var(--color-accent-primary)]/20 to-[var(--color-bg-primary)] p-4 pb-8">
        <button onClick={() => router.back()} className="p-2 -ml-2 mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{lead.contactName}</h1>
            {lead.company && (
              <p className="text-gray-300">{lead.company}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--color-accent-primary)]">
              ${lead.value.toLocaleString()}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              lead.status === 'hot' ? 'bg-red-900 text-red-400' :
              lead.status === 'warm' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' :
              'bg-gray-700 text-gray-400'
            }`}>
              {lead.status}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a href={`tel:${lead.phone}`}>
            <BigButton icon={Phone} label="CALL" variant="success" />
          </a>
          <a href={`mailto:${lead.email}`}>
            <BigButton icon={Mail} label="EMAIL" variant="primary" />
          </a>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Contact Info */}
        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
          <h2 className="font-bold text-lg mb-3">Contact Information</h2>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {lead.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              {lead.email}
            </div>
            {lead.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                {lead.address}
              </div>
            )}
            {lead.lastContact && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Last contact: {new Date(lead.lastContact).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
            <h2 className="font-bold text-lg mb-3">Notes</h2>
            <p className="text-gray-300">{lead.notes}</p>
          </div>
        )}

        {/* Opportunities */}
        {lead.opportunities && lead.opportunities.length > 0 && (
          <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
            <h2 className="font-bold text-lg mb-3">Opportunities</h2>
            <div className="space-y-3">
              {lead.opportunities.map((opp) => (
                <div key={opp.id} className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-200">{opp.title}</div>
                    <div className="text-gray-500 text-sm">
                      Created {new Date(opp.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[var(--color-accent-primary)] font-bold">
                      ${opp.value.toLocaleString()}
                    </div>
                    <div className={`text-sm ${
                      opp.status === 'won' ? 'text-green-400' :
                      opp.status === 'lost' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {opp.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact History */}
        {lead.contactHistory && lead.contactHistory.length > 0 && (
          <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
            <h2 className="font-bold text-lg mb-3">Recent Activity</h2>
            <div className="space-y-3">
              {lead.contactHistory.slice(0, 5).map((contact, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    contact.type === 'call' ? 'bg-green-400' :
                    contact.type === 'email' ? 'bg-blue-400' :
                    'bg-purple-400'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <span className="capitalize">{contact.type}</span>
                      <span>•</span>
                      <span>{new Date(contact.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-200">{contact.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <BigButton
            icon={FileText}
            label="LOG ACTIVITY"
            sublabel="Add contact note"
            variant="secondary"
          />
          <BigButton
            icon={Calendar}
            label="SCHEDULE MEETING"
            sublabel="Set up appointment"
            variant="primary"
          />
        </div>
      </div>

      {/* Voice Command Button */}
      <VoiceButton />
    </div>
  )
}