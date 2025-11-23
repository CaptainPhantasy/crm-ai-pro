# Phase 4: Field Service Enhancements - Shared Documentation

## Database Schema Status
✅ **All Phase 4 database schema is complete**
- `signatures` table exists
- `time_entries` table exists
- `job_materials` table exists
- `job_photos` table exists
- All tables ready to use
- Reference: shared-docs/SCHEMA_STATUS.md

## Current API Endpoints

### Jobs API (existing)
- `PATCH /api/jobs/[id]` - Can be used to update notes
- `GET /api/jobs/[id]` - Returns job with all fields

### Notes Field
- Jobs table has `notes` text field (or needs to be added)
- Can be updated via job update API

### Signatures API
- Need to create: `POST /api/signatures` (create signature)
- Need to create: `GET /api/signatures/[jobId]` (get signature for job)
- Table: `signatures`
- Fields: `id`, `account_id`, `job_id`, `contact_id`, `signature_data` (base64 image), `signed_at`

### Time Entries API
- Need to create: `POST /api/time-entries` (clock in/out)
- Need to create: `GET /api/time-entries?jobId=uuid` (get entries for job)
- Table: `time_entries`
- Fields: `id`, `account_id`, `job_id`, `user_id`, `clock_in_at`, `clock_out_at`, `duration_minutes`

### Materials API
- Need to create: `POST /api/job-materials` (add material)
- Need to create: `GET /api/job-materials?jobId=uuid` (get materials for job)
- Table: `job_materials`
- Fields: `id`, `account_id`, `job_id`, `material_name`, `quantity`, `unit_cost`, `total_cost`

## Component Patterns

### Notes Field Pattern
- Add textarea to job detail modal
- Save on blur or button click
- Show in job detail view

### Signature Capture Pattern
- Canvas-based signature component
- Convert to base64 image
- Store in signatures table
- Display in job detail

### Time Tracking Pattern
- Clock in/out buttons
- Show current time entry
- Display total time for job

### Material Tracking Pattern
- Add material form (name, quantity, cost)
- List materials for job
- Calculate total cost

## Testing Checklist

### Job Notes
- [x] Can add notes to job
- [x] Notes persist
- [x] Notes visible in job detail

### Signature Capture
- [x] Can capture signature
- [x] Signature stores correctly
- [x] Signature displays in job detail

### Time Tracking
- [x] Can clock in
- [x] Can clock out
- [x] Time calculated correctly
- [x] Time visible in job detail

### Material Tracking
- [x] Can add materials
- [x] Materials list correctly
- [x] Cost calculated correctly

## Files to Create/Modify

### Agent 4.1.1: Notes Field ✅ COMPLETE
- Modified: `components/jobs/job-detail-modal.tsx`
- Added notes textarea with save functionality
- Notes persist to database via PATCH `/api/jobs/[id]`
- Notes field added to Job type

### Agent 4.1.2: Signature Capture ✅ COMPLETE
- Created: `components/jobs/signature-capture.tsx`
- Created: `app/api/signatures/route.ts` (POST and GET)
- Integrated into job detail modal
- Canvas-based signature capture with touch support
- Signatures stored as base64 images in `signatures` table

### Agent 4.2.1: Time Tracking ✅ COMPLETE
- Created: `components/tech/time-tracker.tsx`
  - Clock in/out functionality
  - Real-time elapsed time display
  - Total time calculation
  - History of all time entries
- Created: `app/api/time-entries/route.ts`
  - POST: Clock in/out with validation
  - GET: Fetch all time entries for a job
  - Prevents double clock-in
  - Calculates duration automatically
- Integrated into job detail modal

### Agent 4.2.2: GPS Location ✅ COMPLETE
- Created: `components/tech/location-tracker.tsx`
  - Browser geolocation API integration
  - High accuracy location capture
  - Error handling for permissions
  - Open in maps functionality
- Created: `app/api/jobs/[id]/location/route.ts`
  - Saves location to job (start_location or complete_location based on status)
  - Stores latitude, longitude, accuracy
- Integrated into job detail modal

### Agent 4.3.1: Material Usage ✅ COMPLETE
- Created: `components/jobs/materials-dialog.tsx`
  - Full material management dialog
  - Add materials with name, quantity, unit, cost, supplier, notes
  - List all materials with total cost calculation
  - Delete materials functionality
  - Real-time cost calculation
- Created: `app/api/job-materials/route.ts`
  - POST: Create material record
  - GET: Fetch all materials for a job
  - Automatically calculates total_cost (quantity * unit_cost)
- Created: `app/api/job-materials/[id]/route.ts`
  - DELETE: Remove material record
- Modified: `components/jobs/job-detail-modal.tsx`
  - Added "Manage Materials" button
  - Integrated MaterialsDialog component

