/**
 * Theme Manager - Handles theme switching between Warm, Midnight, and System modes
 * Supports localStorage persistence and system preference detection
 */

export type Theme = 'warm' | 'midnight' | 'system'

const THEME_STORAGE_KEY = 'theme-preference'
const DEFAULT_THEME: Theme = 'system'

class ThemeManager {
  private currentTheme: Theme
  private listeners: Array<(theme: Theme) => void> = []

  constructor() {
    this.currentTheme = this.loadTheme()
    this.init()
  }

  private loadTheme(): Theme {
    if (typeof window === 'undefined') return DEFAULT_THEME
    
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && (stored === 'warm' || stored === 'midnight' || stored === 'system')) {
      return stored as Theme
    }
    return DEFAULT_THEME
  }

  private saveTheme(theme: Theme) {
    if (typeof window === 'undefined') return
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }

  private applyTheme(theme: Theme) {
    if (typeof document === 'undefined') return

    // Remove all theme classes
    document.documentElement.classList.remove('theme-warm', 'theme-midnight', 'theme-system')
    
    // Apply new theme
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.add(`theme-${theme}`)
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme)
    
    // Store current theme
    this.currentTheme = theme
    this.saveTheme(theme)
    
    // Notify listeners
    this.notifyListeners(theme)
  }

  private updateMetaThemeColor(theme: Theme) {
    if (typeof document === 'undefined') return

    let color: string
    
    if (theme === 'midnight' || (theme === 'system' && this.isDarkMode())) {
      color = '#040816' // Midnight primary bg
    } else {
      color = '#f2e4cf' // Warm primary bg
    }
    
    // Update or create meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.setAttribute('content', color)
  }

  private isDarkMode(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  private init() {
    if (typeof window === 'undefined') return
    
    this.applyTheme(this.currentTheme)
    this.setupSystemThemeListener()
  }

  private setupSystemThemeListener() {
    if (typeof window === 'undefined') return

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (this.currentTheme === 'system') {
        // Re-apply system theme to pick up changes
        this.applyTheme('system')
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }
  }

  cycleTheme() {
    const themes: Theme[] = ['warm', 'system', 'midnight']
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]
    
    this.setTheme(nextTheme)
  }

  setTheme(theme: Theme) {
    if (theme !== 'warm' && theme !== 'midnight' && theme !== 'system') {
      console.warn(`Invalid theme: ${theme}`)
      return
    }
    
    if (typeof document === 'undefined') return

    // Add transition class for smooth change
    document.body.classList.add('theme-transitioning')
    
    setTimeout(() => {
      this.applyTheme(theme)
      
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning')
      }, 300)
    }, 10)
  }

  onThemeChange(callback: (theme: Theme) => void) {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(theme: Theme) {
    this.listeners.forEach(callback => {
      callback(theme)
    })
  }

  getTheme(): Theme {
    return this.currentTheme
  }

  getEffectiveTheme(): 'warm' | 'midnight' {
    if (this.currentTheme === 'system') {
      return this.isDarkMode() ? 'midnight' : 'warm'
    }
    return this.currentTheme
  }
}

// Singleton instance
let themeManagerInstance: ThemeManager | null = null

export function getThemeManager(): ThemeManager {
  if (typeof window === 'undefined') {
    // Return a mock for SSR
    return {
      currentTheme: DEFAULT_THEME,
      cycleTheme: () => {},
      setTheme: () => {},
      onThemeChange: () => () => {},
      getTheme: () => DEFAULT_THEME,
      getEffectiveTheme: () => 'warm',
    } as unknown as ThemeManager
  }

  if (!themeManagerInstance) {
    themeManagerInstance = new ThemeManager()
  }
  return themeManagerInstance
}

// Initialize on client side
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      getThemeManager()
    })
  } else {
    getThemeManager()
  }
}

