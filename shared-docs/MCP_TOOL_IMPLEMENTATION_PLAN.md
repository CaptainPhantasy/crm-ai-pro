# MCP Tool Implementation Plan

**Date**: 09:46:59 Nov 23, 2025  
**Status**: Wave 0 - Foundation Complete  
**Purpose**: Complete inventory of all MCP voice tools needed, implementation status, and roadmap for enterprise voice-only CRM operation.

---

## Executive Summary

This document provides a comprehensive inventory of all MCP (Model Context Protocol) tools needed for enterprise voice-only CRM operation. The plan covers:

- **Existing MCP Tools**: 21 tools (currently implemented)
- **Missing MCP Tools**: ~229 tools (from enterprise requirements)
- **Total Target**: ~250+ MCP voice tools

---

## Current MCP Tools Inventory

### File Location
- **Tools Definition**: `lib/mcp/tools/crm-tools.ts`
- **Tool Registry**: `lib/mcp/tools/index.ts`
- **MCP Server**: `lib/mcp/server.ts`
- **API Endpoint**: `app/api/mcp/route.ts`

### Currently Implemented Tools (21 tools)

#### Job Management (5 tools)
1. ✅ `create_job` - Create new job/work order
2. ✅ `get_job` - Get job details by ID
3. ✅ `list_jobs` - List jobs with filters
4. ✅ `update_job_status` - Update job status
5. ✅ `assign_tech` - Assign technician to job

#### Contact Management (3 tools)
6. ✅ `create_contact` - Create new contact
7. ✅ `get_contact` - Get contact details by ID
8. ✅ `search_contacts` - Search contacts by name/email/phone

#### Invoice Management (3 tools)
9. ✅ `create_invoice` - Create invoice for job
10. ✅ `get_invoice` - Get invoice details by ID
11. ✅ `list_invoices` - List invoices with filters

#### Notifications (2 tools)
12. ✅ `create_notification` - Create user notification
13. ✅ `list_notifications` - List user notifications

#### Call Logs (1 tool)
14. ✅ `create_call_log` - Log phone call

#### Analytics (3 tools)
15. ✅ `get_dashboard_stats` - Get dashboard statistics
16. ✅ `get_job_analytics` - Get job analytics
17. ✅ `get_revenue_analytics` - Get revenue analytics

#### Review Requests (1 tool)
18. ✅ `send_review_request` - Send review request email

#### Job Photos (1 tool)
19. ✅ `list_job_photos` - List photos for a job

#### Email & Communication (2 tools)
20. ✅ `send_email` - Send email via Resend
21. ✅ `get_user_email` - Get account owner email

---

## Missing MCP Tools by Priority

### Priority 1 - Core Operations (10 tools needed)

#### Already Implemented (3/10)
- ✅ `list_jobs` - "What jobs do I have today?"
- ✅ `create_contact` - "Add a new contact named John Smith"
- ✅ `get_contact` - "Show me John Smith's details"

#### Missing (7/10)
1. ❌ `list_contacts` - "Show me all contacts"
   - **API Mapping**: `GET /api/contacts`
   - **Priority**: HIGH
   - **Complexity**: LOW

2. ❌ `update_contact` - "Update John's phone number"
   - **API Mapping**: `PATCH /api/contacts/[id]`
   - **Priority**: HIGH
   - **Complexity**: LOW

3. ❌ `list_conversations` - "What conversations need attention?"
   - **API Mapping**: `GET /api/conversations`
   - **Priority**: HIGH
   - **Complexity**: LOW

4. ❌ `get_conversation` - "Show me conversation with John"
   - **API Mapping**: `GET /api/conversations/[id]` + `GET /api/conversations/[id]/messages`
   - **Priority**: HIGH
   - **Complexity**: MEDIUM

5. ❌ `generate_draft` - "Generate a reply to this conversation"
   - **API Mapping**: `POST /api/ai/draft`
   - **Priority**: HIGH
   - **Complexity**: MEDIUM

6. ⚠️ `assign_tech_by_name` - "Assign Mike to job 123" (enhance existing assign_tech)
   - **API Mapping**: `PATCH /api/jobs/[id]/assign` (needs name lookup)
   - **Priority**: HIGH
   - **Complexity**: MEDIUM

7. ❌ `bulk_operations` - "Mark all today's jobs as completed"
   - **API Mapping**: `POST /api/jobs/bulk`
   - **Priority**: HIGH
   - **Complexity**: MEDIUM

---

### Priority 2 - Field Operations (6 tools needed)

#### Missing (6/6)
1. ❌ `upload_photo` - "Upload a photo of the completed work"
   - **API Mapping**: `POST /api/jobs/[id]/upload-photo`
   - **Priority**: HIGH
   - **Complexity**: MEDIUM (file upload)

2. ❌ `capture_location` - "I'm at the job site now"
   - **API Mapping**: `POST /api/jobs/[id]/location`
   - **Priority**: HIGH
   - **Complexity**: LOW

3. ❌ `clock_in` - "Clock in"
   - **API Mapping**: `POST /api/time-entries`
   - **Priority**: HIGH
   - **Complexity**: LOW

4. ❌ `clock_out` - "Clock out"
   - **API Mapping**: `PATCH /api/time-entries/[id]`
   - **Priority**: HIGH
   - **Complexity**: LOW

5. ❌ `add_job_note` - "Add a note: customer wants follow-up"
   - **API Mapping**: `POST /api/contacts/[id]/notes` or `POST /api/conversations/[id]/notes`
   - **Priority**: HIGH
   - **Complexity**: LOW

6. ❌ `get_my_jobs` - "What are my jobs today?" (for techs)
   - **API Mapping**: `GET /api/tech/jobs`
   - **Priority**: HIGH
   - **Complexity**: LOW

---

### Priority 3 - Business Intelligence (4 tools needed)

#### Already Implemented (3/4)
- ✅ `get_dashboard_stats` - "What's my revenue this month?"
- ✅ `get_job_analytics` - "Show me job completion rates"
- ✅ `get_revenue_analytics` - Revenue analytics

#### Missing (1/4)
1. ❌ `search_jobs` - "Find jobs scheduled for tomorrow"
   - **API Mapping**: `GET /api/jobs` (with date filter)
   - **Priority**: MEDIUM
   - **Complexity**: LOW

---

### Priority 4 - Advanced Operations (4 tools needed)

#### Already Implemented (1/4)
- ✅ `create_invoice` - "Create an invoice for job 123"

#### Missing (3/4)
1. ❌ `send_invoice` - "Send invoice to customer"
   - **API Mapping**: `POST /api/invoices/[id]/send`
   - **Priority**: MEDIUM
   - **Complexity**: LOW

2. ❌ `create_campaign` - "Create a marketing campaign"
   - **API Mapping**: `POST /api/campaigns`
   - **Priority**: MEDIUM
   - **Complexity**: HIGH (complex business logic)

3. ❌ `export_data` - "Export all contacts to CSV"
   - **API Mapping**: `GET /api/export/contacts`
   - **Priority**: LOW
   - **Complexity**: MEDIUM

---

### Additional Voice Tools Needed (Not in Priority Lists)

#### Core Operations Extensions (17 tools)
1. ❌ `update_job` - Update job details (full update)
   - **API Mapping**: `PATCH /api/jobs/[id]`
   - **Priority**: MEDIUM

2. ❌ `delete_job` - Delete job
   - **API Mapping**: `DELETE /api/jobs/[id]` (needs verification)
   - **Priority**: LOW

3. ❌ `delete_contact` - Delete contact
   - **API Mapping**: `DELETE /api/contacts/[id]` (needs verification)
   - **Priority**: LOW

4. ❌ `update_conversation_status` - Update conversation status
   - **API Mapping**: `PATCH /api/conversations/[id]`
   - **Priority**: MEDIUM

5. ❌ `list_invoices` - List invoices
   - **API Mapping**: `GET /api/invoices` ✅ (exists, needs tool)
   - **Priority**: MEDIUM

6. ❌ `get_invoice` - Get invoice details
   - **API Mapping**: `GET /api/invoices/[id]` ✅ (exists, needs tool)
   - **Priority**: MEDIUM

7. ❌ `mark_invoice_paid` - Mark invoice as paid
   - **API Mapping**: `POST /api/invoices/[id]/mark-paid` ✅ (exists, needs tool)
   - **Priority**: MEDIUM

8. ❌ `list_payments` - List payments
   - **API Mapping**: `GET /api/payments` ✅ (exists, needs tool)
   - **Priority**: MEDIUM

9. ❌ `create_payment` - Create payment
   - **API Mapping**: `POST /api/payments` ✅ (exists, needs tool)
   - **Priority**: MEDIUM

10. ❌ `list_notifications` - List notifications
    - **API Mapping**: `GET /api/notifications` ✅ (exists, needs tool)
    - **Priority**: MEDIUM

11. ❌ `mark_notification_read` - Mark notification as read
    - **API Mapping**: `PATCH /api/notifications/[id]` ✅ (exists, needs tool)
    - **Priority**: MEDIUM

12. ❌ `list_call_logs` - List call logs
    - **API Mapping**: `GET /api/call-logs` ✅ (exists, needs tool)
    - **Priority**: MEDIUM

13. ❌ `create_call_log` - Create call log
    - **API Mapping**: `POST /api/call-logs` ✅ (exists, needs tool)
    - **Priority**: MEDIUM

14. ❌ `get_contact_notes` - Get contact notes
    - **API Mapping**: `GET /api/contacts/[id]/notes`
    - **Priority**: LOW

15. ❌ `add_contact_note` - Add note to contact
    - **API Mapping**: `POST /api/contacts/[id]/notes`
    - **Priority**: LOW

16. ❌ `get_conversation_notes` - Get conversation notes
    - **API Mapping**: `GET /api/conversations/[id]/notes`
    - **Priority**: LOW

17. ❌ `add_conversation_note` - Add note to conversation
    - **API Mapping**: `POST /api/conversations/[id]/notes`
    - **Priority**: LOW

#### Marketing Operations (15 tools)
1. ❌ `list_campaigns` - List campaigns
2. ❌ `get_campaign` - Get campaign details
3. ❌ `update_campaign` - Update campaign
4. ❌ `delete_campaign` - Delete campaign
5. ❌ `send_campaign` - Send campaign
6. ❌ `pause_campaign` - Pause campaign
7. ❌ `resume_campaign` - Resume campaign
8. ❌ `list_campaign_recipients` - List campaign recipients
9. ❌ `add_campaign_recipient` - Add recipient to campaign
10. ❌ `remove_campaign_recipient` - Remove recipient from campaign
11. ❌ `list_email_templates` - List email templates
12. ❌ `get_email_template` - Get email template
13. ❌ `create_email_template` - Create email template
14. ❌ `update_email_template` - Update email template
15. ❌ `preview_email_template` - Preview email template

#### Contact Tags (8 tools)
1. ❌ `list_contact_tags` - List all contact tags
2. ❌ `get_contact_tag` - Get contact tag details
3. ❌ `create_contact_tag` - Create contact tag
4. ❌ `update_contact_tag` - Update contact tag
5. ❌ `delete_contact_tag` - Delete contact tag
6. ❌ `get_contact_tags` - Get tags for a contact
7. ❌ `assign_contact_tag` - Assign tag to contact
8. ❌ `remove_contact_tag` - Remove tag from contact

#### Financial Operations (10 tools)
1. ❌ `update_invoice` - Update invoice
2. ❌ `delete_invoice` - Delete invoice
3. ❌ `get_payment` - Get payment details
4. ❌ `update_payment` - Update payment
5. ❌ `delete_payment` - Delete payment
6. ❌ `get_finance_stats` - Get financial statistics
7. ❌ `list_expenses` - List expenses (if expense API exists)
8. ❌ `create_expense` - Create expense
9. ❌ `get_expense` - Get expense details
10. ❌ `update_expense` - Update expense

#### Analytics & Reporting (5 tools)
1. ❌ `get_contact_analytics` - Get contact analytics
2. ❌ `generate_report` - Generate report
3. ❌ `export_jobs` - Export jobs to CSV/JSON
4. ❌ `export_contacts` - Export contacts to CSV/JSON
5. ❌ `export_invoices` - Export invoices to CSV/JSON

#### Field Operations Extensions (10 tools)
1. ❌ `list_job_materials` - List materials for job
2. ❌ `add_job_material` - Add material to job
3. ❌ `remove_job_material` - Remove material from job
4. ❌ `list_time_entries` - List time entries
5. ❌ `get_time_entry` - Get time entry details
6. ❌ `update_time_entry` - Update time entry
7. ❌ `list_signatures` - List signatures
8. ❌ `get_signature` - Get signature details
9. ❌ `delete_job_photo` - Delete job photo
10. ❌ `get_job_photo` - Get job photo details

#### User & Access Management (8 tools)
1. ❌ `list_users` - List users
2. ❌ `get_user` - Get user details
3. ❌ `create_user` - Create user
4. ❌ `update_user` - Update user
5. ❌ `delete_user` - Delete user
6. ❌ `get_current_user` - Get current user
7. ❌ `list_roles` - List roles
8. ❌ `assign_role` - Assign role to user

#### System Configuration (6 tools)
1. ❌ `get_account_settings` - Get account settings
2. ❌ `update_account_settings` - Update account settings
3. ❌ `list_automation_rules` - List automation rules
4. ❌ `create_automation_rule` - Create automation rule
5. ❌ `update_automation_rule` - Update automation rule
6. ❌ `toggle_automation_rule` - Toggle automation rule active status

#### Integration Operations (10 tools)
1. ❌ `get_gmail_status` - Get Gmail integration status
2. ❌ `authorize_gmail` - Authorize Gmail integration
3. ❌ `sync_gmail` - Sync Gmail
4. ❌ `send_gmail` - Send email via Gmail
5. ❌ `get_microsoft_status` - Get Microsoft integration status
6. ❌ `authorize_microsoft` - Authorize Microsoft integration
7. ❌ `sync_microsoft` - Sync Microsoft
8. ❌ `list_webhooks` - List webhooks
9. ❌ `create_webhook` - Create webhook
10. ❌ `delete_webhook` - Delete webhook

#### Enterprise Features (50+ tools)
- Sales Pipeline: leads, quotes, estimates (15 tools)
- Dispatch & Scheduling: queue, routes, optimization (10 tools)
- Customer Service: tickets, knowledge base (10 tools)
- Inventory & Materials: inventory, suppliers, purchase orders (15 tools)
- Multi-Tenant & Billing: tenants, subscriptions, usage (10 tools)
- Workflow & Approval: workflows, approvals (8 tools)
- Mobile & Real-Time: push notifications, GPS tracking (5 tools)
- Customer Portal: customer auth, jobs, invoices (5 tools)

---

## Implementation Checklist

### Phase 1: Priority Tools (24 tools)
- [ ] Implement Priority 1 missing tools (7 tools)
- [ ] Implement Priority 2 tools (6 tools)
- [ ] Implement Priority 3 missing tools (1 tool)
- [ ] Implement Priority 4 missing tools (3 tools)
- [ ] Enhance existing tools (assign_tech_by_name)

### Phase 2: Core Extensions (40 tools)
- [ ] Core operations extensions (17 tools)
- [ ] Marketing operations (15 tools)
- [ ] Contact tags (8 tools)

### Phase 3: Financial & Analytics (15 tools)
- [ ] Financial operations (10 tools)
- [ ] Analytics & reporting (5 tools)

### Phase 4: Field Operations Extensions (10 tools)
- [ ] Job materials, time entries, signatures, photos

### Phase 5: Management & Configuration (14 tools)
- [ ] User & access management (8 tools)
- [ ] System configuration (6 tools)

### Phase 6: Integration Operations (10 tools)
- [ ] Gmail, Microsoft, webhooks

### Phase 7: Enterprise Features (50+ tools)
- [ ] Sales pipeline
- [ ] Dispatch & scheduling
- [ ] Customer service
- [ ] Inventory & materials
- [ ] Multi-tenant & billing
- [ ] Workflow & approval
- [ ] Mobile & real-time
- [ ] Customer portal

---

## Tool Schema Pattern

All MCP tools follow this pattern:

```typescript
{
  name: 'tool_name', // snake_case, descriptive
  description: 'Clear description. Use this when the user says "[example voice command]"',
  inputSchema: {
    type: 'object',
    properties: {
      requiredParam: {
        type: 'string',
        description: 'Clear description of parameter',
      },
      optionalParam: {
        type: 'string',
        description: 'Clear description (optional)',
      },
    },
    required: ['requiredParam'], // Only truly required params
  },
}
```

## Tool Handler Pattern

All tool handlers follow this pattern:

```typescript
case 'tool_name': {
  const { requiredParam, optionalParam } = args as {
    requiredParam: string
    optionalParam?: string
  }

  // Validation
  if (!requiredParam) {
    return { error: 'Missing required parameter: requiredParam' }
  }

  // Get Supabase client and account ID
  const supabase = getSupabaseClient()
  const accountId = getAccountId()

  // Query/Operation (ALWAYS filter by account_id)
  const { data, error } = await supabase
    .from('table_name')
    .select('*, relation:related_table(*)')
    .eq('account_id', accountId)
    // ... additional filters

  // Error handling
  if (error) {
    console.error('Error in tool_name:', error)
    return { error: `Failed to [operation]: ${error.message}` }
  }

  // Return consistent format
  return {
    success: true,
    [resource]: data,
    count: data?.length || 0,
    message: 'Success message for voice response',
  }
}
```

---

## Implementation Standards

All MCP tools must follow the standards defined in:
- `shared-docs/AGENT_ORCHESTRATION_STANDARDS.md`

Key requirements:
- ✅ Tool names in snake_case
- ✅ Descriptive descriptions with voice command examples
- ✅ Proper input schema validation
- ✅ Account isolation (always filter by account_id)
- ✅ Error handling
- ✅ Consistent response format
- ✅ Voice-friendly messages

---

## Progress Tracking

See `shared-docs/SWARM_COORDINATION.md` for overall progress tracking.

See individual wave progress files:
- `shared-docs/WAVE6_PROGRESS.md` - Core MCP tools progress
- `shared-docs/WAVE7_PROGRESS.md` - Enterprise MCP tools progress

---

**Last Updated**: 09:46:59 Nov 23, 2025  
**Next Review**: After Wave 6 completion

---

09:46:59 Nov 23, 2025

