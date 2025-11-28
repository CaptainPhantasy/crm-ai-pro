'use client'

/**
 * VoiceNavigationBridge
 *
 * This component solves the "Phantom Navigation" problem by ensuring
 * client-side navigation tools are available in the voice conversation context.
 *
 * **The Problem:**
 * - ElevenLabs Agent calls tools via MCP Server (Supabase Edge Function)
 * - Server cannot access browser DOM/window.location
 * - Result: Agent thinks navigation happened, but user's browser never moves
 *
 * **The Solution:**
 * - Client-side tools registered in VoiceConversationProvider
 * - When Agent calls the tool, it executes in the user's browser
 * - Real navigation happens, user experience is seamless
 *
 * **Architecture:**
 * - This is a "headless" component (renders null)
 * - It acts as a mounting point in the root layout
 * - Actual client tools are defined in VoiceConversationProvider
 * - Session starts when user clicks "Start a call" in VoiceAgentWidget
 *
 * **Available Client Tools:**
 * - `navigation`: Navigate to routes (e.g., /jobs, /settings)
 * - `get_current_page`: Get current route
 * - `scroll_to_section`: Scroll to an element by ID
 * - `trigger_ui_action`: Trigger custom UI events
 * - `open_new_tab`: Open URL in new tab
 */

export function VoiceNavigationBridge() {
  // This component is intentionally minimal
  // The actual client tools are registered in VoiceConversationProvider
  // Session is started when user clicks the voice button in VoiceAgentWidget

  // Headless component - renders nothing
  return null
}
