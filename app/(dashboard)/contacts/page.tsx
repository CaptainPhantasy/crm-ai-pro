"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, MapPin, Search, UserPlus, Download, Trash2, Filter } from 'lucide-react'
import { Contact } from '@/types'
import { ContactDetailModal } from '@/components/contacts/contact-detail-modal'
import { AddContactDialog } from '@/components/contacts/add-contact-dialog'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { ExportButton } from '@/components/export/export-button'
import { useModalState } from '@/hooks/use-modal-state'
import { toast, error as toastError, success as toastSuccess } from '@/lib/toast'
import { confirmDialog } from '@/lib/confirm'
import { ContactsFilterDialog, type ContactFilters } from '@/components/contacts/contacts-filter-dialog'
import { ErrorBoundary } from '@/components/error-boundary'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function ContactsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  
  // Use modal state hook to sync with URL query parameter
  const { isOpen: detailModalOpen, modalId: urlContactId, open: openModal, close: closeModal } = useModalState('id', {
    onOpen: (id) => {
      setSelectedContactId(id)
    },
    onClose: () => {
      setSelectedContactId(null)
    }
  })
  
  // Sync selectedContactId with URL param
  useEffect(() => {
    if (urlContactId && urlContactId !== selectedContactId) {
      setSelectedContactId(urlContactId)
    } else if (!urlContactId && selectedContactId) {
      setSelectedContactId(null)
    }
  }, [urlContactId, selectedContactId])
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false)
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filters, setFilters] = useState<ContactFilters>({
    tags: [],
    status: [],
    dateRange: { start: '', end: '' },
    search: '',
  })
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  // Handle query parameter on mount and when it changes
  useEffect(() => {
    const contactIdParam = searchParams.get('id')
    if (contactIdParam && contactIdParam !== selectedContactId) {
      setSelectedContactId(contactIdParam)
      openModal(contactIdParam)
    }
  }, [searchParams])

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchContacts(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filters])

  async function fetchContacts(search = '') {
    try {
      setLoading(true)
      const url = search 
        ? `/api/contacts?search=${encodeURIComponent(search)}`
        : '/api/contacts'
      // Add cache control for faster subsequent loads
      const response = await fetch(url, {
        next: { revalidate: 30 }, // Cache for 30 seconds
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
        }
      })
      
      if (!response.ok) {
        // API failed, but continue with empty state
        console.warn('API call failed, using empty state')
        setContacts([])
        setStats({ total: 0, active: 0, newThisMonth: 0 })
        return
      }
      
      if (response.ok) {
      const data = await response.json()
      const contactsArray = data.contacts || []
      setContacts(contactsArray)
      
      // Calculate stats efficiently
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      let newThisMonth = 0
      
      for (const contact of contactsArray) {
        const created = new Date(contact.created_at)
        if (created.getMonth() === currentMonth && created.getFullYear() === currentYear) {
          newThisMonth++
        }
      }
      
      setStats({
        total: data.total || contactsArray.length,
        active: contactsArray.length,
        newThisMonth
      })
      }
    } catch (error) {
      // API failed, but continue with empty state
      console.error('Error fetching contacts:', error)
      setContacts([])
      setStats({ total: 0, active: 0, newThisMonth: 0 })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddContact() {
    setAddContactDialogOpen(true)
  }

  async function handleContactAdded() {
    // Refresh contacts list
    fetchContacts(searchQuery)
  }

  async function handleViewContact(contactId: string) {
    setSelectedContactId(contactId)
    openModal(contactId)
  }

  async function handleMessageContact(contactId: string, email: string) {
    try {
      // Find or create conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          subject: `Conversation with ${email}`,
          channel: 'email',
        }),
      })

      if (response.ok) {
      const data = await response.json()
        if (data.conversation) {
        // Navigate to inbox with conversation pre-selected
        router.push(`/inbox?conversation=${data.conversation.id}`)
      } else {
        console.error('Failed to create/find conversation:', data.error)
          toastError('Failed to open conversation', data.error || 'Please try again.')
        }
      } else {
        const data = await response.json().catch(() => ({}))
        toastError('Failed to open conversation', data.error || 'Please try again.')
      }
    } catch (error) {
      console.error('Error handling message contact:', error)
      toastError('Failed to open conversation', 'Network error. Please try again.')
    }
  }


  function handleToggleContactSelection(contactId: string) {
    const newSelected = new Set(selectedContactIds)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedContactIds(newSelected)
  }

  function handleSelectAllContacts() {
    if (selectedContactIds.size === contacts.length) {
      setSelectedContactIds(new Set())
    } else {
      setSelectedContactIds(new Set(contacts.map(c => c.id)))
    }
  }

  async function handleBulkDelete() {
    if (selectedContactIds.size === 0) return
    
    const confirmed = await confirmDialog({
      title: `Delete ${selectedContactIds.size} contact(s)?`,
      description: 'This action cannot be undone. Are you sure you want to continue?',
      variant: 'destructive',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })
    
    if (!confirmed) {
      return
    }

    setBulkDeleting(true)
    try {
      const response = await fetch('/api/contacts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          contactIds: Array.from(selectedContactIds),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toastSuccess(`Successfully deleted ${data.deleted} contact(s)`)
          setSelectedContactIds(new Set())
          fetchContacts(searchQuery)
        } else {
          toastError('Failed to delete contacts', data.error || 'Unknown error occurred')
        }
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        toastError('Failed to delete contacts', data.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Error deleting contacts:', error)
      toastError('Failed to delete contacts', 'Network error. Please try again.')
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <ErrorBoundary context="contacts">
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Contacts</h1>
          <p className="text-sm text-neon-blue-glow100 mt-1">Manage your customer database</p>
        </div>
        <div className="flex gap-2">
          {contacts.length > 0 && (
            <ExportButton endpoint="contacts" />
          )}
          {selectedContactIds.size > 0 && (
            <Button 
              onClick={handleBulkDelete}
              variant="destructive"
              disabled={bulkDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedContactIds.size})
            </Button>
          )}
          <Button 
            onClick={handleAddContact}
            variant="default"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-neon-blue-glow700/50 bg-dark-panel/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neon-blue-glow300" />
              <Input
                placeholder="Search contacts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFilterDialogOpen(true)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {(filters.tags.length > 0 || filters.status.length > 0 || filters.dateRange.start || filters.dateRange.end) && (
                <span className="ml-2 bg-neon-blue-glow300 text-black font-bold rounded-full px-1.5 py-0.5 text-xs">
                  {filters.tags.length + filters.status.length + (filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-neon-green-glow300 shadow-neon-green-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neon-green-glow100">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white">{stats.total}</div>
            <p className="text-xs text-neon-green-glow300 mt-1 font-medium">+8 this week</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-neon-blue-glow500 shadow-neon-blue-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neon-blue-glow100">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white">{stats.active}</div>
            <p className="text-xs text-neon-blue-glow300 mt-1 font-medium">90% active rate</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-neon-accent-red shadow-neon-blue-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white">{stats.newThisMonth}</div>
            <p className="text-xs text-neon-accent-red mt-1 font-medium">Growing fast!</p>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : contacts.length === 0 ? (
        <Card className="shadow-md border-neon-blue-glow700/50">
          <CardContent className="py-12 text-center">
            <p className="text-neon-blue-glow100 font-medium">No contacts found</p>
            <p className="text-sm text-neon-blue-glow100/50 mt-1">
              {searchQuery ? 'Try a different search term' : 'Create your first contact to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.length > 0 && (
            <div className="flex items-center gap-2 pb-2 border-b border-neon-blue-glow700/50">
              <Checkbox
                checked={selectedContactIds.size === contacts.length && contacts.length > 0}
                onCheckedChange={handleSelectAllContacts}
              />
              <span className="text-sm text-neon-blue-glow100">
                {selectedContactIds.size > 0 ? `${selectedContactIds.size} selected` : 'Select all'}
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card 
                key={contact.id} 
                className={cn(
                  "hover:shadow-neon-blue-md transition-all border-2 shadow-sm relative overflow-hidden",
                  selectedContactIds.has(contact.id) 
                    ? "border-neon-blue-glow300 bg-neon-blue-glow700/10" 
                    : "border-neon-blue-glow700/30 hover:border-neon-blue-glow300"
                )}
                onClick={(e) => {
                    if (
                        e.target instanceof HTMLElement && 
                        !e.target.closest('button') && 
                        !e.target.closest('[role="checkbox"]')
                      ) {
                         handleToggleContactSelection(contact.id)
                      }
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedContactIds.has(contact.id)}
                      onCheckedChange={() => handleToggleContactSelection(contact.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-neon-blue-glow300">
                        {contact.first_name?.[0]}{contact.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base text-white">
                        {contact.first_name} {contact.last_name}
                      </CardTitle>
                    <Badge 
                      variant="secondary"
                      className="mt-1"
                    >
                      active
                    </Badge>
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm text-neon-blue-glow100/70">
                    <Mail className="w-4 h-4 text-neon-blue-glow300" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-neon-blue-glow100/70">
                    <Phone className="w-4 h-4 text-neon-green-glow300" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-center gap-2 text-sm text-neon-blue-glow100/70">
                    <MapPin className="w-4 h-4 text-neon-accent-red" />
                    <span className="truncate">{contact.address}</span>
                  </div>
                )}
                <div className="pt-2 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleViewContact(contact.id)
                    }}
                  >
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default"
                    className="flex-1"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleMessageContact(contact.id, contact.email || '')
                    }}
                  >
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      <ContactDetailModal
        open={detailModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          } else {
            if (selectedContactId) {
              openModal(selectedContactId)
            }
          }
        }}
        contactId={selectedContactId}
      />

      {/* Add Contact Dialog */}
      <AddContactDialog
        open={addContactDialogOpen}
        onOpenChange={setAddContactDialogOpen}
        onSuccess={handleContactAdded}
      />

      {/* Filter Dialog */}
      <ContactsFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          fetchContacts(searchQuery)
        }}
      />
      </div>
    </ErrorBoundary>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Contacts</h1>
            <p className="text-sm text-neon-blue-glow100 mt-1">Manage your customer relationships</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-2 border-neon-blue-glow700/30 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ContactsPageContent />
    </Suspense>
  )
}
