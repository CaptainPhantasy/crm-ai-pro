'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, MapPin, Phone, Mail, Video, CheckCircle, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SalesBottomNav } from '@/components/mobile/bottom-nav'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
import Link from 'next/link'

interface Meeting {
  id: string
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  title: string
  scheduledStart: string
  scheduledEnd: string
  location?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed'
  notes?: string
  type: 'in_person' | 'phone' | 'video'
}

export default function SalesMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings')
      if (res.ok) {
        const data = await res.json()
        setMeetings(data.meetings || [])
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
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
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-[var(--color-text-secondary)]">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </header>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <Link
            key={meeting.id}
            href={`/m/sales/meeting/${meeting.id}`}
            className="block"
          >
            <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-[var(--color-accent-primary)]" />
                    <div className="font-bold text-lg">{meeting.title}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <User className="w-4 h-4 text-[var(--color-text-subtle)]" />
                    <span>{meeting.contact.firstName} {meeting.contact.lastName}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-[var(--color-text-subtle)] text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(meeting.scheduledStart)} at {formatTime(meeting.scheduledStart)}</span>
                    </div>
                    
                    {meeting.location && (
                      <div className="flex items-center gap-1 text-[var(--color-text-subtle)] text-sm">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[100px]">{meeting.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {meeting.type === 'in_person' && (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <MapPin className="w-3 h-3" />
                        In-Person
                      </div>
                    )}
                    {meeting.type === 'phone' && (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        <Phone className="w-3 h-3" />
                        Phone
                      </div>
                    )}
                    {meeting.type === 'video' && (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Video className="w-3 h-3" />
                        Video
                      </div>
                    )}
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      meeting.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      meeting.status === 'in_progress' ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/30' :
                      meeting.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      meeting.status === 'missed' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-[var(--color-bg-surface)]/50 text-[var(--color-text-subtle)] border-[var(--color-border)]'
                    }`}>
                      {meeting.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {meeting.status === 'cancelled' || meeting.status === 'missed' ? <XCircle className="w-3 h-3" /> : null}
                      {meeting.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {meetings.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-[var(--color-text-subtle)]">
              No meetings scheduled
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <SalesBottomNav />
    </div>
  )
}