'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function MobileError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-6 text-center bg-[var(--color-bg-primary)]">
            <Card className="p-8 max-w-sm w-full shadow-card">
                <div className="bg-[var(--color-accent-primary)] w-fit p-3 rounded-full mb-4 mx-auto">
                    <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Something went wrong</h2>
                <p className="text-[var(--color-text-secondary)] text-sm mb-6">
                    {error.message || 'An unexpected error occurred.'}
                </p>
                <Button
                    onClick={reset}
                    size="sm"
                    className="gap-2 shadow-card hover:shadow-card-hover"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
            </Card>
        </div>
    )
}
