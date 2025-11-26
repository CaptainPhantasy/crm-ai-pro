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
    return
  }

  // Singleton check - module-level flag (for client-side navigation)
  if (widgetInitialized) {
    console.log('[VoiceWidget] Already initialized (module flag), skipping')
    return
  }

  // Create container div - this will NEVER be removed
  widgetContainer = document.createElement('div')
  widgetContainer.id = 'elevenlabs-voice-widget-root'
  widgetContainer.style.cssText = `
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 9999;
    pointer-events: auto;
  `

  // Create the ElevenLabs custom element
  widgetElement = document.createElement('elevenlabs-convai')
  widgetElement.setAttribute('agent-id', AGENT_ID)

  // Append widget to container
  widgetContainer.appendChild(widgetElement)

  // Append container to body - OUTSIDE any React root
  document.body.appendChild(widgetContainer)

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

