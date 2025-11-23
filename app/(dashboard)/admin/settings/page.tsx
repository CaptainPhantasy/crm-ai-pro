'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AccountSettings } from '@/types/admin'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [formData, setFormData] = useState<AccountSettings>({
    name: '',
    slug: '',
    inbound_email_domain: null,
    settings: {},
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user && (data.user.role === 'admin' || data.user.role === 'owner')) {
          setIsAdmin(true)
          fetchSettings()
        } else {
          router.push('/inbox')
        }
      } else {
        router.push('/inbox')
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/inbox')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSettings() {
    try {
      const response = await fetch('/api/account/settings')
      if (response.ok) {
        const data = await response.json()
        setFormData(data.account || formData)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to update settings' }))
        setError(data.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-neutral-500">Checking access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-800">Account Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your account configuration</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                Settings saved successfully!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <p className="text-xs text-neutral-500">Used in URLs (e.g., {formData.slug || 'yourcompany'}.crmai.com)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inbound_email_domain">Inbound Email Domain</Label>
              <Input
                id="inbound_email_domain"
                placeholder="reply.yourcompany.com"
                value={formData.inbound_email_domain || ''}
                onChange={(e) => setFormData({ ...formData, inbound_email_domain: e.target.value || null })}
              />
              <p className="text-xs text-neutral-500">Domain for receiving email replies</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>Configure your business operating hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Open Time</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={formData.settings.businessHours?.open || '09:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      businessHours: {
                        ...formData.settings.businessHours,
                        open: e.target.value,
                        close: formData.settings.businessHours?.close || '17:00',
                        timezone: formData.settings.businessHours?.timezone || 'America/New_York',
                      }
                    }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeTime">Close Time</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={formData.settings.businessHours?.close || '17:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      businessHours: {
                        ...formData.settings.businessHours,
                        open: formData.settings.businessHours?.open || '09:00',
                        close: e.target.value,
                        timezone: formData.settings.businessHours?.timezone || 'America/New_York',
                      }
                    }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  placeholder="America/New_York"
                  value={formData.settings.businessHours?.timezone || 'America/New_York'}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      businessHours: {
                        ...formData.settings.businessHours,
                        open: formData.settings.businessHours?.open || '09:00',
                        close: formData.settings.businessHours?.close || '17:00',
                        timezone: e.target.value,
                      }
                    }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Customize your brand appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input
                id="primaryColor"
                type="color"
                value={formData.settings.branding?.primaryColor || '#4B79FF'}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    branding: {
                      ...formData.settings.branding,
                      primaryColor: e.target.value,
                      logo: formData.settings.branding?.logo || '',
                    }
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                placeholder="https://example.com/logo.png"
                value={formData.settings.branding?.logo || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    branding: {
                      ...formData.settings.branding,
                      primaryColor: formData.settings.branding?.primaryColor || '#4B79FF',
                      logo: e.target.value,
                    }
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#4B79FF] hover:bg-[#3366FF]"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}

