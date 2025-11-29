'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Mic, User, Clock, Plus, Menu } from 'lucide-react'
import { BigButton, BigButtonGrid } from '@/components/mobile/big-button'
import { VoiceButton } from '@/components/mobile/voice-button'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
import { Card } from '@/components/ui/card'
import { SalesBottomNav } from '@/components/mobile/bottom-nav'
import Link from 'next/link'

interface Meeting {
  id: string
  title: string
  contactId: string
  contactName: string
  location: string
  scheduledAt: string
  meetingType: string
}

export default function SalesDashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [nextMeeting, setNextMeeting] = useState<Meeting | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchTodaysMeetings()
  }, [])

  const fetchTodaysMeetings = async () => {
    try {
      const res = await fetch('/api/meetings?today=true')
      if (res.ok) {
        const data = await res.json()
        setMeetings(data.meetings || [])
        
        // Find next upcoming meeting
        const now = new Date()
        const upcoming = data.meetings?.find((m: Meeting) => 
          new Date(m.scheduledAt) > now
        )
        setNextMeeting(upcoming || data.meetings?.[0] || null)
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning!'
    if (hour < 17) return 'Good Afternoon!'
    return 'Good Evening!'
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
          <h1 className="text-3xl font-bold">{getGreeting()}</h1>
          <p className="text-[var(--color-text-secondary)]">
            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} today
          </p>
        </div>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </header>

      {/* Next Meeting Card */}
      {nextMeeting && (
        <Card className="p-5 mb-6 border-2 border-[var(--color-accent-primary)]/30 bg-gradient-to-br from-[var(--color-accent-primary)]/10 to-transparent shadow-card">
          <div className="text-[var(--color-accent-primary)] text-sm font-bold mb-2">NEXT UP</div>
          <div className="text-2xl font-bold mb-1">{nextMeeting.contactName}</div>
          {nextMeeting.title && (
            <div className="text-gray-300 mb-3">{nextMeeting.title}</div>
          )}
          
          <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(nextMeeting.scheduledAt)}</span>
          </div>
          {nextMeeting.location && (
            <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>{nextMeeting.location}</span>
            </div>
          )}

          <BigButtonGrid>
            <Link href={`/m/sales/briefing/${nextMeeting.contactId}`}>
              <BigButton
                icon={User}
                label="BRIEFING"
                variant="primary"
              />
            </Link>
            <Link href={`/m/sales/meeting/${nextMeeting.id}`}>
              <BigButton
                icon={Mic}
                label="START"
                variant="success"
              />
            </Link>
          </BigButtonGrid>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mb-6">
        <BigButtonGrid>
          <Link href="/m/sales/meeting/new">
            <BigButton
              icon={Plus}
              label="NEW MEETING"
              sublabel="Start recording"
              variant="primary"
            />
          </Link>
          <Link href="/m/sales/voice-note">
            <BigButton
              icon={Mic}
              label="VOICE NOTE"
              sublabel="Quick memo"
              variant="warning"
            />
          </Link>
        </BigButtonGrid>
      </div>

      {/* Today's Schedule */}
      <h2 className="text-xl font-bold mb-4">Today's Schedule</h2>
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <Link
            key={meeting.id}
            href={`/m/sales/meeting/${meeting.id}`}
            className="block"
          >
            <Card className="p-4 hover:shadow-card-hover transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{meeting.contactName}</div>
                  {meeting.title && (
                    <div className="text-[var(--color-text-secondary)] text-sm">{meeting.title}</div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-[var(--color-text-subtle)] text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(meeting.scheduledAt)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-subtle)]">
                      {meeting.meetingType}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {meetings.length === 0 && (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50 text-[var(--color-text-subtle)]" />
            <p className="text-[var(--color-text-secondary)]">No meetings scheduled for today</p>
            <p className="text-sm mt-2 text-[var(--color-text-subtle)]">Tap "New Meeting" to start recording</p>
          </Card>
        )}
      </div>

      {/* Voice Command Button */}
      <VoiceButton />

      {/* Bottom Navigation */}
      <SalesBottomNav />
    </div>
  )
}

