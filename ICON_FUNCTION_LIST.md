# Icon Function & Feature List for Stylesheet

**Date**: 09:46:59 Nov 23, 2025  
**Purpose**: Comprehensive list of all function names, features, and actions used in the CRM application for icon generation

---

## MCP/Voice Tools (Current + Planned)

### Core Operations
- create_job
- get_job
- list_jobs
- update_job
- update_job_status
- delete_job
- assign_tech
- assign_tech_by_name
- bulk_operations
- search_jobs
- filter_jobs

### Contact Management
- create_contact
- get_contact
- list_contacts
- update_contact
- delete_contact
- search_contacts
- get_contact_notes
- add_contact_note
- get_contact_tags
- assign_contact_tag
- remove_contact_tag
- bulk_contact_operations
- bulk_tag_contacts

### Conversations & Messages
- create_conversation
- get_conversation
- list_conversations
- update_conversation_status
- get_conversation_messages
- get_conversation_notes
- add_conversation_note
- send_message
- generate_draft

### Field Operations
- upload_photo
- upload_job_photo
- capture_location
- clock_in
- clock_out
- get_my_jobs
- update_my_job_status
- list_time_entries
- get_time_entry
- update_time_entry
- list_job_materials
- add_job_material
- remove_job_material
- list_signatures
- create_signature
- get_signature
- list_job_photos
- get_job_photo
- delete_job_photo

### Financial Operations
- create_invoice
- get_invoice
- list_invoices
- update_invoice
- delete_invoice
- send_invoice
- mark_invoice_paid
- create_payment
- get_payment
- list_payments
- update_payment
- delete_payment
- get_finance_stats

### Marketing Operations
- create_campaign
- get_campaign
- list_campaigns
- update_campaign
- delete_campaign
- send_campaign
- pause_campaign
- resume_campaign
- list_campaign_recipients
- add_campaign_recipient
- remove_campaign_recipient
- create_email_template
- get_email_template
- list_email_templates
- update_email_template
- delete_email_template
- preview_email_template
- create_contact_tag
- get_contact_tag
- list_contact_tags
- update_contact_tag
- delete_contact_tag

### Analytics & Reporting
- get_dashboard_stats
- get_job_analytics
- get_contact_analytics
- get_revenue_analytics
- generate_report
- export_contacts
- export_jobs
- export_invoices

### Notifications & Communication
- create_notification
- get_notification
- list_notifications
- mark_notification_read
- mark_all_notifications_read
- delete_notification
- create_call_log
- get_call_log
- list_call_logs
- update_call_log
- delete_call_log
- send_review_request
- list_review_requests
- update_review_request

### User & Access Management
- list_users
- get_user
- create_user
- update_user
- delete_user
- get_current_user
- get_account_settings
- update_account_settings

### System Configuration
- list_automation_rules
- create_automation_rule
- get_automation_rule
- update_automation_rule
- delete_automation_rule
- list_llm_providers
- create_llm_provider
- get_llm_provider
- update_llm_provider
- delete_llm_provider
- get_audit_logs

### Integration Operations
- authorize_gmail
- get_gmail_status
- sync_gmail
- send_gmail
- gmail_callback
- authorize_microsoft
- get_microsoft_status
- sync_microsoft
- microsoft_callback

### Utility Operations
- global_search
- optimize_schedule
- get_user_email

---

## API Actions (HTTP Methods)

### CRUD Operations
- create
- read
- get
- list
- update
- patch
- delete
- remove

### Special Actions
- assign
- send
- mark
- pause
- resume
- upload
- download
- export
- import
- sync
- authorize
- generate
- preview
- capture
- clock_in
- clock_out
- navigate
- search
- filter
- bulk
- optimize

---

## UI Features & Actions

### Navigation
- dashboard
- inbox
- jobs
- contacts
- conversations
- invoices
- payments
- campaigns
- analytics
- reports
- settings
- users
- integrations
- tech_dashboard

### Button Actions
- new_job
- add_contact
- send_message
- generate_draft
- view_details
- edit
- delete
- assign
- start_job
- complete_job
- mark_complete
- mark_paid
- send_invoice
- upload_photo
- navigate
- call_dispatch
- clock_in
- clock_out
- add_note
- add_material
- create_campaign
- send_campaign
- pause_campaign
- resume_campaign
- export_data
- import_data
- search
- filter
- sort
- refresh
- close
- cancel
- save
- submit
- confirm
- approve
- reject

### Status Types
- lead
- scheduled
- en_route
- in_progress
- completed
- invoiced
- paid
- cancelled
- open
- closed
- snoozed
- draft
- sent
- overdue
- active
- inactive
- paused
- running

### Resource Types
- job
- contact
- conversation
- message
- invoice
- payment
- campaign
- email_template
- contact_tag
- notification
- call_log
- time_entry
- job_photo
- job_material
- signature
- user
- automation_rule
- llm_provider
- audit_log
- report
- analytics
- dashboard_stats

### User Roles
- owner
- admin
- dispatcher
- tech
- sales
- customer_service

### Integration Types
- gmail
- microsoft
- stripe
- elevenlabs
- openai
- anthropic

### File Types
- csv
- json
- pdf
- image
- photo
- document

### Time Periods
- today
- tomorrow
- this_week
- this_month
- this_year
- last_week
- last_month
- last_year
- custom_range

---

## Feature Categories

### Core CRM
- job_management
- contact_management
- conversation_management
- message_handling
- customer_service

### Field Service
- tech_dashboard
- location_tracking
- time_tracking
- photo_capture
- material_tracking
- signature_capture
- job_completion

### Financial
- invoicing
- payment_processing
- revenue_tracking
- expense_tracking
- financial_reporting

### Marketing
- campaign_management
- email_templates
- contact_segmentation
- tag_management
- bulk_messaging

### Analytics
- dashboard_analytics
- job_analytics
- contact_analytics
- revenue_analytics
- performance_metrics
- reporting

### Administration
- user_management
- role_management
- system_settings
- automation_rules
- llm_configuration
- audit_logging

### Integrations
- email_integration
- calendar_integration
- payment_integration
- voice_integration
- ai_integration

---

## Special Functions

### Voice Commands
- voice_command
- voice_demo
- voice_navigation
- voice_selection
- voice_confirmation

### Webhooks
- elevenlabs_webhook
- stripe_webhook
- inbound_email

### Edge Functions
- create_job_edge
- update_job_status_edge
- assign_tech_edge
- handle_inbound_email
- rag_search
- voice_command_edge
- automation_engine

### MCP Server
- mcp_health_check
- mcp_json_rpc
- mcp_tool_call

---

## UI Components

### Modals & Dialogs
- create_job_dialog
- create_contact_dialog
- create_invoice_dialog
- create_campaign_dialog
- edit_dialog
- delete_confirmation
- settings_dialog

### Lists & Tables
- job_list
- contact_list
- conversation_list
- invoice_list
- payment_list
- campaign_list
- user_list

### Forms
- job_form
- contact_form
- invoice_form
- campaign_form
- user_form
- settings_form

### Cards & Stats
- stats_card
- job_card
- contact_card
- invoice_card
- dashboard_card
- analytics_card

### Navigation
- sidebar
- topbar
- breadcrumbs
- tabs
- menu
- dropdown

---

## Status Indicators

### Job Status
- status_lead
- status_scheduled
- status_en_route
- status_in_progress
- status_completed
- status_invoiced
- status_paid
- status_cancelled

### Conversation Status
- status_open
- status_closed
- status_snoozed

### Invoice Status
- status_draft
- status_sent
- status_paid
- status_overdue

### Campaign Status
- status_draft
- status_scheduled
- status_running
- status_paused
- status_completed
- status_cancelled

---

## Quick Actions

### Common Actions
- quick_create_job
- quick_add_contact
- quick_send_message
- quick_assign_tech
- quick_update_status
- quick_add_note
- quick_upload_photo
- quick_clock_in
- quick_clock_out
- quick_navigate
- quick_call
- quick_email
- quick_view_details

---

## Total Count

- **MCP/Voice Tools**: ~150+ functions
- **API Actions**: ~20+ action types
- **UI Features**: ~100+ features
- **Status Types**: ~20+ statuses
- **Resource Types**: ~25+ resources
- **Total Unique Items**: ~300+ icons needed

---

**Last Updated**: 09:46:59 Nov 23, 2025

---

09:46:59 Nov 23, 2025

