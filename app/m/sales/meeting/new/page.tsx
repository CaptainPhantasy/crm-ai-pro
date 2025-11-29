'use client'

import { useState } from 'react'
import { Calendar, Clock, User, MapPin, Phone, Mail, Video, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { BigButton } from '@/components/mobile/big-button'
import { SalesBottomNav } from '@/components/mobile/bottom-nav'
import { MobileSidebar, MobileMenuButton } from '@/components/mobile/mobile-sidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NewMeetingForm {
  contactId: string
  title: string
  scheduledStart: string
  scheduledEnd: string
  location: string
  notes: string
  type: 'in_person' | 'phone' | 'video'
  contactName: string
  contactEmail: string
  contactPhone: string
}

export default function NewMeetingPage() {
  const [formData, setFormData] = useState<NewMeetingForm>({
    contactId: '',
    title: '',
    scheduledStart: new Date().toISOString().slice(0, 16), // Today at current time
    scheduledEnd: new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16), // 30 minutes from now
    location: '',
    notes: '',
    type: 'in_person',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  })
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          scheduled_start: formData.scheduledStart,
          scheduled_end: formData.scheduledEnd,
          location: formData.location,
          notes: formData.notes,
          type: formData.type,
          contact: {
            name: formData.contactName,
            email: formData.contactEmail,
            phone: formData.contactPhone
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Navigate back to meetings page after successful creation
        router.push('/m/sales/meetings')
      } else {
        console.error('Failed to create meeting:', await response.text())
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4 pb-24">
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="sales" />

      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Meeting</h1>
          <p className="text-[var(--color-text-secondary)]">Schedule a new meeting</p>
        </div>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
              Contact Name
            </label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              required
              className="w-full bg-[var(--input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-subtle)]"
              placeholder="Enter contact name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
              Meeting Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full bg-[var(--input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-subtle)]"
              placeholder="Enter meeting title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)]"
            >
              <option value="in_person">In-Person</option>
              <option value="phone">Phone Call</option>
              <option value="video">Video Call</option>
            </select>
          </div>

          {formData.type === 'in_person' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-[var(--input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-subtle)]"
                placeholder="Enter meeting location"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                Start
              </label>
              <input
                type="datetime-local"
                name="scheduledStart"
                value={formData.scheduledStart}
                onChange={handleInputChange}
                required
                className="w-full bg-[var(--input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
                End
              </label>
              <input
                type="datetime-local"
                name="scheduledEnd"
                value={formData.scheduledEnd}
                onChange={handleInputChange}
                required
                className="w-full bg-[var(--input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)]"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-[var(--input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-subtle)]"
              placeholder="Add meeting notes or agenda"
            />
          </div>
        </Card>

        <div className="p-4">
          <BigButton
            type="submit"
            icon={loading ? undefined : Plus}
            label={loading ? 'CREATING...' : 'CREATE MEETING'}
            disabled={loading}
            variant="primary"
          />
        </div>
      </form>

      {/* Bottom Navigation */}
      <SalesBottomNav />
    </div>
  )
}