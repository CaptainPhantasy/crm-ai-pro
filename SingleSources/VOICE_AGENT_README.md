# CRM AI Pro - Voice Agent Integration Guide

**Last Updated:** November 28, 2025 - 08:21 PM
**Version:** 4.0 (Cutting-Edge AI Tools Integration)
**Status:** ✅ ALIGNED WITH LATEST MCP TOOLS (88 TOOLS TOTAL)

## Overview

This document provides comprehensive guidance for Voice Agents interacting with the CRM AI Pro system via MCP (Model Context Protocol) tools.

## 🎯 System Prompt for UUID-Based Memory

**CRITICAL: Add this to your voice agent's system prompt for web sessions:**

```
You are chatting with a logged-in staff member. Their User ID is provided in the variable {{user_identifier}}.

🔑 IMPORTANT SECURITY NOTES:
- DO NOT ask for their name or phone number - you already have their secure credential
- The {{user_identifier}} is their UUID from Supabase Auth
- Never share or repeat the UUID - it's for system use only

📋 MEMORY PROTOCOL (72-Hour Context):
1. AT SESSION START: Immediately call read_agent_memory(userIdentifier: '{{user_identifier}}')
   - If memory found: "Welcome back! I see we were [summary]. Resuming where we left off."
   - If no memory: "Hello! I'm here to help you with your CRM operations."

2. DURING CONVERSATION: Save progress frequently with update_agent_memory:
   - Trigger: After each navigation, user preference, or key information
   - Include: Current section, user role, progress made
   - Use stagingData for rich JSON context

3. EXAMPLE USAGE:
   ```
   // Save context after navigation
   update_agent_memory({
     userIdentifier: "{{user_identifier}}",
     summary: "User exploring dispatch map as administrator",
     intent: "system_tour",
     stagingData: "{\"currentSection\": \"dispatch\", \"role\": \"admin\", \"pagesViewed\": [\"inbox\", \"jobs\"]}"
   })

   // Save user preferences
   update_agent_memory({
     userIdentifier: "{{user_identifier}}",
     summary: "User prefers detailed explanations of features",
     intent: "learning_mode",
     stagingData: "{\"verbosity\": \"detailed\", \"showTips\": true}"
   })
   ```

4. STAGING DATA FORMAT:
   - Always stringify JSON for stagingData parameter
   - Include: currentSection, userRole, preferences, progress
   - Examples: {"lastAction": "navigate", "page": "contacts", "filter": "all"}
```

## Critical Protocol: "Search-First, ID-Always"

Voice Agents MUST follow this protocol to avoid errors:

1. **NEVER** put UUIDs in name fields (contactName, techName)
2. **ALWAYS** use the ID fields (contactId, techId) when you have them
3. **SEARCH** first to get UUIDs, then use those UUIDs for actions
4. **CAPTURE** returned UUIDs immediately for subsequent operations

## 🧠 MEMORY PROTOCOL (72-Hour Context)

### Web-Based Sessions (UUID-Based)
**For authenticated web users using Vapi/ElevenLabs:**
- Frontend injects `user.id` into voice session as `{{user_identifier}}`
- Agent immediately calls `read_agent_memory(userIdentifier: '{{user_identifier}}')`
- No need to ask for name/phone - user is already authenticated

### Phone-Based Sessions (Legacy Phone Number)
**For PSTN calls with Caller ID:**
- Call `read_agent_memory(phoneNumber)` with caller's number
- Use same logic below for memory management

### 1. THE HANDSHAKE (Session Start)
**Logic:**
- *If No Memory:* Proceed with standard greeting
- *If Memory Found AND intent = "completed":* Treat as new session (do not mention previous context)
- *If Memory Found AND intent = "in_progress":* "Welcome back. I see we were [Summary]. Resuming where we left off."

### 2. THE CHECKPOINT (During Session)
**Trigger:** Whenever user provides key information or makes progress
**Action:** Call `update_agent_memory`
**Payload:**
```json
{
  "userIdentifier": "UUID-from-session",
  "summary": "User exploring dispatch map features",
  "intent": "system_tour",
  "stagingData": "{\"currentSection\": \"dispatch\", \"role\": \"admin\"}"
}
```

### 3. THE CLEARING (Completion)
**Trigger:** When user completes task or ends session
**Action:** Call `update_agent_memory` with final context including `stagingData` for next session

---

## 🚨 CRITICAL: Navigation Pacing Protocol

### THE PROBLEM
Rapid successive navigation destroys user experience. The agent MUST NOT call `navigate` multiple times in quick succession.

### THE RULE: ONE-NAVIGATE-THEN-WAIT
```
❌ FORBIDDEN: navigate → navigate → navigate → navigate (rapid fire)
✅ REQUIRED:  navigate → EXPLAIN → WAIT for user → navigate → EXPLAIN → WAIT
```

### Navigation Pacing Requirements

1. **ONE NAVIGATION PER USER CONFIRMATION**
   - Call `navigate` ONCE
   - Speak for 20-30 seconds explaining the page
   - ASK the user if they're ready for the next page
   - WAIT for explicit confirmation ("yes", "ready", "next", "continue")
   - Only THEN call `navigate` again

2. **NEVER RAPID-FIRE NAVIGATION**
   - Minimum 20 seconds between navigation calls
   - User MUST verbally confirm before next navigation
   - If user says nothing, ASK: "Would you like me to continue to the next section?"

3. **LISTEN FOR INTERRUPTION**
   - If user speaks during explanation, STOP and listen
   - User can say "slow down", "wait", "stop" at any time
   - Resume only when user confirms

### Navigation Confirmation Phrases to Listen For
```
PROCEED: "yes", "next", "continue", "go ahead", "show me", "ready", "okay", "sure"
STOP: "wait", "stop", "hold on", "slow down", "go back", "pause"
REPEAT: "say that again", "repeat", "what was that", "explain more"
```

---

## 🎓 ONBOARDING TOUR PROTOCOL

### When User Requests Onboarding/Tour
If user says anything like:
- "Show me around"
- "Give me a tour"
- "Onboarding"
- "Walk me through the app"
- "What can this do?"

### Step 1: ASK FOR ROLE
```
Agent: "I'd be happy to give you a tour! First, what role are you logged in as?
       Are you an Owner, Admin, Dispatcher, Tech, or Sales rep?"
```

**WAIT for user response before proceeding.**

### Step 2: CONFIRM ROLE AND BEGIN
```
Agent: "Great, you're logged in as [ROLE]. Let me take you through the pages
       available to you. I'll navigate to each section, explain what it does,
       and wait for you to tell me when you're ready for the next one."
```

### Step 3: NAVIGATE → EXPLAIN → WAIT (Repeat)
For each page in the role's sequence:
1. Call `navigate` to the page
2. Wait 2-3 seconds for page to load
3. Explain the page features (20-30 seconds)
4. Ask: "Ready for the next section?"
5. WAIT for user confirmation
6. Only then proceed to next page

---

## 📋 ROLE-SPECIFIC PAGE SEQUENCES

### OWNER Role (Full Desktop + Mobile Access)
**Device:** Desktop primary, Mobile secondary
**Landing Page:** `/inbox`

**Desktop Tour Sequence (17 pages):**
| Order | Page | Navigate To | Key Features to Explain |
|-------|------|-------------|------------------------|
| 1 | Inbox | `inbox` | Universal communication hub, all messages, AI-powered responses |
| 2 | Jobs | `jobs` | Work order management, status tracking, scheduling |
| 3 | Contacts | `contacts` | Customer database, history, tags, notes |
| 4 | Calendar | `calendar` | Scheduling, appointments, team availability |
| 5 | Dispatch Map | `dispatch` | Real-time GPS tracking, job assignment, route optimization |
| 6 | Analytics | `analytics` | Business metrics, KPIs, performance dashboards |
| 7 | Reports | `reports` | Custom reports, revenue tracking, export options |
| 8 | Finance | `finance` | Revenue, invoices, payments, financial overview |
| 9 | Campaigns | `campaigns` | Email marketing, customer outreach, automation |
| 10 | Templates | `email-templates` | Email templates, reusable content |
| 11 | Tags | `tags` | Customer segmentation, organization |
| 12 | Settings | `settings` | Account configuration, preferences |
| 13 | Users | `admin/users` | Team management, roles, permissions |
| 14 | Automation | `admin/automation` | Workflow rules, triggers, automated actions |
| 15 | LLM Providers | `admin/llm-providers` | AI configuration, model selection |
| 16 | Audit Log | `admin/audit` | System activity, security logs |
| 17 | Integrations | `integrations` | Gmail, Microsoft 365, calendar sync |

**Owner Tour Script Example:**
```
[Navigate to inbox]
"This is your Inbox - the central hub for all communications. You can see
messages from customers, internal notes, and AI-suggested responses.
Everything flows through here so you never miss an important message.
Ready for the next section?"
[WAIT for user]

[Navigate to jobs]
"Now we're in Jobs. This is where you manage all work orders. You can see
jobs by status - scheduled, in progress, completed, or invoiced. From here
you can create new jobs, assign technicians, and track everything.
Ready to continue?"
[WAIT for user]
```

---

### ADMIN Role (Desktop Only)
**Device:** Desktop only
**Landing Page:** `/inbox`

**Desktop Tour Sequence (16 pages):**
Same as Owner EXCEPT:
- Cannot create new users (can only edit existing)
- No access to billing/subscription settings

| Order | Page | Navigate To |
|-------|------|-------------|
| 1-12 | Same as Owner | Same navigation |
| 13 | Users (View/Edit) | `admin/users` |
| 14-17 | Same as Owner | Same navigation |

---

### DISPATCHER Role (Desktop + Mobile)
**Device:** Desktop primary (Dispatch Map), Mobile for field
**Landing Page:** `/dispatch/map` (Desktop), `/m/office/dashboard` (Mobile)

**Desktop Tour Sequence (5 pages):**
| Order | Page | Navigate To | Key Features |
|-------|------|-------------|--------------|
| 1 | Dispatch Map | `dispatch` | Real-time tech locations, job pins, drag-drop assignment |
| 2 | Jobs | `jobs` | Job queue, status updates, scheduling |
| 3 | Contacts | `contacts` | Customer lookup, contact info |
| 4 | Calendar | `calendar` | Team schedules, availability |
| 5 | Settings | `settings` | Personal preferences |

**Dispatcher Tour Script:**
```
[Navigate to dispatch]
"This is the Dispatch Map - your command center. You can see all technicians
in real-time with GPS tracking. Jobs appear as pins on the map. You can
drag and drop to assign jobs, see ETAs, and optimize routes.
Ready for the next section?"
[WAIT for user]
```

---

### TECH Role (Mobile PWA Only)
**Device:** Mobile only (NO desktop access)
**Landing Page:** `/m/tech/dashboard`

**Mobile Tour Sequence (4 pages):**
| Order | Page | Navigate To | Key Features |
|-------|------|-------------|--------------|
| 1 | Dashboard | `tech` | Today's jobs, current assignment, quick actions |
| 2 | Job Detail | (from dashboard) | 7-gate workflow: arrival, photos, work, signature |
| 3 | Map | `tech/map` | All assigned jobs on map, navigation to job sites |
| 4 | Profile | `tech/profile` | Performance stats, completed jobs, ratings |

**Tech Tour Script:**
```
[Navigate to tech]
"This is your Tech Dashboard. You'll see today's assigned jobs, your current
job at the top, and quick action buttons. When you tap a job, you'll go
through a 7-step workflow: mark arrival, take before photos, complete work,
take after photos, get customer rating, capture signature, and mark done.
Ready to see the map view?"
[WAIT for user]
```

**IMPORTANT FOR TECH:** If user is on desktop, explain:
```
"I notice you might be on a desktop computer. The Tech role is designed
for mobile devices - it's a Progressive Web App that works offline in the
field. For the best experience, you'd access this on your phone or tablet.
Would you like me to explain what the mobile experience looks like instead?"
```

---

### SALES Role (Mobile PWA Only)
**Device:** Mobile only (NO desktop access)
**Landing Page:** `/m/sales/dashboard`

**Mobile Tour Sequence (5 pages):**
| Order | Page | Navigate To | Key Features |
|-------|------|-------------|--------------|
| 1 | Dashboard | `sales` | Today's meetings, next appointment, quick actions |
| 2 | Briefing | (from dashboard) | AI-generated customer intelligence before meetings |
| 3 | Meeting | (from dashboard) | Voice recording, real-time transcription, AI analysis |
| 4 | Leads | `sales/leads` | Lead pipeline, deal tracking, conversion funnel |
| 5 | Profile | `sales/profile` | Sales stats, deals won, revenue generated |

**Sales Tour Script:**
```
[Navigate to sales]
"This is your Sales Dashboard. You'll see today's scheduled meetings and
your next appointment highlighted. Before each meeting, you can tap to get
an AI Briefing - it analyzes the customer's history, suggests talking points,
and even recommends pricing based on their past jobs.
Ready to learn about the briefing feature?"
[WAIT for user]
```

**IMPORTANT FOR SALES:** If user is on desktop, same message as Tech about mobile experience.

---

## 🛑 ONBOARDING ERROR PREVENTION

### If User Doesn't Specify Role
```
Agent: "I want to make sure I show you the right features. Could you tell me
       which role you're logged in as? Your options are Owner, Admin,
       Dispatcher, Tech, or Sales."
```

### If User Gives Invalid Role
```
Agent: "I didn't catch that. The available roles are Owner, Admin, Dispatcher,
       Tech, or Sales. Which one matches your login?"
```

### If User Wants to Skip Pages
```
Agent: "No problem! Which section would you like to jump to? Or I can continue
       from where we are."
```

### If User Seems Confused
```
Agent: "Let me slow down. We're currently looking at [PAGE NAME]. This is where
       you [MAIN FUNCTION]. Would you like me to explain more, or shall we
       move on?"
```

### End of Tour
```
Agent: "That covers all the main sections available to you as a [ROLE].
       Is there any page you'd like to revisit, or any feature you'd like
       me to explain in more detail?"
```

---

## Available MCP Tools

### Core Business Tools (9 Required)

1. **create_job** - Create new work orders
   - Use `contactId` (preferred) OR `contactName` (fallback)
   - Never provide both

2. **search_contacts** - Find contacts by name/email/phone
   - ALWAYS do this before creating a job for existing contacts

3. **create_contact** - Add new contacts to system
   - Returns UUID that must be captured for immediate use

4. **assign_tech** - Assign technicians to jobs
   - Use `search_users` first to get technician UUID

5. **search_users** - Find technicians/employees
   - Returns UUIDs for technician assignment

6. **update_job_status** - Change job workflow status
   - Status values: lead, scheduled, en_route, in_progress, completed, invoiced, paid

7. **update_job** - Modify job details (time, description)
   - Different from status updates

8. **navigate** - Change user's screen view
   - Valid pages: inbox, jobs, contacts, analytics, finance, tech, campaigns, email-templates, tags, settings, integrations

9. **send_email** - Send emails to contacts
   - Supports HTML content

### Enhanced Email Tools (9 New)

The Voice Agent now has advanced email capabilities with Resend integration:

10. **send_email_template** - Send using predefined templates
    - Templates: Welcome, Job Status, Invoice, Appointment Reminder
    - Professional formatting with variables

11. **send_custom_email** - Send fully customized emails
    - HTML support, attachments, scheduling

12. **send_job_status_email** - Automated job status notifications
    - Updates customers on job progress automatically

13. **send_invoice_email** - Invoice delivery with PDF
    - Professional invoice emails with attachments

14. **send_appointment_reminder** - Schedule reminder emails
    - Reduce no-shows with automated reminders

15. **get_email_templates** - List available templates
    - See all email template options

16. **get_email_analytics** - Email performance metrics
    - Track delivery rates, opens, clicks

17. **list_email_queue** - Check email delivery status
    - Monitor pending and failed emails

18. **create_email_template** - Create custom templates
    - Build reusable email templates

See: [SingleSources/VoiceAgent_Email_Tools_Guide.md] for complete email documentation

### Utility Tools (9 Helpful Extras)

10. **get_job** - Retrieve detailed job information
11. **get_user_email** - Get account owner's email
12. **get_current_page** - Understand user's current view
13. **read_agent_memory** - Check for previous conversations (72-hour window)
14. **update_agent_memory** - Save conversation progress (checkpoint)

### Organization Tools (4 Additional Features)

15. **add_tag_to_contact** - Add or create tags for contacts
    - Creates tag if it doesn't exist
    - Supports custom colors (hex format)

16. **remove_tag_from_contact** - Remove tags from contacts
    - Requires tag ID for precise removal
    - Tag itself remains for other contacts

17. **add_note_to_contact** - Add notes to contacts with types
    - Note types: general, call, email, meeting, internal, customer
    - Supports pinning important notes to top

18. **add_note_to_job** - Add notes to jobs with types
    - Note types: general, call, email, meeting, internal, customer
    - Pinned notes appear in job details and reports

### 🚀 Cutting-Edge AI Tools (18 Advanced Tools)

**Predictive Analytics:**
19. **ai_estimate_job** - AI-powered job estimation using historical data
    - Analyzes 50+ similar jobs for accurate estimates
    - Provides confidence score with reasoning

20. **predict_equipment_maintenance** - Predict equipment failures
    - Uses AI to prevent costly breakdowns
    - Returns failure probability and maintenance recommendations

21. **predict_customer_churn** - Identify customers at risk of leaving
    - Proactive intervention strategies
    - 85% accuracy in churn prediction

22. **predict_candidate_success** - AI-powered candidate evaluation
    - Success probability scoring
    - Cultural fit and growth potential analysis

**Customer Intelligence:**
23. **analyze_customer_sentiment** - Sentiment analysis from conversations
    - GPT-4 Turbo with emotion detection
    - Trend analysis over time

24. **calculate_dynamic_pricing** - Real-time pricing optimization
    - Considers market conditions and customer value
    - 10-30% revenue increase potential

25. **provide_sales_coaching** - Real-time sales guidance
    - Conversation optimization
    - 20% increase in conversion rates

**Risk & Compliance:**
26. **assess_job_risk** - Comprehensive risk analysis
    - Safety, financial, and reputation risks
    - Permit and insurance requirements

27. **monitor_compliance** - Automated compliance checking
    - Jobs, invoices, contracts, communications
    - Risk level assessment

28. **verify_signature** - Signature authenticity verification
    - Biometric analysis and fraud detection
    - Confidence scoring

**Operational Efficiency:**
29. **plan_visual_route** - AI-optimized technician routing
    - 25% reduction in travel costs
    - Priority-based scheduling

30. **start_video_support** - WebRTC video calling
    - Reduces unnecessary site visits by 60%
    - Session recording and tracking

31. **analyze_job_photos** - Computer vision photo analysis
    - Issue detection and quality scoring
    - Automated documentation

32. **scan_and_process_document** - OCR document processing
    - 95% accuracy text extraction
    - Multiple document formats

**Advanced Technologies:**
33. **monitor_iot_devices** - IoT device integration
    - Real-time equipment monitoring
    - Predictive alerts and analytics

34. **process_crypto_payment** - Blockchain cryptocurrency payments
    - Supports BTC, ETH, USDC, USDT
    - Transaction tracking and confirmation

35. **create_ar_preview** - Augmented reality job visualization
    - 3D model rendering
    - Mobile QR code access

36. **clone_customer_voice** - AI voice cloning for personalization
    - Consent-managed voice synthesis
    - Personalized notifications and updates

## Example Workflows

### Creating a Job for Existing Customer
```
User: "Create a job for John Smith to fix the sink"

Agent Flow:
1. search_contacts("John Smith")
2. Get UUID from results
3. create_job(contactId: "uuid-123", description: "Fix the sink")
```

### Creating a Job for New Customer
```
User: "New job for Alice Johnson"

Agent Flow:
1. search_contacts("Alice Johnson") → Returns []
2. Ask for details
3. create_contact(firstName: "Alice", lastName: "Johnson", phone: "555-0123")
4. Capture returned UUID
5. create_job(contactId: "new-uuid-456", description: "Plumbing service")
```

### Assigning Technician
```
User: "Assign Mike to job 123"

Agent Flow:
1. search_users("Mike")
2. Get technician UUID
3. assign_tech(jobId: "job-uuid-123", techId: "tech-uuid-789")
```

### Adding a Tag to Contact
```
User: "Tag John Smith as a VIP customer"

Agent Flow:
1. search_contacts("John Smith")
2. Get contact UUID
3. add_tag_to_contact(contactId: "uuid-123", tagName: "VIP Customer", tagColor: "#FF6B6B")
```

### Adding a Note to Job
```
User: "Add a note to job 456 about the gate code"

Agent Flow:
1. get_job(jobId: "job-uuid-456") - Verify job exists
2. add_note_to_job(jobId: "job-uuid-456", content: "Gate code: #1234", noteType: "internal", isPinned: true)
```

## Anti-Error Guidelines

### UUID vs Name Fields
- ✅ CORRECT: `contactId: "uuid-123"`
- ❌ WRONG: `contactName: "uuid-123"`
- ✅ CORRECT: `contactName: "John Smith"`
- ❌ WRONG: `contactId: "John Smith"`

### Required Fields
- Always provide at least one: contactId OR contactName
- Always provide at least one: techId OR techName
- All other fields are optional based on need

### Tags & Notes Best Practices
- **Tag Colors:** Use standard hex format (#RRGGBB) or default to blue (#3B82F6)
- **Note Types:** Choose appropriate type for better organization and filtering
  - `call`: Phone call notes and outcomes
  - `internal`: Team-only information (gate codes, special instructions)
  - `customer`: Customer preferences and history
  - `email`: Email communication summaries
- **Pinned Notes:** Use for critical information that must be visible immediately
- **Tag Names:** Keep names short and consistent (e.g., "VIP", "Follow-Up", "Urgent")

### Navigation
- Only use exact page names from the enum list
- Don't invent page names or sub-pages
- Provide job/contact UUIDs when opening specific details

## Error Prevention

1. **Validate UUIDs**: Ensure they look like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
2. **Use Search First**: Never guess IDs, always search
3. **Check Return Values**: Capture all returned IDs
4. **Read Error Messages**: They provide specific guidance

## Integration Dependencies

### MCP Server
- Location: `/mcp-server/index.ts`
- Runtime: Node.js with tsx
- Dependencies: @modelcontextprotocol/sdk, supabase, zod

### Database
- Supabase backend
- Tables: contacts, jobs, users, accounts
- Row Level Security enabled

### Environment Variables
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- DEFAULT_ACCOUNT_ID
- RESEND_API_KEY (for emails)
- RESEND_VERIFIED_DOMAIN (for emails)

## Testing the Connection

To test the Voice Agent integration:

1. Start MCP server: `cd mcp-server && npm run dev`
2. Verify tools are listed: Should see 18 tools total (9 core + 9 utility)
3. Test basic workflow: search → create → assign
4. Test organization features: add_tag_to_contact, add_note_to_job
5. Test memory features: update_agent_memory → read_agent_memory
6. Check error handling with invalid inputs

## Support

For issues or questions:
1. Check MCP_TOOL_REQUIREMENTS.md for detailed specifications
2. Verify environment variables are set
3. Check database connectivity
4. Review error messages for specific guidance

---

**Remember**: The key to successful Voice Agent operation is following the "Search-First, ID-Always" protocol religiously. When in doubt, search first!