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
 * ==========================================
 * VOICE NAVIGATION MAP (Mobile PWA)
 * ==========================================
 *
 * **Tech Routes:**
 * - Dashboard: /m/tech/dashboard
 *   Voice: "Go to tech dashboard" | "Tech home"
 * - Job Details: /m/tech/job/:id
 *   Voice: "Open tech job [id]" | "Show job [id]"
 * - Map View: /m/tech/map
 *   Voice: "Go to tech map" | "Show map"
 * - Profile: /m/tech/profile
 *   Voice: "Tech profile" | "My tech profile"
 *
 * **Sales Routes:**
 * - Dashboard: /m/sales/dashboard
 *   Voice: "Go to sales dashboard" | "Sales home"
 * - Leads: /m/sales/leads
 *   Voice: "Show leads" | "Sales leads"
 * - Meeting Briefing: /m/sales/briefing/:contactId
 *   Voice: "Open briefing for [contact]" | "Show briefing [id]"
 * - Active Meeting: /m/sales/meeting/:meetingId
 *   Voice: "Go to meeting [id]" | "Open meeting [id]"
 * - Profile: /m/sales/profile
 *   Voice: "Sales profile" | "My sales profile"
 *
 * **Owner Routes:**
 * - Dashboard: /m/owner/dashboard
 *   Voice: "Go to owner dashboard" | "Owner home"
 *
 * **Smart Context Detection:**
 * - If user says "dashboard" without role, the system infers from current route
 * - Example: On /m/tech/job/123 → "Go to dashboard" → /m/tech/dashboard
 * - Example: On /m/sales/leads → "Go to dashboard" → /m/sales/dashboard
 *
 * **Implementation Note:**
 * The actual routing logic with smart aliasing is implemented in
 * components/voice-conversation-provider.tsx (navigation tool handler)
 *
 * ==========================================
 * CRITICAL: This component uses the SHARED conversation context
 * ==========================================
 *
 * This component does NOT create its own useConversation instance.
 * It relies on VoiceConversationProvider being wrapped around the app in providers.tsx
 *
 * The clientTools (including navigation) are registered in VoiceConversationProvider
 * and are attached to the session when VoiceAgentWidget calls startSessionWithTools()
 */

export function VoiceNavigationBridge() {
  // This component is intentionally minimal
  // The actual client tools are registered in VoiceConversationProvider
  // Session is started when user clicks the voice button in VoiceAgentWidget

  console.log('[VoiceNavigationBridge] Mounted - Client tools registered in VoiceConversationProvider')

  // Headless component - renders nothing
  return null
}
