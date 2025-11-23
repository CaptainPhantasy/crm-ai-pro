# Component Patterns to Follow

## Dialog Pattern
Based on `components/jobs/create-job-dialog.tsx`:

```tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MyDialog({ open, onOpenChange, onSuccess }: MyDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ /* ... */ })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Page Pattern
Based on existing pages:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

export default function MyPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const response = await fetch('/api/endpoint')
      const data = await response.json()
      if (response.ok) {
        setData(data.items || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      {/* Content */}
    </div>
  )
}
```

## Modal Pattern (Alternative to Dialog)
For detail views that might be better as modals:

```tsx
'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'

export function DetailModal({ open, onOpenChange, itemId }: Props) {
  const [item, setItem] = useState(null)
  
  useEffect(() => {
    if (open && itemId) {
      fetch(`/api/items/${itemId}`)
        .then(r => r.json())
        .then(data => setItem(data.item))
    }
  }, [open, itemId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {/* Detail content */}
      </DialogContent>
    </Dialog>
  )
}
```

