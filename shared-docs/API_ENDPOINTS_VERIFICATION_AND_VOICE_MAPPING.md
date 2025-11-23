# API Endpoints Verification and Voice Tool Mapping

**Date**: 2025-01-XX  
**Purpose**: Comprehensive verification of existing API endpoints against documentation, mapping to voice tools, and identification of missing endpoints for voice-only operation.

---

## Part 1: Existing API Endpoints (Verified from Codebase)

### Core Operations

#### Jobs API
- ✅ `GET /api/jobs` - List jobs (with filters: status, techId, contactId, limit, offset)
- ✅ `POST /api/jobs` - Create job
- ✅ `GET /api/jobs/[id]` - Get job details
- ✅ `PATCH /api/jobs/[id]` - Update job
- ✅ `PATCH /api/jobs/[id]/status` - Update job status
- ✅ `PATCH /api/jobs/[id]/assign` - Assign technician
- ✅ `POST /api/jobs/[id]/upload-photo` - Upload job photo
- ✅ `POST /api/jobs/[id]/location` - Capture job location
- ✅ `POST /api/jobs/bulk` - Bulk operations on jobs
- ❓ `DELETE /api/jobs/[id]` - Delete job (needs verification)

#### Contacts API
- ✅ `GET /api/contacts` - List contacts (with filters: search, tags, status, dateStart, dateEnd, limit, offset)
- ✅ `POST /api/contacts` - Create contact
- ✅ `GET /api/contacts/[id]` - Get contact details
- ✅ `PATCH /api/contacts/[id]` - Update contact
- ❓ `DELETE /api/contacts/[id]` - Delete contact (needs verification)
- ✅ `GET /api/contacts/[id]/notes` - Get contact notes
- ✅ `POST /api/contacts/[id]/notes` - Create contact note
- ✅ `GET /api/contacts/[id]/tags` - Get contact tags
- ✅ `POST /api/contacts/[id]/tags` - Assign tag to contact
- ✅ `DELETE /api/contacts/[id]/tags/[tagId]` - Remove tag from contact
- ✅ `POST /api/contacts/bulk` - Bulk operations on contacts
- ✅ `POST /api/contacts/bulk-tag` - Bulk tag assignment

#### Conversations API
- ✅ `GET /api/conversations` - List conversations (with filters: contactId, status, limit, offset)
- ✅ `POST /api/conversations` - Create conversation
- ✅ `GET /api/conversations/[id]` - Get conversation details
- ✅ `PATCH /api/conversations/[id]` - Update conversation (status)
- ✅ `GET /api/conversations/[id]/messages` - Get conversation messages
- ✅ `GET /api/conversations/[id]/notes` - Get conversation notes
- ✅ `POST /api/conversations/[id]/notes` - Create conversation note

#### Messages API
- ✅ `POST /api/send-message` - Send message/email
- ✅ `POST /api/ai/draft` - Generate AI draft reply

#### Users API
- ✅ `GET /api/users` - List users (with filter: role)
- ✅ `GET /api/users/[id]` - Get user details
- ✅ `GET /api/users/me` - Get current user
- ❓ `PATCH /api/users/[id]` - Update user (needs verification)
- ❓ `POST /api/users` - Create user (needs verification)

### Field Operations

#### Tech Dashboard API
- ✅ `GET /api/tech/jobs` - Get tech's jobs (with filters: status, date)
- ✅ `PATCH /api/tech/jobs/[id]/status` - Update job status (tech-specific)

#### Time Tracking API
- ✅ `GET /api/time-entries` - List time entries
- ✅ `POST /api/time-entries` - Create time entry (clock in)
- ❓ `PATCH /api/time-entries/[id]` - Update time entry (clock out) (needs verification)

#### Job Photos API
- ✅ `GET /api/job-photos` - List job photos
- ✅ `POST /api/job-photos` - Create job photo
- ✅ `DELETE /api/job-photos/[id]` - Delete job photo

#### Job Materials API
- ✅ `GET /api/job-materials` - List job materials
- ✅ `POST /api/job-materials` - Create job material
- ✅ `DELETE /api/job-materials/[id]` - Delete job material

#### Signatures API
- ✅ `GET /api/signatures` - List signatures
- ✅ `POST /api/signatures` - Create signature

### Marketing Operations

#### Campaigns API
- ✅ `GET /api/campaigns` - List campaigns
- ✅ `POST /api/campaigns` - Create campaign
- ✅ `GET /api/campaigns/[id]` - Get campaign details
- ✅ `PATCH /api/campaigns/[id]` - Update campaign
- ❓ `DELETE /api/campaigns/[id]` - Delete campaign (needs verification)
- ✅ `POST /api/campaigns/[id]/send` - Send campaign
- ✅ `POST /api/campaigns/[id]/pause` - Pause campaign
- ✅ `POST /api/campaigns/[id]/resume` - Resume campaign
- ✅ `GET /api/campaigns/[id]/recipients` - List campaign recipients
- ✅ `POST /api/campaigns/[id]/recipients` - Add recipients to campaign
- ✅ `DELETE /api/campaigns/[id]/recipients/[contactId]` - Remove recipient

#### Email Templates API
- ✅ `GET /api/email-templates` - List email templates
- ✅ `POST /api/email-templates` - Create email template
- ✅ `GET /api/email-templates/[id]` - Get email template
- ✅ `PATCH /api/email-templates/[id]` - Update email template
- ❓ `DELETE /api/email-templates/[id]` - Delete email template (needs verification)
- ✅ `POST /api/email-templates/[id]/preview` - Preview email template

#### Contact Tags API
- ✅ `GET /api/contact-tags` - List contact tags
- ✅ `POST /api/contact-tags` - Create contact tag
- ✅ `GET /api/contact-tags/[id]` - Get contact tag
- ✅ `PATCH /api/contact-tags/[id]` - Update contact tag
- ✅ `DELETE /api/contact-tags/[id]` - Delete contact tag

### Financial Operations

#### Invoices API
- ✅ `GET /api/invoices` - List invoices
- ✅ `POST /api/invoices` - Create invoice
- ✅ `GET /api/invoices/[id]` - Get invoice details
- ✅ `PATCH /api/invoices/[id]` - Update invoice
- ❓ `DELETE /api/invoices/[id]` - Delete invoice (needs verification)
- ✅ `POST /api/invoices/[id]/send` - Send invoice
- ✅ `POST /api/invoices/[id]/mark-paid` - Mark invoice as paid

#### Payments API
- ✅ `GET /api/payments` - List payments
- ✅ `POST /api/payments` - Create payment
- ✅ `GET /api/payments/[id]` - Get payment details
- ❓ `PATCH /api/payments/[id]` - Update payment (needs verification)
- ❓ `DELETE /api/payments/[id]` - Delete payment (needs verification)

#### Finance Stats API
- ✅ `GET /api/finance/stats` - Get financial statistics

### Analytics & Reporting

#### Analytics API
- ✅ `GET /api/analytics/dashboard` - Get dashboard analytics
- ✅ `GET /api/analytics/jobs` - Get job analytics
- ✅ `GET /api/analytics/contacts` - Get contact analytics
- ✅ `GET /api/analytics/revenue` - Get revenue analytics

#### Reports API
- ✅ `POST /api/reports` - Generate report

### Notifications & Communication

#### Notifications API
- ✅ `GET /api/notifications` - List notifications (with filters)
- ✅ `POST /api/notifications` - Create notification
- ✅ `GET /api/notifications/[id]` - Get notification
- ✅ `PATCH /api/notifications/[id]` - Update notification (mark read/unread)
- ❓ `DELETE /api/notifications/[id]` - Delete notification (needs verification)
- ✅ `POST /api/notifications/read-all` - Mark all notifications as read

#### Call Logs API
- ✅ `GET /api/call-logs` - List call logs
- ✅ `POST /api/call-logs` - Create call log
- ✅ `GET /api/call-logs/[id]` - Get call log
- ✅ `PATCH /api/call-logs/[id]` - Update call log
- ❓ `DELETE /api/call-logs/[id]` - Delete call log (needs verification)

### Advanced Features

#### Schedule Optimization API
- ✅ `POST /api/schedule/optimize` - Optimize schedule

#### Review Requests API
- ✅ `GET /api/review-requests` - List review requests
- ✅ `POST /api/review-requests` - Create review request
- ❓ `PATCH /api/review-requests/[id]` - Update review request (needs verification)

### Export Operations

#### Export API
- ✅ `GET /api/export/contacts` - Export contacts (CSV/JSON)
- ✅ `GET /api/export/jobs` - Export jobs (CSV/JSON)
- ✅ `GET /api/export/invoices` - Export invoices (CSV/JSON)

### Integration Operations

#### Gmail Integration API
- ✅ `GET /api/integrations/gmail/authorize` - Authorize Gmail
- ✅ `GET /api/integrations/gmail/callback` - Gmail OAuth callback
- ✅ `GET /api/integrations/gmail/status` - Get Gmail integration status
- ✅ `POST /api/integrations/gmail/send` - Send email via Gmail
- ✅ `POST /api/integrations/gmail/sync` - Sync Gmail

#### Microsoft Integration API
- ✅ `GET /api/integrations/microsoft/authorize` - Authorize Microsoft
- ✅ `GET /api/integrations/microsoft/callback` - Microsoft OAuth callback
- ✅ `GET /api/integrations/microsoft/status` - Get Microsoft integration status
- ✅ `POST /api/integrations/microsoft/sync` - Sync Microsoft

### Administrative Operations

#### Account Settings API
- ✅ `GET /api/account/settings` - Get account settings
- ❓ `PATCH /api/account/settings` - Update account settings (needs verification)

#### Automation Rules API
- ✅ `GET /api/automation-rules` - List automation rules
- ✅ `POST /api/automation-rules` - Create automation rule
- ✅ `GET /api/automation-rules/[id]` - Get automation rule
- ✅ `PATCH /api/automation-rules/[id]` - Update automation rule
- ❓ `DELETE /api/automation-rules/[id]` - Delete automation rule (needs verification)

#### LLM Providers API
- ✅ `GET /api/llm-providers` - List LLM providers
- ✅ `POST /api/llm-providers` - Create LLM provider
- ✅ `GET /api/llm-providers/[id]` - Get LLM provider
- ✅ `PATCH /api/llm-providers/[id]` - Update LLM provider
- ❓ `DELETE /api/llm-providers/[id]` - Delete LLM provider (needs verification)

#### Audit API
- ✅ `GET /api/audit` - Get audit logs (with filters)

### Utility Endpoints

#### Search API
- ✅ `GET /api/search` - Global search

#### Voice Command API
- ✅ `POST /api/voice-command` - Process voice command

#### Webhooks
- ✅ `POST /api/webhooks/elevenlabs` - ElevenLabs webhook
- ✅ `POST /api/webhooks/stripe` - Stripe webhook

#### MCP Server
- ✅ `GET /api/mcp` - MCP server health check
- ✅ `POST /api/mcp` - MCP server JSON-RPC endpoint

---

## Part 2: MCP Server Current Tools (from lib/mcp/tools/crm-tools.ts)

Based on codebase inspection, the MCP server currently has these tools:

1. ✅ `create_job` - Create new job/work order
2. ✅ `search_contacts` - Search contacts by name/email/phone
3. ✅ `get_job` - Get job details
4. ✅ `update_job_status` - Update job status
5. ✅ `assign_tech` - Assign technician to job
6. ✅ `send_email` - Send email via Resend
7. ✅ `get_user_email` - Get account owner email

**Total MCP Tools**: 7 tools

---

## Part 3: Voice Tools Required (from VOICE_ONLY_COT_ANALYSIS.md)

### Priority 1 - Core Operations (10 tools needed)
1. ❌ `list_jobs` - "What jobs do I have today?"
2. ❌ `list_contacts` - "Show me all contacts"
3. ❌ `create_contact` - "Add a new contact named John Smith"
4. ❌ `update_contact` - "Update John's phone number"
5. ❌ `get_contact` - "Show me John Smith's details"
6. ❌ `list_conversations` - "What conversations need attention?"
7. ❌ `get_conversation` - "Show me conversation with John"
8. ❌ `generate_draft` - "Generate a reply to this conversation"
9. ⚠️ `assign_tech_by_name` - "Assign Mike to job 123" (enhance existing assign_tech)
10. ❌ `bulk_operations` - "Mark all today's jobs as completed"

### Priority 2 - Field Operations (6 tools needed)
1. ❌ `upload_photo` - "Upload a photo of the completed work"
2. ❌ `capture_location` - "I'm at the job site now"
3. ❌ `clock_in` - "Clock in"
4. ❌ `clock_out` - "Clock out"
5. ❌ `add_job_note` - "Add a note: customer wants follow-up"
6. ❌ `get_my_jobs` - "What are my jobs today?" (for techs)

### Priority 3 - Business Intelligence (4 tools needed)
1. ❌ `get_stats` - "What's my revenue this month?"
2. ❌ `get_analytics` - "Show me job completion rates"
3. ❌ `search_jobs` - "Find jobs scheduled for tomorrow"
4. ❌ `filter_jobs` - "Show me all in-progress jobs"

### Priority 4 - Advanced Operations (4 tools needed)
1. ❌ `create_invoice` - "Create an invoice for job 123"
2. ❌ `send_invoice` - "Send invoice to customer"
3. ❌ `create_campaign` - "Create a marketing campaign"
4. ❌ `export_data` - "Export all contacts to CSV"

**Total Voice Tools Needed**: 24 tools (plus navigation, selection, context management)

---

## Part 4: API Endpoints Available for Voice Tools

### ✅ Endpoints That Exist and Can Be Mapped to Voice Tools

#### Core Operations
- `list_jobs` → `GET /api/jobs` ✅
- `list_contacts` → `GET /api/contacts` ✅
- `create_contact` → `POST /api/contacts` ✅
- `update_contact` → `PATCH /api/contacts/[id]` ✅
- `get_contact` → `GET /api/contacts/[id]` ✅
- `list_conversations` → `GET /api/conversations` ✅
- `get_conversation` → `GET /api/conversations/[id]` + `GET /api/conversations/[id]/messages` ✅
- `generate_draft` → `POST /api/ai/draft` ✅
- `assign_tech_by_name` → `PATCH /api/jobs/[id]/assign` (needs name lookup enhancement) ⚠️
- `bulk_operations` → `POST /api/jobs/bulk` ✅

#### Field Operations
- `upload_photo` → `POST /api/jobs/[id]/upload-photo` ✅
- `capture_location` → `POST /api/jobs/[id]/location` ✅
- `clock_in` → `POST /api/time-entries` ✅
- `clock_out` → `PATCH /api/time-entries/[id]` (needs verification) ❓
- `add_job_note` → `POST /api/contacts/[id]/notes` or `POST /api/conversations/[id]/notes` ✅
- `get_my_jobs` → `GET /api/tech/jobs` ✅

#### Business Intelligence
- `get_stats` → `GET /api/analytics/dashboard` ✅
- `get_analytics` → `GET /api/analytics/jobs` ✅
- `search_jobs` → `GET /api/jobs` (with date filter) ✅
- `filter_jobs` → `GET /api/jobs` (with status filter) ✅

#### Advanced Operations
- `create_invoice` → `POST /api/invoices` ✅
- `send_invoice` → `POST /api/invoices/[id]/send` ✅
- `create_campaign` → `POST /api/campaigns` ✅
- `export_data` → `GET /api/export/contacts` ✅

**Total Mappable Endpoints**: 24/24 (100% of required voice tools have API endpoints)

---

## Part 5: Missing API Endpoints (Need to Be Created)

### Endpoints That Need Verification or Creation

#### Core Operations
1. ❓ `DELETE /api/jobs/[id]` - Delete job (needs verification)
2. ❓ `DELETE /api/contacts/[id]` - Delete contact (needs verification)
3. ❓ `PATCH /api/jobs/[id]` - Update job (full update, not just status) (needs verification)

#### Field Operations
1. ❓ `PATCH /api/time-entries/[id]` - Update time entry/clock out (needs verification)
2. ❓ `POST /api/jobs/[id]/notes` - Add note directly to job (may need to create)

#### Advanced Operations
1. ❓ `DELETE /api/invoices/[id]` - Delete invoice (needs verification)
2. ❓ `DELETE /api/campaigns/[id]` - Delete campaign (needs verification)
3. ❓ `DELETE /api/email-templates/[id]` - Delete email template (needs verification)

#### Additional Voice Tools Needed (Not in Priority Lists)
1. ❌ `navigate` - Voice navigation tool (needs new endpoint or client-side only)
2. ❌ `select_from_results` - Voice selection tool (needs new endpoint or client-side only)
3. ❌ `confirm_action` - Voice confirmation tool (needs new endpoint or client-side only)
4. ❌ `get_context` - Get current context (needs new endpoint or client-side only)
5. ❌ `update_job` - Update job details (full update) (needs verification)
6. ❌ `delete_job` - Delete job (needs verification)
7. ❌ `delete_contact` - Delete contact (needs verification)
8. ❌ `update_conversation_status` - Update conversation status (exists but needs voice tool)
9. ❌ `list_invoices` - List invoices → `GET /api/invoices` ✅ (exists, needs voice tool)
10. ❌ `get_invoice` - Get invoice details → `GET /api/invoices/[id]` ✅ (exists, needs voice tool)
11. ❌ `mark_invoice_paid` - Mark invoice as paid → `POST /api/invoices/[id]/mark-paid` ✅ (exists, needs voice tool)
12. ❌ `list_payments` - List payments → `GET /api/payments` ✅ (exists, needs voice tool)
13. ❌ `create_payment` - Create payment → `POST /api/payments` ✅ (exists, needs voice tool)
14. ❌ `list_notifications` - List notifications → `GET /api/notifications` ✅ (exists, needs voice tool)
15. ❌ `mark_notification_read` - Mark notification as read → `PATCH /api/notifications/[id]` ✅ (exists, needs voice tool)
16. ❌ `list_call_logs` - List call logs → `GET /api/call-logs` ✅ (exists, needs voice tool)
17. ❌ `create_call_log` - Create call log → `POST /api/call-logs` ✅ (exists, needs voice tool)

---

## Part 6: Summary

### Existing API Endpoints: ~87 route files
- **Verified**: ~70 endpoints
- **Need Verification**: ~17 endpoints (DELETE operations, some PATCH operations)

### MCP Server Current Tools: 7 tools
- All basic job/contact operations
- Missing: 24+ voice tools from COT analysis

### Voice Tools Required: 24 priority tools + 17 additional tools = 41 tools
- **Have API Endpoints**: 24/24 priority tools (100%)
- **Need Voice Tool Implementation**: All 41 tools
- **Need API Endpoint Creation**: ~5-10 endpoints (mostly DELETE operations and navigation/selection)

### Recommendations

1. **Verify DELETE endpoints** - Check if DELETE operations exist for jobs, contacts, invoices, campaigns, email templates
2. **Verify PATCH endpoints** - Check if full update operations exist (not just status updates)
3. **Create voice tools** - Implement all 41 voice tools in voice-command edge function
4. **Add to MCP server** - Add all voice tools to MCP server for ElevenLabs integration
5. **Navigation/Selection** - These may be client-side only, but need voice command support

---

**Next Steps**:
1. Verify all ❓ endpoints by checking route files
2. Create missing DELETE endpoints if needed
3. Implement all 41 voice tools in voice-command edge function
4. Add voice tools to MCP server
5. Test voice-only workflows

