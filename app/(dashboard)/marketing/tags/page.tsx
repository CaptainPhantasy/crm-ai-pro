'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Tag, Edit, Trash2, Users } from 'lucide-react'
import type { ContactTag } from '@/types/contact-tags'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast, error as toastError, success as toastSuccess } from '@/lib/toast'
import { confirmDialog } from '@/lib/confirm'

export default function TagsPage() {
  const [tags, setTags] = useState<ContactTag[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<ContactTag | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#4B79FF', description: '' })

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      setLoading(true)
      const response = await fetch('/api/contact-tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleCreate() {
    setSelectedTag(null)
    setFormData({ name: '', color: '#4B79FF', description: '' })
    setDialogOpen(true)
  }

  function handleEdit(tag: ContactTag) {
    setSelectedTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color || '#4B79FF',
      description: tag.description || '',
    })
    setDialogOpen(true)
  }

  async function handleDelete(tagId: string) {
    const confirmed = await confirmDialog({
      title: 'Delete Tag',
      description: 'Are you sure you want to delete this tag? This will remove it from all contacts. This action cannot be undone.',
      variant: 'destructive',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    })
    
    if (!confirmed) return

    try {
      const response = await fetch(`/api/contact-tags/${tagId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toastSuccess('Tag deleted successfully')
        fetchTags()
      } else {
        toastError('Failed to delete tag', 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      toastError('Failed to delete tag', 'Network error. Please try again.')
    }
  }

  async function handleSubmit() {
    try {
      const url = selectedTag ? `/api/contact-tags/${selectedTag.id}` : '/api/contact-tags'
      const method = selectedTag ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          color: formData.color,
          description: formData.description,
        }),
      })

      if (response.ok) {
        toastSuccess(selectedTag ? 'Tag updated successfully' : 'Tag created successfully')
        fetchTags()
        setDialogOpen(false)
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        toastError('Failed to save tag', error.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Error saving tag:', error)
      toastError('Failed to save tag', 'Network error. Please try again.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Contact Tags</h1>
          <p className="text-sm text-neutral-500 mt-1">Organize your contacts with tags</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#4B79FF] hover:bg-[#3366FF] text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Tag
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-neutral-500">Loading tags...</div>
      ) : tags.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 font-medium mb-2">No tags found</p>
              <p className="text-sm text-neutral-500 mb-4">Create your first tag to organize contacts</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Tag
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color || '#4B79FF' }}
                    />
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </div>
                </div>
                {tag.description && (
                  <CardDescription className="mt-2">{tag.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tag)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tag.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
            <DialogDescription>
              {selectedTag ? 'Update tag details' : 'Create a new tag to organize your contacts'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tag Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., VIP, Lead, Customer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 rounded border border-neutral-300 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#4B79FF"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tag description..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-[#4B79FF] hover:bg-[#3366FF]">
                {selectedTag ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

