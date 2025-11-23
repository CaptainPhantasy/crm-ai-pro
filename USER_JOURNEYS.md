# CRM-AI Pro: User Journeys Based on Actual Code

## Overview
This document maps user journeys based on **actual implemented code**, not documentation. It identifies what exists and what's missing for seven departments in a home services company.

## Roles Defined in Code
From `supabase/schema.sql`:
- **owner**: Full system access
- **admin**: Administrative access
- **dispatcher**: Job assignment and scheduling
- **tech**: Field technician access

---

## Department 1: Dispatch/Operations

### Admin/Dispatcher Journey

**First Touch (Morning)**
1. ✅ **Login** → Dashboard layout (`app/(dashboard)/layout.tsx`)
2. ✅ **Navigate to Inbox** (`/inbox`) → View conversations (`components/dashboard/conversation-list.tsx`)
   - See open conversations
   - Filter by status (open, closed, snoozed)
   - View last message timestamp
3. ✅ **Review Jobs** (`/jobs`) → Jobs page (`app/(dashboard)/jobs/page.tsx`)
   - View stats: Total, Completed, In Progress, Revenue
   - See job list with status badges
   - Filter by status, tech assignment

**Daily Workflow**
4. ✅ **Handle Inbound Email** → Inbox page
   - Email arrives → `handle-inbound-email` edge function processes it
   - Conversation appears in inbox
   - Click conversation → `MessageThread` component loads
5. ✅ **AI Draft Generation** → Message thread
   - Click "Generate Draft" → `/api/ai/draft` endpoint
   - Uses LLM router → Selects provider (OpenAI/Anthropic)
   - RAG search (`rag-search` edge function) retrieves knowledge docs
   - Draft appears in thread
6. ✅ **Send Message** → `/api/send-message` endpoint
   - Type or edit draft
   - Send → Resend API sends email
   - Message saved to `messages` table
7. ✅ **Create Job from Conversation** → Create Job Dialog (`components/jobs/create-job-dialog.tsx`)
   - Click "New Job" → Dialog opens
   - Select contact (from conversation or search)
   - Enter description, schedule time
   - Submit → `/api/jobs` POST → `create-job` edge function
8. ✅ **Assign Technician** → Jobs page
   - View job → Click assign
   - Select tech → `/api/jobs/[id]/assign` PATCH
   - `assign-tech` edge function validates tech role
9. ✅ **Update Job Status** → Jobs page
   - Change status → `/api/jobs/[id]/status` PATCH
   - `update-job-status` edge function
   - Triggers email notification (if configured)

**Voice Commands (Natural Language)**
10. ✅ **Voice Interface** → `/voice-demo` page OR ElevenLabs webhook
   - Say: "Create a job for John Smith, plumbing repair, tomorrow at 2pm"
   - Webhook → `/api/webhooks/elevenlabs` → `voice-command` edge function
   - OpenAI function calling parses command
   - Executes tool: `create_job`
   - Responds with confirmation

**Last Touch (End of Day)**
11. ✅ **Review Completed Jobs** → Jobs page
    - Filter by status: completed
    - View revenue stats
12. ✅ **Close Conversations** → Inbox
    - Mark conversations as closed
    - Update status in database

**MISSING Features:**
- ❌ Bulk job assignment
- ❌ Schedule optimization/route planning
- ❌ Real-time tech location tracking
- ❌ Automated scheduling suggestions
- ❌ Dispatch queue management
- ❌ Priority assignment rules

---

## Department 2: Field Service/Technicians

### Tech Journey (Bottom Level)

**First Touch (Morning)**
1. ✅ **Login** → Dashboard layout
2. ✅ **Navigate to Tech Dashboard** (`/tech/dashboard`) → Tech dashboard page
   - View today's jobs count
   - See completed, in progress, revenue stats
   - Tabs: Today, Upcoming, Completed

**Daily Workflow**
3. ✅ **View Today's Schedule** → Tech dashboard
   - `/api/tech/jobs` GET → Filters by `tech_assigned_id`
   - See jobs with: customer name, address, scheduled time, description
   - Status badges: scheduled, en_route, in_progress, completed
4. ✅ **Navigate to Job** → Click "Navigate" button
   - Opens Google Maps with address
   - Uses `job.contact.address`
5. ✅ **Start Job** → Click "Start Job" button
   - Updates status to `en_route` → `/api/tech/jobs/[id]/status` PATCH
   - `update-job-status` edge function
6. ✅ **Mark In Progress** → Click "In Progress" button
   - Updates status to `in_progress`
   - Customer notified (if automation configured)
7. ✅ **Upload Photo** → Click "Upload Photo" button
   - Select image → `/api/jobs/[id]/upload-photo` POST
   - File validation (type, size)
   - Photo stored (implementation depends on storage)
8. ✅ **Complete Job** → Click "Complete" button
   - Updates status to `completed`
   - `/api/tech/jobs/[id]/status` PATCH
   - Triggers automation: review request email (if configured)
9. ✅ **Call Dispatch** → Click "Call Dispatch" button
   - Currently shows alert (not implemented)
   - **MISSING**: Actual phone integration

**Voice Commands (Natural Language)**
10. ✅ **Voice Updates** → Via ElevenLabs or voice demo
    - Say: "Mark job 123 as completed"
    - `voice-command` edge function processes
    - Updates status via `update_job_status` tool

**Last Touch (End of Day)**
11. ✅ **Review Completed** → Tech dashboard
    - Switch to "Completed" tab
    - See all finished jobs
    - View revenue earned

**MISSING Features:**
- ❌ GPS location tracking
- ❌ Time tracking/clock in-out
- ❌ Material usage tracking
- ❌ Customer signature capture
- ❌ Notes/observations field
- ❌ Parts inventory management
- ❌ Real-time dispatch communication
- ❌ Mobile app (only web dashboard exists)

---

## Department 3: Sales/Customer Acquisition

### Admin/Sales Journey

**First Touch (Morning)**
1. ✅ **Login** → Dashboard
2. ✅ **View Contacts** (`/contacts`) → Contacts page
   - See total contacts, active, new this month stats
   - Search contacts by name, email, phone
   - `/api/contacts` GET with search parameter

**Daily Workflow**
3. ✅ **Add New Contact** → Contacts page
   - Click "Add Contact" → Currently shows alert
   - **MISSING**: Actual form implementation
   - Would use: `/api/contacts` POST
4. ✅ **Search Contacts** → Contacts page
   - Type in search → Debounced API call
   - `/api/contacts?search=...` GET
   - Results filtered by account_id (RLS)
5. ✅ **View Contact Details** → Contacts page
   - Click "View" → Currently shows alert
   - **MISSING**: Contact detail page/modal
   - Would use: `/api/contacts/[id]` GET
6. ✅ **Message Contact** → Contacts page
   - Click "Message" → Currently shows alert
   - **MISSING**: Direct conversation creation
   - Would navigate to inbox with contact pre-selected
7. ✅ **Create Job for Lead** → Jobs page
   - Click "New Job" → Create Job Dialog
   - Select contact → Create job
   - Job status: `lead` (from schema)

**Voice Commands (Natural Language)**
8. ✅ **Voice Search** → Via ElevenLabs
    - Say: "Find contact John Smith"
    - `voice-command` → `search_contacts` tool
    - Returns matching contacts

**Last Touch (End of Day)**
9. ✅ **Review New Leads** → Jobs page
    - Filter by status: `lead`
    - Follow up on unassigned leads

**MISSING Features:**
- ❌ Lead scoring
- ❌ Pipeline management
- ❌ Quote generation
- ❌ Follow-up reminders
- ❌ Contact import/export
- ❌ Email templates for sales
- ❌ CRM activity tracking
- ❌ Deal stages

---

## Department 4: Customer Service/Support

### Admin/Dispatcher Journey

**First Touch (Morning)**
1. ✅ **Login** → Dashboard
2. ✅ **Open Inbox** (`/inbox`) → Conversation list
   - See all open conversations
   - Sort by last message time
   - Filter by status

**Daily Workflow**
3. ✅ **Handle Customer Email** → Inbox
   - Email arrives → `handle-inbound-email` edge function
   - Creates/updates conversation
   - Links to contact (by email)
   - Message appears in inbox
4. ✅ **AI Draft Reply** → Message thread
   - Click conversation → `MessageThread` component
   - Click "Generate Draft" → `/api/ai/draft` POST
   - LLM router selects provider
   - RAG search retrieves relevant knowledge docs
   - Draft generated with context
5. ✅ **Edit and Send** → Message thread
   - Review AI draft
   - Edit if needed
   - Send → `/api/send-message` POST
   - Email sent via Resend
6. ✅ **Create Job from Issue** → Message thread
   - Customer reports problem
   - Click "Create Job" (if implemented)
   - Or navigate to Jobs → Create Job
   - Link job to conversation
7. ✅ **Automation Triggers** → Background
   - `automation-engine` edge function monitors
   - Triggers: unreplied_time, status_change, keyword, sentiment
   - Actions: create_draft, assign_tech, send_notification, create_job
   - **MISSING**: UI to configure automation rules

**Voice Commands (Natural Language)**
8. ✅ **Voice Support** → Via ElevenLabs
    - Customer calls → Voice agent answers
    - Say: "I need a plumber for a leak"
    - `voice-command` → Creates job
    - Responds: "Job created, we'll send someone tomorrow"

**Last Touch (End of Day)**
9. ✅ **Close Resolved Issues** → Inbox
    - Mark conversations as closed
    - Update status in database

**MISSING Features:**
- ❌ Live chat widget
- ❌ Phone call logging
- ❌ Ticket categorization
- ❌ SLA tracking
- ❌ Customer satisfaction surveys
- ❌ Knowledge base search UI
- ❌ FAQ management
- ❌ Escalation workflows
- ❌ Automation rule configuration UI

---

## Department 5: Accounting/Finance

### Admin/Owner Journey

**First Touch (Morning)**
1. ✅ **Login** → Dashboard
2. ✅ **View Jobs** (`/jobs`) → Jobs page
   - See revenue stat card
   - View jobs with `total_amount`
   - Filter by status

**Daily Workflow**
3. ✅ **View Job Revenue** → Jobs page
   - Each job shows `total_amount` (in cents)
   - Displayed as dollars: `(total_amount / 100).toFixed(2)`
   - Revenue stat: Sum of all job amounts
4. ✅ **Filter by Status** → Jobs page
   - Filter: completed, invoiced, paid
   - See payment status
5. ✅ **View Completed Jobs** → Jobs page
   - Filter by status: `completed`
   - See jobs ready for invoicing

**MISSING Features:**
- ❌ Invoice generation
- ❌ Payment processing (Stripe integration exists in schema but not implemented)
- ❌ Payment link generation (`stripe_payment_link` field exists)
- ❌ Accounts receivable tracking
- ❌ Expense tracking
- ❌ Financial reports
- ❌ Tax reporting
- ❌ Payment reminders
- ❌ Recurring billing
- ❌ Cost tracking per job
- ❌ Profit/loss reports

---

## Department 6: Management/Ownership

### Owner/Admin Journey

**First Touch (Morning)**
1. ✅ **Login** → Dashboard
2. ✅ **Dashboard Overview** → Multiple pages
   - Inbox: Unread conversations
   - Jobs: Total, completed, in progress, revenue
   - Contacts: Total, active, new this month

**Daily Workflow**
3. ✅ **Review Operations** → Jobs page
   - View all jobs across statuses
   - See tech assignments
   - Monitor completion rates
4. ✅ **Review Communications** → Inbox
   - Monitor customer conversations
   - Check AI draft quality
   - Review automation effectiveness
5. ✅ **View Analytics** → Stats cards on each page
   - Jobs: Total, completed, in progress, revenue
   - Contacts: Total, active, new this month
   - **MISSING**: Historical trends, charts, graphs
6. ✅ **Manage Users** → **MISSING**: User management UI
   - Users table exists in database
   - Roles: owner, admin, dispatcher, tech
   - **MISSING**: UI to add/edit users, assign roles
7. ✅ **Configure LLM Providers** → **MISSING**: LLM config UI
   - `llm_providers` table exists
   - API keys stored encrypted
   - **MISSING**: UI to manage providers, set use cases
8. ✅ **Configure Automation Rules** → **MISSING**: Automation UI
   - `automation_rules` table exists
   - `automation-engine` edge function exists
   - **MISSING**: UI to create/edit rules
9. ✅ **View Audit Logs** → **MISSING**: Audit log UI
   - `crmai_audit` table exists
   - Logs all actions
   - **MISSING**: UI to view/search logs

**Voice Commands (Natural Language)**
10. ✅ **Voice Queries** → Via ElevenLabs
    - Say: "What jobs do I have today?"
    - `voice-command` → `get_jobs` tool
    - Returns job list

**Last Touch (End of Day)**
11. ✅ **Review Performance** → Stats cards
    - Check completion rates
    - Review revenue
    - Monitor active contacts

**MISSING Features:**
- ❌ Comprehensive dashboard/analytics
- ❌ User management UI
- ❌ Role-based access control UI
- ❌ System configuration UI
- ❌ LLM provider management UI
- ❌ Automation rule configuration UI
- ❌ Audit log viewer
- ❌ Reports and exports
- ❌ Multi-tenant management (if SaaS)
- ❌ Account settings UI
- ❌ Business hours configuration
- ❌ Branding customization UI

---

## Department 7: Marketing

### Admin Journey

**First Touch (Morning)**
1. ✅ **Login** → Dashboard
2. ✅ **View Contacts** (`/contacts`) → Contacts page
   - See new contacts this month
   - Total contacts count

**Daily Workflow**
3. ✅ **Review New Contacts** → Contacts page
   - Filter by creation date
   - See contact details: email, phone, address
4. ✅ **Export Contacts** → **MISSING**: Export functionality
   - Contacts data available via API
   - **MISSING**: CSV/Excel export
5. ✅ **Create Campaign** → **MISSING**: Campaign management
   - No campaign features exist
6. ✅ **Send Bulk Messages** → **MISSING**: Bulk messaging
   - Individual messages work via `/api/send-message`
   - **MISSING**: Bulk send functionality

**MISSING Features:**
- ❌ Email marketing campaigns
- ❌ Contact segmentation
- ❌ A/B testing
- ❌ Campaign analytics
- ❌ Newsletter management
- ❌ Social media integration
- ❌ Review request automation (exists in plan but not implemented)
- ❌ Referral tracking
- ❌ Lead source tracking
- ❌ Marketing attribution
- ❌ Customer lifetime value
- ❌ Retention analytics

---

## Cross-Department Features

### ✅ Implemented
- Multi-tenant architecture (accounts table, RLS)
- Email-based communication (Resend integration)
- AI-powered draft generation (LLM router)
- Voice commands (ElevenLabs + OpenAI function calling)
- Job lifecycle management
- Contact management (basic)
- Tech field dashboard
- Automation engine (backend)
- RAG search (knowledge docs)
- Audit logging

### ❌ Missing Critical Features
- User management UI
- Role-based access control enforcement in UI
- Contact detail pages/modals
- Job detail pages/modals
- Invoice generation
- Payment processing UI
- Automation rule configuration UI
- LLM provider management UI
- Audit log viewer
- Reports and analytics dashboards
- Mobile app (React Native)
- Real-time notifications
- GPS tracking
- Phone integration
- Bulk operations
- Export functionality
- Campaign management
- Advanced search/filtering
- File attachments UI
- Notes/internal comments
- Customer portal
- Review request automation
- Schedule optimization

---

## Natural Language Interface (Voice/Text)

### ✅ Working
- Voice commands via ElevenLabs webhook
- OpenAI function calling for tool execution
- Tools: create_job, update_job_status, assign_tech, search_contacts, get_job, send_email
- Multi-turn conversations (in create_job tool)
- Natural language responses

### ❌ Missing
- GUI fallback for all voice commands
- Voice command history
- Voice command templates
- Custom voice commands
- Integration with GUI actions (bidirectional)

---

## Summary by Department

| Department | Implemented | Missing | Completion % |
|------------|-------------|---------|--------------|
| Dispatch/Operations | 10 features | 6 features | 63% |
| Field Service/Tech | 8 features | 8 features | 50% |
| Sales | 5 features | 8 features | 38% |
| Customer Service | 6 features | 9 features | 40% |
| Accounting/Finance | 2 features | 10 features | 17% |
| Management | 5 features | 11 features | 31% |
| Marketing | 1 feature | 12 features | 8% |

**Overall System Completion: ~35%**

The system has strong foundations (multi-tenant, AI, voice, automation) but needs significant UI development and feature completion for production use.

