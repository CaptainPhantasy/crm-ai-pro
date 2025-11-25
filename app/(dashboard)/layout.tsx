'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { GlobalSearch } from '@/components/search/global-search'
import { UserMenu } from '@/components/dashboard/user-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CommandPalette } from '@/components/ui/command-palette'
import { KeyboardShortcutsHelp } from '@/components/ui/keyboard-shortcuts-help'
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/lib/keyboard-shortcuts'
import { cn } from '@/lib/utils'
import { BarChart3, DollarSign, Settings as SettingsIcon } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Client component layout to avoid SSR issues
  // Skip Supabase for now to allow pages to load
  // Auth can be added back later when needed
  const pathname = usePathname()
  const router = useRouter()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/inbox') {
      return pathname === '/inbox'
    }
    if (path === '/jobs') {
      return pathname === '/jobs' || pathname.startsWith('/jobs/')
    }
    if (path === '/contacts') {
      return pathname === '/contacts' || pathname.startsWith('/contacts/')
    }
    if (path === '/analytics') {
      return pathname === '/analytics' || pathname.startsWith('/analytics/')
    }
    if (path === '/finance') {
      return pathname === '/finance' || pathname.startsWith('/finance/')
    }
    if (path === '/tech/dashboard') {
      return pathname === '/tech/dashboard' || pathname.startsWith('/tech/')
    }
    if (path === '/settings') {
      return pathname === '/settings' || pathname.startsWith('/settings/') || pathname.startsWith('/admin/settings')
    }
    if (path === '/marketing/campaigns') {
      return pathname === '/marketing/campaigns' || pathname.startsWith('/marketing/campaigns')
    }
    if (path === '/marketing/email-templates') {
      return pathname === '/marketing/email-templates'
    }
    if (path === '/marketing/tags') {
      return pathname === '/marketing/tags'
    }
    return false
  }

  const getNavLinkClasses = (path: string, glowColor: 'blue' | 'green' = 'blue') => {
    const active = isActive(path)
    const borderColor = glowColor === 'blue' ? 'border-theme-accent-primary' : 'border-theme-accent-secondary'
    const glowClass = glowColor === 'blue' ? 'shadow-glow' : 'shadow-glow'
    const hoverBorder = glowColor === 'blue' ? 'hover:border-theme-accent-primary/30' : 'hover:border-theme-accent-secondary/30'
    
    return cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all relative border-2",
      active
        ? `text-theme-primary bg-theme-surface ${borderColor} ${glowClass}`
        : `text-theme-secondary hover:text-theme-primary hover:bg-theme-surface/50 border-transparent ${hoverBorder}`
    )
  }

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      meta: true,
      action: () => setCommandPaletteOpen(true),
      description: 'Open command palette',
      category: 'general'
    },
    {
      key: '/',
      meta: true,
      action: () => setShortcutsHelpOpen(true),
      description: 'Show keyboard shortcuts',
      category: 'general'
    },
    {
      key: 'n',
      meta: true,
      action: () => {
        if (pathname.startsWith('/jobs')) {
          router.push('/jobs?action=create')
        } else if (pathname.startsWith('/contacts')) {
          router.push('/contacts?action=create')
        } else {
          router.push('/jobs?action=create')
        }
      },
      description: 'Create new (context-aware)',
      category: 'actions'
    },
    {
      key: 'j',
      meta: true,
      action: () => router.push('/jobs'),
      description: 'Go to Jobs',
      category: 'navigation'
    },
    {
      key: 'c',
      meta: true,
      action: () => router.push('/contacts'),
      description: 'Go to Contacts',
      category: 'navigation'
    },
    {
      key: 'i',
      meta: true,
      action: () => router.push('/inbox'),
      description: 'Go to Inbox',
      category: 'navigation'
    },
    {
      key: 'Escape',
      action: () => {
        setCommandPaletteOpen(false)
        setShortcutsHelpOpen(false)
      },
      description: 'Close modals/dialogs',
      category: 'general'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-theme-primary">
      <div className="w-full flex-none md:w-64 bg-theme-surface border-r-2 border-theme-border p-4 flex flex-col relative overflow-hidden">
        <div className="font-semibold text-lg text-theme-primary mb-4 flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-theme-accent-primary flex items-center justify-center text-black font-bold text-[10px] leading-tight shadow-glow">
            AI
          </div>
          <span className="text-theme-primary">CRM-AI PRO</span>
        </div>
        <div className="mb-4">
          <GlobalSearch />
        </div>
        <nav className="space-y-1 flex-1 relative z-10">
          <a 
            href="/inbox" 
            className={getNavLinkClasses('/inbox', 'blue')}
          >
            <div className="w-2 h-2 rounded-full bg-theme-accent-primary shadow-glow"></div>
            Inbox
          </a>
          <a 
            href="/jobs" 
            className={getNavLinkClasses('/jobs', 'blue')}
          >
            <div className="w-2 h-2 rounded-full bg-theme-accent-primary shadow-glow"></div>
            Jobs
          </a>
          <a 
            href="/contacts" 
            className={getNavLinkClasses('/contacts', 'green')}
          >
            <div className="w-2 h-2 rounded-full bg-theme-accent-secondary shadow-glow"></div>
            Contacts
          </a>
          <a 
            href="/analytics" 
            className={getNavLinkClasses('/analytics', 'blue')}
          >
            <BarChart3 className="w-4 h-4 text-theme-accent-primary" />
            Analytics
          </a>
          <a 
            href="/finance/dashboard" 
            className={getNavLinkClasses('/finance', 'green')}
          >
            <DollarSign className="w-4 h-4 text-theme-accent-secondary" />
            Finance
          </a>
          <a 
            href="/tech/dashboard" 
            className={getNavLinkClasses('/tech/dashboard', 'blue')}
          >
            <div className="w-2 h-2 rounded-full bg-theme-accent-primary shadow-glow"></div>
            Tech View
          </a>
          <div className="pt-2 mt-2 border-t-2 border-theme-border">
            <div className="px-3 py-1 text-xs font-semibold text-theme-secondary uppercase mb-1">
              Marketing
            </div>
            <a 
              href="/marketing/campaigns" 
              className={getNavLinkClasses('/marketing/campaigns', 'blue')}
            >
              <div className="w-2 h-2 rounded-full bg-theme-accent-primary shadow-glow"></div>
              Campaigns
            </a>
            <a 
              href="/marketing/email-templates" 
              className={getNavLinkClasses('/marketing/email-templates', 'blue')}
            >
              <div className="w-2 h-2 rounded-full bg-theme-accent-primary shadow-glow"></div>
              Templates
            </a>
            <a 
              href="/marketing/tags" 
              className={getNavLinkClasses('/marketing/tags', 'green')}
            >
              <div className="w-2 h-2 rounded-full bg-theme-accent-secondary shadow-glow"></div>
              Tags
            </a>
          </div>
          <div className="pt-2 mt-2 border-t-2 border-theme-border">
            <a 
              href="/admin/settings" 
              className={getNavLinkClasses('/settings', 'blue')}
            >
              <SettingsIcon className="w-4 h-4 text-theme-accent-primary" />
              Settings
            </a>
            <a 
              href="/settings/integrations" 
              className={getNavLinkClasses('/settings/integrations', 'blue')}
            >
              <div className="w-2 h-2 rounded-full bg-theme-accent-primary shadow-glow"></div>
              Integrations
            </a>
          </div>
        </nav>
      </div>
      <div className="flex-grow flex flex-col md:overflow-hidden bg-theme-primary">
        <header className="flex-none h-16 bg-theme-surface border-b-2 border-theme-border px-6 flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <div className="flex-1 md:overflow-y-auto bg-theme-primary">
          {children}
        </div>
      </div>
      
      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        open={shortcutsHelpOpen}
        onOpenChange={setShortcutsHelpOpen}
        shortcuts={shortcuts}
      />
    </div>
  )
}

