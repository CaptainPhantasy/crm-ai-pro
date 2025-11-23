# Phase 3: Financial Features - Shared Documentation

## Database Schema Status
✅ **All Phase 3 database schema is complete**
- `invoices` table exists
- `payments` table exists
- Helper functions exist (`generate_invoice_number`, `calculate_job_total`)
- All tables ready to use
- Reference: shared-docs/SCHEMA_STATUS.md

## Current API Endpoints

### Invoices API
- Need to create: `POST /api/invoices` (create invoice)
- Need to create: `GET /api/invoices` (list invoices)
- Need to create: `GET /api/invoices/[id]` (get invoice)
- Table: `invoices`
- Fields: `id`, `account_id`, `job_id`, `contact_id`, `invoice_number`, `amount`, `status`, `due_date`, `stripe_payment_link`, etc.

### Payments API
- Need to create: `GET /api/payments` (list payments)
- Table: `payments`
- Fields: `id`, `account_id`, `invoice_id`, `job_id`, `amount`, `status`, `stripe_payment_intent_id`, `created_at`

### Stripe Integration
- Stripe API key should be in environment variables
- Use Stripe SDK to create payment links
- Store payment link in `invoices.stripe_payment_link` or `jobs.stripe_payment_link`

## Component Patterns

### Invoice Generation Pattern
- Form: Amount, description, due date
- Creates invoice record
- Generates Stripe payment link
- Links to job (if from job)

### Payment Status Pattern
- Lists jobs/invoices with payment status
- Filter by status (paid/unpaid)
- Filter by date range

## Testing Checklist

### Invoice Generation
- [ ] Can generate invoice from completed job
- [ ] Invoice record created
- [ ] Stripe payment link generated
- [ ] Payment link stored correctly

### Payment Processing
- [ ] Can view payment status
- [ ] Can filter by status/date
- [ ] Stripe webhook updates status
- [ ] Job status updates to 'paid'

### Financial Dashboard
- [ ] Revenue metrics display
- [ ] Outstanding invoices shown
- [ ] Payment rates calculated

## Files to Create/Modify

### Agent 3.1.1: Invoice Generation UI
- Create: `components/jobs/generate-invoice-dialog.tsx`
- Uses: `POST /api/invoices` (create)
- Integrates: Stripe API for payment links

### Agent 3.1.2: Payment Link Generation
- Modify: Invoice generation to create Stripe link
- Uses: Stripe API
- Stores: Payment link in invoice/job record

### Agent 3.2.1: Payment Status Tracking
- Create: `app/(dashboard)/finance/payments/page.tsx`
- Uses: `GET /api/payments` or query jobs with payment status

### Agent 3.2.2: Stripe Webhook Handler
- Create: `app/api/webhooks/stripe/route.ts`
- Handles: Payment success events
- Updates: Job/invoice status

### Agent 3.3.1: Financial Dashboard
- Create: `app/(dashboard)/finance/dashboard/page.tsx`
- Shows: Revenue, outstanding invoices, payment rates

