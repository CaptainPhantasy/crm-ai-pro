# API Implementation Master Plan

**Date**: 09:46:59 Nov 23, 2025  
**Status**: Wave 0 - Foundation Complete  
**Purpose**: Complete inventory of all API endpoints, implementation status, and roadmap for enterprise voice-only CRM operation.

---

## Executive Summary

This document provides a comprehensive inventory of all REST API endpoints needed for enterprise voice-only CRM operation. The plan covers:

- **Existing APIs**: ~87 verified endpoints
- **Missing APIs**: ~185 endpoints (from enterprise requirements)
- **Total Target**: ~272 REST API endpoints

---

## API Inventory by Category

### Core Operations (Jobs, Contacts, Conversations)

#### Jobs API - Status: ✅ Mostly Complete
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

**File Locations:**
- `app/api/jobs/route.ts`
- `app/api/jobs/[id]/route.ts`
- `app/api/jobs/[id]/status/route.ts`
- `app/api/jobs/[id]/assign/route.ts`
- `app/api/jobs/[id]/upload-photo/route.ts`
- `app/api/jobs/[id]/location/route.ts`
- `app/api/jobs/bulk/route.ts`

#### Contacts API - Status: ✅ Mostly Complete
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

**File Locations:**
- `app/api/contacts/route.ts`
- `app/api/contacts/[id]/route.ts`
- `app/api/contacts/[id]/notes/route.ts`
- `app/api/contacts/[id]/tags/route.ts`
- `app/api/contacts/[id]/tags/[tagId]/route.ts`
- `app/api/contacts/bulk/route.ts`
- `app/api/contacts/bulk-tag/route.ts`

#### Conversations API - Status: ✅ Complete
- ✅ `GET /api/conversations` - List conversations (with filters: contactId, status, limit, offset)
- ✅ `POST /api/conversations` - Create conversation
- ✅ `GET /api/conversations/[id]` - Get conversation details
- ✅ `PATCH /api/conversations/[id]` - Update conversation (status)
- ✅ `GET /api/conversations/[id]/messages` - Get conversation messages
- ✅ `GET /api/conversations/[id]/notes` - Get conversation notes
- ✅ `POST /api/conversations/[id]/notes` - Create conversation note

**File Locations:**
- `app/api/conversations/route.ts`
- `app/api/conversations/[id]/route.ts`
- `app/api/conversations/[id]/messages/route.ts`
- `app/api/conversations/[id]/notes/route.ts`

#### Messages API - Status: ✅ Complete
- ✅ `POST /api/send-message` - Send message/email
- ✅ `POST /api/ai/draft` - Generate AI draft reply

**File Locations:**
- `app/api/send-message/route.ts`
- `app/api/ai/draft/route.ts`

---

### Field Operations

#### Tech Dashboard API - Status: ✅ Complete
- ✅ `GET /api/tech/jobs` - Get tech's jobs (with filters: status, date)
- ✅ `PATCH /api/tech/jobs/[id]/status` - Update job status (tech-specific)

**File Locations:**
- `app/api/tech/jobs/route.ts`
- `app/api/tech/jobs/[id]/status/route.ts`

#### Time Tracking API - Status: ⚠️ Partial
- ✅ `GET /api/time-entries` - List time entries
- ✅ `POST /api/time-entries` - Create time entry (clock in)
- ❓ `PATCH /api/time-entries/[id]` - Update time entry (clock out) (needs verification)

**File Locations:**
- `app/api/time-entries/route.ts`

#### Job Photos API - Status: ✅ Complete
- ✅ `GET /api/job-photos` - List job photos
- ✅ `POST /api/job-photos` - Create job photo
- ✅ `DELETE /api/job-photos/[id]` - Delete job photo

**File Locations:**
- `app/api/job-photos/route.ts`
- `app/api/job-photos/[id]/route.ts`

#### Job Materials API - Status: ✅ Complete
- ✅ `GET /api/job-materials` - List job materials
- ✅ `POST /api/job-materials` - Create job material
- ✅ `DELETE /api/job-materials/[id]` - Delete job material

**File Locations:**
- `app/api/job-materials/route.ts`
- `app/api/job-materials/[id]/route.ts`

#### Signatures API - Status: ✅ Complete
- ✅ `GET /api/signatures` - List signatures
- ✅ `POST /api/signatures` - Create signature

**File Locations:**
- `app/api/signatures/route.ts`

---

### Marketing Operations

#### Campaigns API - Status: ✅ Mostly Complete
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

**File Locations:**
- `app/api/campaigns/route.ts`
- `app/api/campaigns/[id]/route.ts`
- `app/api/campaigns/[id]/send/route.ts`
- `app/api/campaigns/[id]/pause/route.ts`
- `app/api/campaigns/[id]/resume/route.ts`
- `app/api/campaigns/[id]/recipients/route.ts`
- `app/api/campaigns/[id]/recipients/[contactId]/route.ts`

#### Email Templates API - Status: ✅ Mostly Complete
- ✅ `GET /api/email-templates` - List email templates
- ✅ `POST /api/email-templates` - Create email template
- ✅ `GET /api/email-templates/[id]` - Get email template
- ✅ `PATCH /api/email-templates/[id]` - Update email template
- ❓ `DELETE /api/email-templates/[id]` - Delete email template (needs verification)
- ✅ `POST /api/email-templates/[id]/preview` - Preview email template

**File Locations:**
- `app/api/email-templates/route.ts`
- `app/api/email-templates/[id]/route.ts`
- `app/api/email-templates/[id]/preview/route.ts`

#### Contact Tags API - Status: ✅ Complete
- ✅ `GET /api/contact-tags` - List contact tags
- ✅ `POST /api/contact-tags` - Create contact tag
- ✅ `GET /api/contact-tags/[id]` - Get contact tag
- ✅ `PATCH /api/contact-tags/[id]` - Update contact tag
- ✅ `DELETE /api/contact-tags/[id]` - Delete contact tag

**File Locations:**
- `app/api/contact-tags/route.ts`
- `app/api/contact-tags/[id]/route.ts`

---

### Financial Operations

#### Invoices API - Status: ✅ Mostly Complete
- ✅ `GET /api/invoices` - List invoices
- ✅ `POST /api/invoices` - Create invoice
- ✅ `GET /api/invoices/[id]` - Get invoice details
- ✅ `PATCH /api/invoices/[id]` - Update invoice
- ❓ `DELETE /api/invoices/[id]` - Delete invoice (needs verification)
- ✅ `POST /api/invoices/[id]/send` - Send invoice
- ✅ `POST /api/invoices/[id]/mark-paid` - Mark invoice as paid

**File Locations:**
- `app/api/invoices/route.ts`
- `app/api/invoices/[id]/route.ts`
- `app/api/invoices/[id]/send/route.ts`
- `app/api/invoices/[id]/mark-paid/route.ts`

#### Payments API - Status: ⚠️ Partial
- ✅ `GET /api/payments` - List payments
- ✅ `POST /api/payments` - Create payment
- ✅ `GET /api/payments/[id]` - Get payment details
- ❓ `PATCH /api/payments/[id]` - Update payment (needs verification)
- ❓ `DELETE /api/payments/[id]` - Delete payment (needs verification)

**File Locations:**
- `app/api/payments/route.ts`
- `app/api/payments/[id]/route.ts`

#### Finance Stats API - Status: ✅ Complete
- ✅ `GET /api/finance/stats` - Get financial statistics

**File Locations:**
- `app/api/finance/stats/route.ts`

---

### Analytics & Reporting

#### Analytics API - Status: ✅ Complete
- ✅ `GET /api/analytics/dashboard` - Get dashboard analytics
- ✅ `GET /api/analytics/jobs` - Get job analytics
- ✅ `GET /api/analytics/contacts` - Get contact analytics
- ✅ `GET /api/analytics/revenue` - Get revenue analytics

**File Locations:**
- `app/api/analytics/dashboard/route.ts`
- `app/api/analytics/jobs/route.ts`
- `app/api/analytics/contacts/route.ts`
- `app/api/analytics/revenue/route.ts`

#### Reports API - Status: ✅ Complete
- ✅ `POST /api/reports` - Generate report

**File Locations:**
- `app/api/reports/route.ts`

---

### Notifications & Communication

#### Notifications API - Status: ✅ Mostly Complete
- ✅ `GET /api/notifications` - List notifications (with filters)
- ✅ `POST /api/notifications` - Create notification
- ✅ `GET /api/notifications/[id]` - Get notification
- ✅ `PATCH /api/notifications/[id]` - Update notification (mark read/unread)
- ❓ `DELETE /api/notifications/[id]` - Delete notification (needs verification)
- ✅ `POST /api/notifications/read-all` - Mark all notifications as read

**File Locations:**
- `app/api/notifications/route.ts`
- `app/api/notifications/[id]/route.ts`
- `app/api/notifications/read-all/route.ts`

#### Call Logs API - Status: ✅ Mostly Complete
- ✅ `GET /api/call-logs` - List call logs
- ✅ `POST /api/call-logs` - Create call log
- ✅ `GET /api/call-logs/[id]` - Get call log
- ✅ `PATCH /api/call-logs/[id]` - Update call log
- ❓ `DELETE /api/call-logs/[id]` - Delete call log (needs verification)

**File Locations:**
- `app/api/call-logs/route.ts`
- `app/api/call-logs/[id]/route.ts`

---

### Advanced Features

#### Schedule Optimization API - Status: ✅ Complete
- ✅ `POST /api/schedule/optimize` - Optimize schedule

**File Locations:**
- `app/api/schedule/optimize/route.ts`

#### Review Requests API - Status: ✅ Mostly Complete
- ✅ `GET /api/review-requests` - List review requests
- ✅ `POST /api/review-requests` - Create review request
- ❓ `PATCH /api/review-requests/[id]` - Update review request (needs verification)

**File Locations:**
- `app/api/review-requests/route.ts`

---

### Export Operations

#### Export API - Status: ✅ Complete
- ✅ `GET /api/export/contacts` - Export contacts (CSV/JSON)
- ✅ `GET /api/export/jobs` - Export jobs (CSV/JSON)
- ✅ `GET /api/export/invoices` - Export invoices (CSV/JSON)

**File Locations:**
- `app/api/export/contacts/route.ts`
- `app/api/export/jobs/route.ts`
- `app/api/export/invoices/route.ts`

---

### Integration Operations

#### Gmail Integration API - Status: ✅ Complete
- ✅ `GET /api/integrations/gmail/authorize` - Authorize Gmail
- ✅ `GET /api/integrations/gmail/callback` - Gmail OAuth callback
- ✅ `GET /api/integrations/gmail/status` - Get Gmail integration status
- ✅ `POST /api/integrations/gmail/send` - Send email via Gmail
- ✅ `POST /api/integrations/gmail/sync` - Sync Gmail

**File Locations:**
- `app/api/integrations/gmail/authorize/route.ts`
- `app/api/integrations/gmail/callback/route.ts`
- `app/api/integrations/gmail/status/route.ts`
- `app/api/integrations/gmail/send/route.ts`
- `app/api/integrations/gmail/sync/route.ts`

#### Microsoft Integration API - Status: ✅ Complete
- ✅ `GET /api/integrations/microsoft/authorize` - Authorize Microsoft
- ✅ `GET /api/integrations/microsoft/callback` - Microsoft OAuth callback
- ✅ `GET /api/integrations/microsoft/status` - Get Microsoft integration status
- ✅ `POST /api/integrations/microsoft/sync` - Sync Microsoft

**File Locations:**
- `app/api/integrations/microsoft/authorize/route.ts`
- `app/api/integrations/microsoft/callback/route.ts`
- `app/api/integrations/microsoft/status/route.ts`
- `app/api/integrations/microsoft/sync/route.ts`

---

### Administrative Operations

#### Users API - Status: ⚠️ Partial
- ✅ `GET /api/users` - List users (with filter: role)
- ✅ `GET /api/users/[id]` - Get user details
- ✅ `GET /api/users/me` - Get current user
- ❓ `PATCH /api/users/[id]` - Update user (needs verification)
- ❓ `POST /api/users` - Create user (needs verification)

**File Locations:**
- `app/api/users/route.ts`
- `app/api/users/[id]/route.ts`
- `app/api/users/me/route.ts`

#### Account Settings API - Status: ⚠️ Partial
- ✅ `GET /api/account/settings` - Get account settings
- ❓ `PATCH /api/account/settings` - Update account settings (needs verification)

**File Locations:**
- `app/api/account/settings/route.ts`

#### Automation Rules API - Status: ✅ Mostly Complete
- ✅ `GET /api/automation-rules` - List automation rules
- ✅ `POST /api/automation-rules` - Create automation rule
- ✅ `GET /api/automation-rules/[id]` - Get automation rule
- ✅ `PATCH /api/automation-rules/[id]` - Update automation rule
- ❓ `DELETE /api/automation-rules/[id]` - Delete automation rule (needs verification)

**File Locations:**
- `app/api/automation-rules/route.ts`
- `app/api/automation-rules/[id]/route.ts`

#### LLM Providers API - Status: ✅ Mostly Complete
- ✅ `GET /api/llm-providers` - List LLM providers
- ✅ `POST /api/llm-providers` - Create LLM provider
- ✅ `GET /api/llm-providers/[id]` - Get LLM provider
- ✅ `PATCH /api/llm-providers/[id]` - Update LLM provider
- ❓ `DELETE /api/llm-providers/[id]` - Delete LLM provider (needs verification)

**File Locations:**
- `app/api/llm-providers/route.ts`
- `app/api/llm-providers/[id]/route.ts`

#### Audit API - Status: ✅ Complete
- ✅ `GET /api/audit` - Get audit logs (with filters)

**File Locations:**
- `app/api/audit/route.ts`

---

### Utility Endpoints

#### Search API - Status: ✅ Complete
- ✅ `GET /api/search` - Global search

**File Locations:**
- `app/api/search/route.ts`

#### Voice Command API - Status: ✅ Complete
- ✅ `POST /api/voice-command` - Process voice command

**File Locations:**
- `app/api/voice-command/route.ts`

#### Webhooks - Status: ✅ Complete
- ✅ `POST /api/webhooks/elevenlabs` - ElevenLabs webhook
- ✅ `POST /api/webhooks/stripe` - Stripe webhook

**File Locations:**
- `app/api/webhooks/elevenlabs/route.ts`
- `app/api/webhooks/stripe/route.ts`

#### MCP Server - Status: ✅ Complete
- ✅ `GET /api/mcp` - MCP server health check
- ✅ `POST /api/mcp` - MCP server JSON-RPC endpoint

**File Locations:**
- `app/api/mcp/route.ts`

---

## Missing APIs (Enterprise Requirements)

### Sales Pipeline APIs (Missing)
- ❌ `GET /api/leads` - List leads
- ❌ `POST /api/leads` - Create lead
- ❌ `GET /api/leads/[id]` - Get lead details
- ❌ `PATCH /api/leads/[id]` - Update lead
- ❌ `DELETE /api/leads/[id]` - Delete lead
- ❌ `POST /api/leads/[id]/convert` - Convert lead to contact/job
- ❌ `GET /api/quotes` - List quotes
- ❌ `POST /api/quotes` - Create quote
- ❌ `GET /api/quotes/[id]` - Get quote details
- ❌ `PATCH /api/quotes/[id]` - Update quote
- ❌ `POST /api/quotes/[id]/send` - Send quote
- ❌ `POST /api/quotes/[id]/convert` - Convert quote to job
- ❌ `GET /api/estimates` - List estimates
- ❌ `POST /api/estimates` - Create estimate
- ❌ `GET /api/estimates/[id]` - Get estimate details
- ❌ `PATCH /api/estimates/[id]` - Update estimate

### Dispatch & Scheduling APIs (Missing)
- ❌ `GET /api/dispatch/queue` - Get dispatch queue
- ❌ `POST /api/dispatch/assign` - Assign job to tech
- ❌ `POST /api/dispatch/reassign` - Reassign job
- ❌ `GET /api/dispatch/routes` - Get optimized routes
- ❌ `POST /api/dispatch/optimize` - Optimize routes
- ❌ `GET /api/schedule` - Get schedule
- ❌ `POST /api/schedule/block` - Block time slot
- ❌ `DELETE /api/schedule/block/[id]` - Remove time block

### Customer Service APIs (Missing)
- ❌ `GET /api/tickets` - List support tickets
- ❌ `POST /api/tickets` - Create ticket
- ❌ `GET /api/tickets/[id]` - Get ticket details
- ❌ `PATCH /api/tickets/[id]` - Update ticket
- ❌ `POST /api/tickets/[id]/resolve` - Resolve ticket
- ❌ `GET /api/knowledge-base` - List knowledge base articles
- ❌ `POST /api/knowledge-base` - Create article
- ❌ `GET /api/knowledge-base/[id]` - Get article
- ❌ `PATCH /api/knowledge-base/[id]` - Update article
- ❌ `DELETE /api/knowledge-base/[id]` - Delete article

### Inventory & Materials APIs (Missing)
- ❌ `GET /api/inventory` - List inventory items
- ❌ `POST /api/inventory` - Create inventory item
- ❌ `GET /api/inventory/[id]` - Get inventory item
- ❌ `PATCH /api/inventory/[id]` - Update inventory item
- ❌ `POST /api/inventory/[id]/adjust` - Adjust stock level
- ❌ `GET /api/suppliers` - List suppliers
- ❌ `POST /api/suppliers` - Create supplier
- ❌ `GET /api/suppliers/[id]` - Get supplier
- ❌ `PATCH /api/suppliers/[id]` - Update supplier
- ❌ `GET /api/purchase-orders` - List purchase orders
- ❌ `POST /api/purchase-orders` - Create purchase order
- ❌ `GET /api/purchase-orders/[id]` - Get purchase order
- ❌ `PATCH /api/purchase-orders/[id]` - Update purchase order

### Multi-Tenant & Billing APIs (Missing)
- ❌ `GET /api/tenants` - List tenants (admin only)
- ❌ `POST /api/tenants` - Create tenant (admin only)
- ❌ `GET /api/tenants/[id]` - Get tenant details
- ❌ `PATCH /api/tenants/[id]` - Update tenant
- ❌ `GET /api/billing/subscriptions` - List subscriptions
- ❌ `POST /api/billing/subscriptions` - Create subscription
- ❌ `GET /api/billing/usage` - Get usage stats
- ❌ `GET /api/billing/invoices` - List billing invoices

### Workflow & Approval APIs (Missing)
- ❌ `GET /api/workflows` - List workflows
- ❌ `POST /api/workflows` - Create workflow
- ❌ `GET /api/workflows/[id]` - Get workflow
- ❌ `PATCH /api/workflows/[id]` - Update workflow
- ❌ `POST /api/workflows/[id]/trigger` - Trigger workflow
- ❌ `GET /api/approvals` - List pending approvals
- ❌ `POST /api/approvals/[id]/approve` - Approve request
- ❌ `POST /api/approvals/[id]/reject` - Reject request

### Mobile & Real-Time APIs (Missing)
- ❌ `POST /api/mobile/auth` - Mobile authentication
- ❌ `POST /api/push/register` - Register push token
- ❌ `POST /api/push/send` - Send push notification
- ❌ `GET /api/realtime/subscribe` - Subscribe to real-time updates
- ❌ `POST /api/gps/track` - Track GPS location

### Customer Portal APIs (Missing)
- ❌ `POST /api/customer/auth` - Customer authentication
- ❌ `GET /api/customer/jobs` - Get customer's jobs
- ❌ `GET /api/customer/invoices` - Get customer's invoices
- ❌ `POST /api/customer/schedule` - Request schedule change
- ❌ `POST /api/customer/payment` - Process payment

---

## Implementation Checklist

### Phase 1: Verify Existing APIs
- [ ] Verify all DELETE endpoints exist
- [ ] Verify all PATCH endpoints support full updates
- [ ] Verify all endpoints support Bearer token auth
- [ ] Verify all endpoints enforce account isolation
- [ ] Document all endpoint parameters and responses

### Phase 2: Create Missing Core APIs
- [ ] Sales Pipeline APIs (leads, quotes, estimates)
- [ ] Dispatch & Scheduling APIs
- [ ] Customer Service APIs (tickets, knowledge base)
- [ ] Inventory & Materials APIs

### Phase 3: Create Enterprise APIs
- [ ] Multi-Tenant & Billing APIs
- [ ] Workflow & Approval APIs
- [ ] Mobile & Real-Time APIs
- [ ] Customer Portal APIs

### Phase 4: Enhance Existing APIs
- [ ] Add missing DELETE operations
- [ ] Add missing PATCH operations
- [ ] Add advanced filtering options
- [ ] Add bulk operations where needed

---

## File Structure Standards

All API routes follow this structure:
```
app/api/
├── [resource]/
│   ├── route.ts                    # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts                # GET (get), PATCH (update), DELETE (delete)
│       ├── [action]/route.ts       # POST/PATCH for specific actions
│       └── [nested-resource]/
│           └── route.ts            # Nested resources
```

---

## Implementation Standards

All APIs must follow the standards defined in:
- `shared-docs/AGENT_ORCHESTRATION_STANDARDS.md`

Key requirements:
- ✅ Authentication (Bearer token OR cookies)
- ✅ Account isolation (always filter by account_id)
- ✅ Error handling (try-catch, proper status codes)
- ✅ Response format consistency
- ✅ Pagination support (limit/offset)
- ✅ Count support (for list endpoints)

---

## Progress Tracking

See `shared-docs/SWARM_COORDINATION.md` for overall progress tracking.

See individual wave progress files:
- `shared-docs/WAVE1_PROGRESS.md` - Core API progress
- `shared-docs/WAVE2_PROGRESS.md` - Sales/Marketing API progress
- `shared-docs/WAVE3_PROGRESS.md` - Operations API progress
- `shared-docs/WAVE4_PROGRESS.md` - Management API progress
- `shared-docs/WAVE5_PROGRESS.md` - Enterprise API progress

---

**Last Updated**: 09:46:59 Nov 23, 2025  
**Next Review**: After Wave 1 completion

---

09:46:59 Nov 23, 2025

