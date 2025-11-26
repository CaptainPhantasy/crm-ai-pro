'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

// Role-based routing map
const ROLE_ROUTES: Record<string, string> = {
  tech: '/tech/dashboard',
  sales: '/sales/dashboard',
  dispatcher: '/office/dashboard',
  admin: '/inbox',
  owner: '/owner/dashboard',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Login failed')
      }

      // Fetch user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        console.error('Failed to fetch user role:', userError)
        // Default to inbox if role lookup fails
        router.push('/inbox')
        return
      }

      // Redirect based on role
      const role = userData?.role || 'admin'
      const targetRoute = ROLE_ROUTES[role] || '/inbox'
      
      // Check if mobile device - redirect to mobile routes
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      if (isMobile && ['tech', 'sales'].includes(role)) {
        // Mobile users with field roles go to mobile dashboards
        router.push(targetRoute)
      } else if (role === 'tech' || role === 'sales') {
        // Desktop tech/sales still go to their mobile-optimized dashboards
        router.push(targetRoute)
      } else {
        // Office roles go to desktop dashboard
        router.push(targetRoute)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md relative z-10">
      <Card className="border-theme-accent-primary">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-theme-accent-primary flex items-center justify-center text-black font-bold text-[10px] leading-tight shadow-glow">
              AI
            </div>
            <CardTitle className="text-2xl font-bold text-theme-accent-primary">
              CRM-AI PRO
            </CardTitle>
          </div>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-theme-card border-2 border-destructive p-3 rounded-md">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
