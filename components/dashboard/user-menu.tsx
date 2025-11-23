'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Settings, LogOut, User } from 'lucide-react'

interface UserData {
  full_name: string | null
  avatar_url: string | null
  role: string | null
}

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      // Clear any client-side state first
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
          await supabase.auth.signOut()
        }
      } catch (supabaseError) {
        // Supabase might not be configured, that's okay
        console.log('Supabase not configured, skipping client-side signout')
      }

      // Clear localStorage and sessionStorage to prevent CSS/state issues
      localStorage.clear()
      sessionStorage.clear()

      // Call the signout API
      await fetch('/api/auth/signout', {
        method: 'POST',
      })
      
      // Use replace instead of href to prevent back button issues
      // This forces a full page reload and clears all React state
      window.location.replace('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect even if there's an error - clear everything
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/login')
    }
  }

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-dark-tertiary animate-pulse border-2 border-neon-blue-glow700/50" />
    )
  }

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-neon-blue-glow300 focus:ring-offset-2 focus:ring-offset-dark-secondary">
          <Avatar className="w-8 h-8 border-2 border-neon-blue-glow300 neon-glow-blue">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || 'User'} />
            ) : (
              <AvatarFallback className="bg-neon-blue-glow300 text-black text-xs font-semibold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-dark-panel border-2 border-neon-blue-glow700/50 circuit-pattern">
        <DropdownMenuLabel className="text-white">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">
              {user?.full_name || 'User'}
            </p>
            {user?.role && (
              <p className="text-xs leading-none text-neon-blue-glow100 capitalize">
                {user.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neon-blue-glow700/50" />
        <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="text-white hover:bg-dark-tertiary hover:text-neon-blue-glow300 focus:bg-dark-tertiary">
          <Settings className="mr-2 h-4 w-4 text-neon-blue-glow300" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/admin/users')} className="text-white hover:bg-dark-tertiary hover:text-neon-blue-glow300 focus:bg-dark-tertiary">
          <User className="mr-2 h-4 w-4 text-neon-blue-glow300" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neon-blue-glow700/50" />
        <DropdownMenuItem onClick={handleSignOut} variant="destructive" className="text-neon-accent-red hover:bg-dark-tertiary hover:text-neon-accent-red focus:bg-dark-tertiary">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

