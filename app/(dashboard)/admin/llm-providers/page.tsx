'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckCircle2, XCircle } from 'lucide-react'
import { LLMProviderDialog } from '@/components/admin/llm-provider-dialog'

interface LLMProvider {
  id: string
  name: string
  provider: string
  model: string
  use_case: string[]
  max_tokens: number
  is_active: boolean
  is_default: boolean
  account_id: string | null
}

export default function LLMProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [providerDialogOpen, setProviderDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null)

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
          fetchProviders()
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

  async function fetchProviders() {
    try {
      const response = await fetch('/api/llm-providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  function handleAddProvider() {
    setEditingProvider(null)
    setProviderDialogOpen(true)
  }

  function handleEditProvider(provider: LLMProvider) {
    setEditingProvider(provider)
    setProviderDialogOpen(true)
  }

  async function handleToggleActive(providerId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/llm-providers/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchProviders()
      }
    } catch (error) {
      console.error('Error toggling provider status:', error)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">LLM Provider Management</h1>
          <p className="text-sm text-neutral-500 mt-1">Configure AI model providers and routing</p>
        </div>
        <Button 
          onClick={handleAddProvider}
          className="bg-[#4B79FF] hover:bg-[#3366FF] text-white shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Providers</CardTitle>
          <CardDescription>Manage AI model providers and their use cases</CardDescription>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">No providers configured</div>
          ) : (
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{provider.name}</span>
                          {provider.is_default && (
                            <Badge className="bg-[#56D470] text-white text-xs">Default</Badge>
                          )}
                          <Badge
                            className={`text-xs flex items-center gap-1 ${
                              provider.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {provider.is_active ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {provider.provider} / {provider.model} • Max tokens: {provider.max_tokens}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {provider.use_case?.map((useCase) => (
                            <Badge
                              key={useCase}
                              className="text-xs bg-[#EBF0FF] text-[#4B79FF]"
                            >
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(provider.id, provider.is_active)}
                      className={provider.is_active ? 'border-red-300 text-red-600' : 'border-green-300 text-green-600'}
                    >
                      {provider.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProvider(provider)}
                      className="border-[#4B79FF] text-[#4B79FF] hover:bg-[#EBF0FF]"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LLMProviderDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        provider={editingProvider}
        onSuccess={fetchProviders}
      />
    </div>
  )
}

