'use client'

import { useState } from 'react'
import { EstimateListView } from '@/components/estimates/EstimateListView'
import { EstimateBuilderDialog } from '@/components/estimates/EstimateBuilderDialog'
import { useRouter } from 'next/navigation'

export default function EstimatesPage() {
  const [showBuilder, setShowBuilder] = useState(false)
  const router = useRouter()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <EstimateListView 
        onCreateNew={() => setShowBuilder(true)} 
        onSelectEstimate={(estimate) => router.push(`/estimates/${estimate.id}`)}
      />
      <EstimateBuilderDialog
        open={showBuilder}
        onOpenChange={setShowBuilder}
        onSave={() => {
          // Refresh list handled by hook/query cache usually, but here we rely on 
          // local state update in the hook or we can force refresh if needed.
          // The useEstimates hook should pick up changes if we refetch.
          // For now, the list component's hook handles data.
          setShowBuilder(false)
        }}
      />
    </div>
  )
}