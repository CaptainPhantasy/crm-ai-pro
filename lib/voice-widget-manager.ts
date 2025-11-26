/**
 * Voice Widget Manager
 * 
 * This module manages the ElevenLabs voice widget completely OUTSIDE of React.
 * The widget DOM node is created once with vanilla JS and NEVER touched by React,
 * ensuring that active calls/WebSocket connections persist across route changes.
 * 
 * WHY THIS EXISTS:
 * - React's reconciliation can reset custom elements even with React.memo
 * - createPortal still lets React manage the portal content
 * - The only way to preserve an active call is complete DOM isolation
 */

// Singleton state - lives outside any component lifecycle
let widgetInitialized = false
let widgetContainer: HTMLDivElement | null = null
let widgetElement: HTMLElement | null = null

const AGENT_ID = 'agent_6501katrbe2re0c834kfes3hvk2d'
const SCRIPT_URL = 'https://unpkg.com/@elevenlabs/convai-widget-embed'

/**
 * Reposition existing widget - applies CSS overrides to fix positioning
 */
function repositionExistingWidget(): void {
  if (!widgetContainer || !widgetElement) return
  
  const sidebar = findSidebar()
  if (!sidebar) return
  
  // Move container to sidebar if it's not already there
  if (widgetContainer.parentElement !== sidebar) {
    // Ensure sidebar has position relative
    const sidebarStyle = window.getComputedStyle(sidebar)
    if (sidebarStyle.position === 'static') {
      sidebar.style.position = 'relative'
    }
    
    // Update container positioning
    widgetContainer.style.cssText = `
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      padding: 0.75rem !important;
      z-index: 10 !important;
      pointer-events: auto !important;
    `
    
    sidebar.appendChild(widgetContainer)
  }
  
  // Override widget element's internal positioning after it loads
  const overrideWidgetStyles = () => {
    if (!widgetElement) return
    
    // Force override any fixed positioning the widget might use
    const widgetShadow = widgetElement.shadowRoot
    if (widgetShadow) {
      // Widget uses shadow DOM - inject styles into shadow root
      const style = document.createElement('style')
      style.textContent = `
        :host {
          position: relative !important;
          bottom: auto !important;
          left: auto !important;
          right: auto !important;
          width: 100% !important;
          max-width: 100% !important;
        }
      `
      if (!widgetShadow.querySelector('style[data-widget-override]')) {
        style.setAttribute('data-widget-override', 'true')
        widgetShadow.appendChild(style)
      }
    } else {
      // Direct style override if no shadow DOM
      widgetElement.style.cssText += `
        position: relative !important;
        bottom: auto !important;
        left: auto !important;
        right: auto !important;
        width: 100% !important;
        max-width: 100% !important;
      `
    }
  }
  
  // Try to override immediately
  overrideWidgetStyles()
  
  // Also try after a delay (widget might load async)
  setTimeout(overrideWidgetStyles, 500)
  setTimeout(overrideWidgetStyles, 1000)
  setTimeout(overrideWidgetStyles, 2000)
}

/**
 * Find the sidebar element
 */
function findSidebar(): HTMLElement | null {
  const aside = document.querySelector('aside.w-60, aside[class*="border-r"]')
  if (aside && aside.tagName === 'ASIDE') {
    return aside as HTMLElement
  }
  return document.querySelector('aside') as HTMLElement | null
}

/**
 * Initialize the voice widget.
 * This creates the DOM structure ONCE and never removes it.
 * Safe to call multiple times - will no-op if already initialized.
 */
export function initializeVoiceWidget(): void {
  // Only run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  // Check if widget already exists in DOM FIRST (handles HMR, fast refresh, etc.)
  const existingContainer = document.getElementById('elevenlabs-voice-widget-root')
  if (existingContainer) {
    widgetContainer = existingContainer as HTMLDivElement
    widgetElement = existingContainer.querySelector('elevenlabs-convai')
    widgetInitialized = true
    console.log('[VoiceWidget] Found existing widget in DOM, reusing (connection preserved)')
    
    // Reposition existing widget if needed
    repositionExistingWidget()
    return
  }

  // Singleton check - module-level flag (for client-side navigation)
  if (widgetInitialized) {
    console.log('[VoiceWidget] Already initialized (module flag), skipping')
    return
  }


  // Try to find sidebar and append widget at the bottom
  const tryAppendToSidebar = (retries = 0): void => {
    const sidebar = findSidebar()
    
    if (sidebar) {
      // Ensure sidebar has position relative for absolute positioning of child
      const sidebarStyle = window.getComputedStyle(sidebar)
      if (sidebarStyle.position === 'static') {
        sidebar.style.position = 'relative'
      }
      
      // Create container div - positioned absolutely at bottom of sidebar
      widgetContainer = document.createElement('div')
      widgetContainer.id = 'elevenlabs-voice-widget-root'
      widgetContainer.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        padding: 0.75rem;
        z-index: 10;
        pointer-events: auto;
      `

      // Create the ElevenLabs custom element
      widgetElement = document.createElement('elevenlabs-convai')
      widgetElement.setAttribute('agent-id', AGENT_ID)
      
      // Style the widget element to be compact and fit sidebar
      widgetElement.style.cssText = `
        width: 100%;
        max-width: 100%;
        height: auto;
        min-height: 180px;
        max-height: 250px;
        display: block;
      `

      // Append widget to container
      widgetContainer.appendChild(widgetElement)

      // Append to sidebar - positioned absolutely at the bottom
      sidebar.appendChild(widgetContainer)
      
      // Load the ElevenLabs script if not already loaded
      if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
        const script = document.createElement('script')
        script.src = SCRIPT_URL
        script.async = true
        script.type = 'text/javascript'
        script.onload = () => {
          // Override widget styles after script loads
          setTimeout(() => {
            if (widgetElement) {
              const widgetShadow = widgetElement.shadowRoot
              if (widgetShadow) {
                const style = document.createElement('style')
                style.textContent = `
                  :host {
                    position: relative !important;
                    bottom: auto !important;
                    left: auto !important;
                    right: auto !important;
                    width: 100% !important;
                    max-width: 100% !important;
                  }
                `
                if (!widgetShadow.querySelector('style[data-widget-override]')) {
                  style.setAttribute('data-widget-override', 'true')
                  widgetShadow.appendChild(style)
                }
              } else {
                widgetElement.style.cssText += `
                  position: relative !important;
                  bottom: auto !important;
                  left: auto !important;
                  right: auto !important;
                  width: 100% !important;
                  max-width: 100% !important;
                `
              }
            }
          }, 100)
        }
        document.head.appendChild(script)
      } else {
        // Script already loaded, override styles now
        setTimeout(() => {
          if (widgetElement) {
            const widgetShadow = widgetElement.shadowRoot
            if (widgetShadow) {
              const style = document.createElement('style')
              style.textContent = `
                :host {
                  position: relative !important;
                  bottom: auto !important;
                  left: auto !important;
                  right: auto !important;
                  width: 100% !important;
                  max-width: 100% !important;
                }
              `
              if (!widgetShadow.querySelector('style[data-widget-override]')) {
                style.setAttribute('data-widget-override', 'true')
                widgetShadow.appendChild(style)
              }
            } else {
              widgetElement.style.cssText += `
                position: relative !important;
                bottom: auto !important;
                left: auto !important;
                right: auto !important;
                width: 100% !important;
                max-width: 100% !important;
              `
            }
          }
        }, 500)
      }
      
      widgetInitialized = true
      console.log('[VoiceWidget] Appended to bottom of sidebar')
    } else if (retries < 10) {
      // Retry after a short delay
      setTimeout(() => tryAppendToSidebar(retries + 1), 100)
    } else {
      // Fallback to body if sidebar not found after retries
      widgetContainer = document.createElement('div')
      widgetContainer.id = 'elevenlabs-voice-widget-root'
      widgetContainer.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 9999;
        pointer-events: auto;
        width: 240px;
      `
      
      widgetElement = document.createElement('elevenlabs-convai')
      widgetElement.setAttribute('agent-id', AGENT_ID)
      widgetContainer.appendChild(widgetElement)
      
      // Load the ElevenLabs script if not already loaded
      if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
        const script = document.createElement('script')
        script.src = SCRIPT_URL
        script.async = true
        script.type = 'text/javascript'
        document.head.appendChild(script)
      }
      
      document.body.appendChild(widgetContainer)
      widgetInitialized = true
      console.warn('[VoiceWidget] Sidebar not found after retries, using fallback position')
    }
  }

  // Start trying to append to sidebar
  tryAppendToSidebar()

  // Load the ElevenLabs script if not already loaded
  if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.type = 'text/javascript'
    document.head.appendChild(script)
  }

  widgetInitialized = true
  console.log('[VoiceWidget] Initialized - widget will persist across all route changes')
}

/**
 * Show the voice widget
 */
export function showVoiceWidget(): void {
  if (widgetContainer) {
    widgetContainer.style.display = 'block'
  }
}

/**
 * Hide the voice widget (without destroying it)
 */
export function hideVoiceWidget(): void {
  if (widgetContainer) {
    widgetContainer.style.display = 'none'
  }
}

/**
 * Check if widget is initialized
 */
export function isVoiceWidgetInitialized(): boolean {
  return widgetInitialized
}

/**
 * Destroy the widget completely (use sparingly - e.g., on logout)
 * This will end any active call.
 */
export function destroyVoiceWidget(): void {
  if (widgetContainer && widgetContainer.parentNode) {
    widgetContainer.parentNode.removeChild(widgetContainer)
  }
  widgetContainer = null
  widgetElement = null
  widgetInitialized = false
  console.log('[VoiceWidget] Destroyed')
}

/**
 * Force reinitialize the widget (useful for repositioning)
 * This will destroy and recreate the widget.
 */
export function reinitializeVoiceWidget(): void {
  destroyVoiceWidget()
  // Reset the flag so it can be initialized again
  widgetInitialized = false
  initializeVoiceWidget()
}

