# API to Voice Tool Mapping

**Date**: 09:46:59 Nov 23, 2025  
**Status**: Wave 0 - Foundation Complete  
**Purpose**: Complete mapping of REST API endpoints to MCP voice tools and voice-command function tools.

---

## Mapping Overview

This document maps every REST API endpoint to its corresponding:
1. **MCP Tool** (in `lib/mcp/tools/crm-tools.ts`)
2. **Voice-Command Tool** (in `supabase/functions/voice-command/index.ts`)

**Critical Rule**: MCP tool names MUST match Voice-Command tool names exactly (1:1 mapping).

---

## Core Operations

### Jobs API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/jobs` | `list_jobs` | `list_jobs` | ✅ | HIGH |
| `POST /api/jobs` | `create_job` | `create_job` | ✅ | HIGH |
| `GET /api/jobs/[id]` | `get_job` | `get_job` | ✅ | HIGH |
| `PATCH /api/jobs/[id]` | `update_job` | `update_job` | ❌ | MEDIUM |
| `PATCH /api/jobs/[id]/status` | `update_job_status` | `update_job_status` | ✅ | HIGH |
| `PATCH /api/jobs/[id]/assign` | `assign_tech` | `assign_tech` | ✅ | HIGH |
| `PATCH /api/jobs/[id]/assign` | `assign_tech_by_name` | `assign_tech_by_name` | ⚠️ | HIGH |
| `POST /api/jobs/[id]/upload-photo` | `upload_photo` | `upload_photo` | ❌ | HIGH |
| `POST /api/jobs/[id]/location` | `capture_location` | `capture_location` | ❌ | HIGH |
| `POST /api/jobs/bulk` | `bulk_operations` | `bulk_operations` | ❌ | HIGH |
| `DELETE /api/jobs/[id]` | `delete_job` | `delete_job` | ❓ | LOW |

### Contacts API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/contacts` | `list_contacts` | `list_contacts` | ❌ | HIGH |
| `POST /api/contacts` | `create_contact` | `create_contact` | ✅ | HIGH |
| `GET /api/contacts/[id]` | `get_contact` | `get_contact` | ✅ | HIGH |
| `PATCH /api/contacts/[id]` | `update_contact` | `update_contact` | ❌ | HIGH |
| `DELETE /api/contacts/[id]` | `delete_contact` | `delete_contact` | ❓ | LOW |
| `GET /api/contacts/[id]/notes` | `get_contact_notes` | `get_contact_notes` | ❌ | LOW |
| `POST /api/contacts/[id]/notes` | `add_contact_note` | `add_contact_note` | ❌ | LOW |
| `GET /api/contacts/[id]/tags` | `get_contact_tags` | `get_contact_tags` | ❌ | MEDIUM |
| `POST /api/contacts/[id]/tags` | `assign_contact_tag` | `assign_contact_tag` | ❌ | MEDIUM |
| `DELETE /api/contacts/[id]/tags/[tagId]` | `remove_contact_tag` | `remove_contact_tag` | ❌ | MEDIUM |
| `POST /api/contacts/bulk` | `bulk_contact_operations` | `bulk_contact_operations` | ❌ | MEDIUM |
| `POST /api/contacts/bulk-tag` | `bulk_tag_contacts` | `bulk_tag_contacts` | ❌ | MEDIUM |

### Conversations API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/conversations` | `list_conversations` | `list_conversations` | ❌ | HIGH |
| `POST /api/conversations` | `create_conversation` | `create_conversation` | ❌ | MEDIUM |
| `GET /api/conversations/[id]` | `get_conversation` | `get_conversation` | ❌ | HIGH |
| `PATCH /api/conversations/[id]` | `update_conversation_status` | `update_conversation_status` | ❌ | MEDIUM |
| `GET /api/conversations/[id]/messages` | `get_conversation_messages` | `get_conversation_messages` | ❌ | HIGH |
| `GET /api/conversations/[id]/notes` | `get_conversation_notes` | `get_conversation_notes` | ❌ | LOW |
| `POST /api/conversations/[id]/notes` | `add_conversation_note` | `add_conversation_note` | ❌ | LOW |

### Messages API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `POST /api/send-message` | `send_message` | `send_message` | ❌ | HIGH |
| `POST /api/ai/draft` | `generate_draft` | `generate_draft` | ❌ | HIGH |

---

## Field Operations

### Tech Dashboard API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/tech/jobs` | `get_my_jobs` | `get_my_jobs` | ❌ | HIGH |
| `PATCH /api/tech/jobs/[id]/status` | `update_my_job_status` | `update_my_job_status` | ❌ | HIGH |

### Time Tracking API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/time-entries` | `list_time_entries` | `list_time_entries` | ❌ | MEDIUM |
| `POST /api/time-entries` | `clock_in` | `clock_in` | ❌ | HIGH |
| `PATCH /api/time-entries/[id]` | `clock_out` | `clock_out` | ❌ | HIGH |
| `GET /api/time-entries/[id]` | `get_time_entry` | `get_time_entry` | ❌ | LOW |
| `PATCH /api/time-entries/[id]` | `update_time_entry` | `update_time_entry` | ❌ | LOW |

### Job Photos API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/job-photos` | `list_job_photos` | `list_job_photos` | ✅ | MEDIUM |
| `POST /api/job-photos` | `upload_job_photo` | `upload_job_photo` | ❌ | HIGH |
| `DELETE /api/job-photos/[id]` | `delete_job_photo` | `delete_job_photo` | ❌ | LOW |
| `GET /api/job-photos/[id]` | `get_job_photo` | `get_job_photo` | ❌ | LOW |

### Job Materials API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/job-materials` | `list_job_materials` | `list_job_materials` | ❌ | MEDIUM |
| `POST /api/job-materials` | `add_job_material` | `add_job_material` | ❌ | MEDIUM |
| `DELETE /api/job-materials/[id]` | `remove_job_material` | `remove_job_material` | ❌ | LOW |

### Signatures API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/signatures` | `list_signatures` | `list_signatures` | ❌ | LOW |
| `POST /api/signatures` | `create_signature` | `create_signature` | ❌ | LOW |
| `GET /api/signatures/[id]` | `get_signature` | `get_signature` | ❌ | LOW |

---

## Marketing Operations

### Campaigns API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/campaigns` | `list_campaigns` | `list_campaigns` | ❌ | MEDIUM |
| `POST /api/campaigns` | `create_campaign` | `create_campaign` | ❌ | MEDIUM |
| `GET /api/campaigns/[id]` | `get_campaign` | `get_campaign` | ❌ | MEDIUM |
| `PATCH /api/campaigns/[id]` | `update_campaign` | `update_campaign` | ❌ | MEDIUM |
| `DELETE /api/campaigns/[id]` | `delete_campaign` | `delete_campaign` | ❓ | LOW |
| `POST /api/campaigns/[id]/send` | `send_campaign` | `send_campaign` | ❌ | MEDIUM |
| `POST /api/campaigns/[id]/pause` | `pause_campaign` | `pause_campaign` | ❌ | MEDIUM |
| `POST /api/campaigns/[id]/resume` | `resume_campaign` | `resume_campaign` | ❌ | MEDIUM |
| `GET /api/campaigns/[id]/recipients` | `list_campaign_recipients` | `list_campaign_recipients` | ❌ | LOW |
| `POST /api/campaigns/[id]/recipients` | `add_campaign_recipient` | `add_campaign_recipient` | ❌ | LOW |
| `DELETE /api/campaigns/[id]/recipients/[contactId]` | `remove_campaign_recipient` | `remove_campaign_recipient` | ❌ | LOW |

### Email Templates API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/email-templates` | `list_email_templates` | `list_email_templates` | ❌ | MEDIUM |
| `POST /api/email-templates` | `create_email_template` | `create_email_template` | ❌ | MEDIUM |
| `GET /api/email-templates/[id]` | `get_email_template` | `get_email_template` | ❌ | MEDIUM |
| `PATCH /api/email-templates/[id]` | `update_email_template` | `update_email_template` | ❌ | MEDIUM |
| `DELETE /api/email-templates/[id]` | `delete_email_template` | `delete_email_template` | ❓ | LOW |
| `POST /api/email-templates/[id]/preview` | `preview_email_template` | `preview_email_template` | ❌ | LOW |

### Contact Tags API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/contact-tags` | `list_contact_tags` | `list_contact_tags` | ❌ | MEDIUM |
| `POST /api/contact-tags` | `create_contact_tag` | `create_contact_tag` | ❌ | MEDIUM |
| `GET /api/contact-tags/[id]` | `get_contact_tag` | `get_contact_tag` | ❌ | LOW |
| `PATCH /api/contact-tags/[id]` | `update_contact_tag` | `update_contact_tag` | ❌ | LOW |
| `DELETE /api/contact-tags/[id]` | `delete_contact_tag` | `delete_contact_tag` | ❌ | LOW |

---

## Financial Operations

### Invoices API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/invoices` | `list_invoices` | `list_invoices` | ✅ | MEDIUM |
| `POST /api/invoices` | `create_invoice` | `create_invoice` | ✅ | MEDIUM |
| `GET /api/invoices/[id]` | `get_invoice` | `get_invoice` | ✅ | MEDIUM |
| `PATCH /api/invoices/[id]` | `update_invoice` | `update_invoice` | ❌ | MEDIUM |
| `DELETE /api/invoices/[id]` | `delete_invoice` | `delete_invoice` | ❓ | LOW |
| `POST /api/invoices/[id]/send` | `send_invoice` | `send_invoice` | ❌ | MEDIUM |
| `POST /api/invoices/[id]/mark-paid` | `mark_invoice_paid` | `mark_invoice_paid` | ❌ | MEDIUM |

### Payments API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/payments` | `list_payments` | `list_payments` | ❌ | MEDIUM |
| `POST /api/payments` | `create_payment` | `create_payment` | ❌ | MEDIUM |
| `GET /api/payments/[id]` | `get_payment` | `get_payment` | ❌ | LOW |
| `PATCH /api/payments/[id]` | `update_payment` | `update_payment` | ❓ | LOW |
| `DELETE /api/payments/[id]` | `delete_payment` | `delete_payment` | ❓ | LOW |

### Finance Stats API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/finance/stats` | `get_finance_stats` | `get_finance_stats` | ❌ | MEDIUM |

---

## Analytics & Reporting

### Analytics API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/analytics/dashboard` | `get_dashboard_stats` | `get_dashboard_stats` | ✅ | HIGH |
| `GET /api/analytics/jobs` | `get_job_analytics` | `get_job_analytics` | ✅ | HIGH |
| `GET /api/analytics/contacts` | `get_contact_analytics` | `get_contact_analytics` | ❌ | MEDIUM |
| `GET /api/analytics/revenue` | `get_revenue_analytics` | `get_revenue_analytics` | ✅ | HIGH |

### Reports API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `POST /api/reports` | `generate_report` | `generate_report` | ❌ | MEDIUM |

---

## Notifications & Communication

### Notifications API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/notifications` | `list_notifications` | `list_notifications` | ✅ | MEDIUM |
| `POST /api/notifications` | `create_notification` | `create_notification` | ✅ | LOW |
| `GET /api/notifications/[id]` | `get_notification` | `get_notification` | ❌ | LOW |
| `PATCH /api/notifications/[id]` | `mark_notification_read` | `mark_notification_read` | ❌ | MEDIUM |
| `DELETE /api/notifications/[id]` | `delete_notification` | `delete_notification` | ❓ | LOW |
| `POST /api/notifications/read-all` | `mark_all_notifications_read` | `mark_all_notifications_read` | ❌ | LOW |

### Call Logs API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/call-logs` | `list_call_logs` | `list_call_logs` | ❌ | MEDIUM |
| `POST /api/call-logs` | `create_call_log` | `create_call_log` | ✅ | MEDIUM |
| `GET /api/call-logs/[id]` | `get_call_log` | `get_call_log` | ❌ | LOW |
| `PATCH /api/call-logs/[id]` | `update_call_log` | `update_call_log` | ❌ | LOW |
| `DELETE /api/call-logs/[id]` | `delete_call_log` | `delete_call_log` | ❓ | LOW |

---

## Advanced Features

### Schedule Optimization API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `POST /api/schedule/optimize` | `optimize_schedule` | `optimize_schedule` | ❌ | LOW |

### Review Requests API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/review-requests` | `list_review_requests` | `list_review_requests` | ❌ | LOW |
| `POST /api/review-requests` | `send_review_request` | `send_review_request` | ✅ | LOW |
| `PATCH /api/review-requests/[id]` | `update_review_request` | `update_review_request` | ❓ | LOW |

---

## Export Operations

### Export API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/export/contacts` | `export_contacts` | `export_contacts` | ❌ | LOW |
| `GET /api/export/jobs` | `export_jobs` | `export_jobs` | ❌ | LOW |
| `GET /api/export/invoices` | `export_invoices` | `export_invoices` | ❌ | LOW |

---

## Integration Operations

### Gmail Integration API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/integrations/gmail/authorize` | `authorize_gmail` | `authorize_gmail` | ❌ | LOW |
| `GET /api/integrations/gmail/callback` | `gmail_callback` | `gmail_callback` | ❌ | LOW |
| `GET /api/integrations/gmail/status` | `get_gmail_status` | `get_gmail_status` | ❌ | LOW |
| `POST /api/integrations/gmail/send` | `send_gmail` | `send_gmail` | ❌ | LOW |
| `POST /api/integrations/gmail/sync` | `sync_gmail` | `sync_gmail` | ❌ | LOW |

### Microsoft Integration API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/integrations/microsoft/authorize` | `authorize_microsoft` | `authorize_microsoft` | ❌ | LOW |
| `GET /api/integrations/microsoft/callback` | `microsoft_callback` | `microsoft_callback` | ❌ | LOW |
| `GET /api/integrations/microsoft/status` | `get_microsoft_status` | `get_microsoft_status` | ❌ | LOW |
| `POST /api/integrations/microsoft/sync` | `sync_microsoft` | `sync_microsoft` | ❌ | LOW |

---

## Administrative Operations

### Users API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/users` | `list_users` | `list_users` | ❌ | LOW |
| `GET /api/users/[id]` | `get_user` | `get_user` | ❌ | LOW |
| `POST /api/users` | `create_user` | `create_user` | ❓ | LOW |
| `PATCH /api/users/[id]` | `update_user` | `update_user` | ❓ | LOW |
| `GET /api/users/me` | `get_current_user` | `get_current_user` | ❌ | MEDIUM |

### Account Settings API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/account/settings` | `get_account_settings` | `get_account_settings` | ❌ | LOW |
| `PATCH /api/account/settings` | `update_account_settings` | `update_account_settings` | ❓ | LOW |

### Automation Rules API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/automation-rules` | `list_automation_rules` | `list_automation_rules` | ❌ | LOW |
| `POST /api/automation-rules` | `create_automation_rule` | `create_automation_rule` | ❌ | LOW |
| `GET /api/automation-rules/[id]` | `get_automation_rule` | `get_automation_rule` | ❌ | LOW |
| `PATCH /api/automation-rules/[id]` | `update_automation_rule` | `update_automation_rule` | ❌ | LOW |
| `DELETE /api/automation-rules/[id]` | `delete_automation_rule` | `delete_automation_rule` | ❓ | LOW |

### LLM Providers API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/llm-providers` | `list_llm_providers` | `list_llm_providers` | ❌ | LOW |
| `POST /api/llm-providers` | `create_llm_provider` | `create_llm_provider` | ❌ | LOW |
| `GET /api/llm-providers/[id]` | `get_llm_provider` | `get_llm_provider` | ❌ | LOW |
| `PATCH /api/llm-providers/[id]` | `update_llm_provider` | `update_llm_provider` | ❌ | LOW |
| `DELETE /api/llm-providers/[id]` | `delete_llm_provider` | `delete_llm_provider` | ❓ | LOW |

### Audit API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/audit` | `get_audit_logs` | `get_audit_logs` | ❌ | LOW |

---

## Utility Endpoints

### Search API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/search` | `global_search` | `global_search` | ❌ | MEDIUM |

### Voice Command API

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `POST /api/voice-command` | N/A (entry point) | N/A (entry point) | ✅ | HIGH |

### Webhooks

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `POST /api/webhooks/elevenlabs` | N/A (webhook) | N/A (webhook) | ✅ | HIGH |
| `POST /api/webhooks/stripe` | N/A (webhook) | N/A (webhook) | ✅ | LOW |

### MCP Server

| API Endpoint | MCP Tool | Voice Tool | Status | Priority |
|-------------|----------|------------|--------|----------|
| `GET /api/mcp` | N/A (health check) | N/A (health check) | ✅ | HIGH |
| `POST /api/mcp` | N/A (JSON-RPC) | N/A (JSON-RPC) | ✅ | HIGH |

---

## Status Legend

- ✅ **Implemented** - Tool exists in both MCP and Voice-Command
- ❌ **Missing** - API exists but tool not implemented
- ⚠️ **Needs Enhancement** - Tool exists but needs improvement
- ❓ **Needs Verification** - API endpoint may not exist or needs verification

---

## Implementation Priority

### Phase 1: High Priority (24 tools)
All Priority 1-4 tools from voice-only COT analysis

### Phase 2: Medium Priority (40 tools)
Core operations extensions, marketing, financial operations

### Phase 3: Low Priority (50+ tools)
Administrative, integrations, advanced features

---

## Naming Conventions

### Tool Names
- **Format**: `snake_case`
- **Pattern**: `{action}_{resource}` (e.g., `list_jobs`, `create_contact`)
- **Consistency**: MCP tool name MUST match Voice-Command tool name exactly

### Examples
- ✅ `list_jobs` (not `get_jobs` or `fetch_jobs`)
- ✅ `create_contact` (not `add_contact` or `new_contact`)
- ✅ `update_job_status` (not `change_job_status` or `set_job_status`)

---

## Parameter Mapping

### Common Patterns

#### ID Parameters
- API: `[id]` in URL path
- Tool: `{resource}Id` in parameters (e.g., `jobId`, `contactId`)

#### Filter Parameters
- API: Query parameters (e.g., `?status=completed&limit=50`)
- Tool: Object properties (e.g., `{ status: 'completed', limit: 50 }`)

#### Date Parameters
- API: ISO 8601 strings or query params
- Tool: Relative dates (e.g., "today", "tomorrow") or ISO 8601 strings

#### Name Resolution
- API: Requires UUID
- Tool: Accepts name or UUID, resolves name to UUID internally

---

## Implementation Standards

All tools must follow the standards defined in:
- `shared-docs/AGENT_ORCHESTRATION_STANDARDS.md`

Key requirements:
- ✅ Tool names match exactly (MCP = Voice-Command)
- ✅ Parameter names consistent
- ✅ Response format consistent
- ✅ Error handling consistent
- ✅ Voice-friendly messages

---

**Last Updated**: 09:46:59 Nov 23, 2025  
**Next Review**: After Wave 6 completion

---

09:46:59 Nov 23, 2025

