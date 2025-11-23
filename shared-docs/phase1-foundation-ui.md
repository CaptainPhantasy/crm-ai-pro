# Phase 1: Foundation UI - Shared Documentation

## Database Schema Status
✅ **All Phase 1 database schema is complete**
- Performance indexes on contacts, jobs, conversations, messages exist
- All tables exist and are ready to use
- No schema work needed - focus on UI implementation
- Reference: shared-docs/SCHEMA_STATUS.md

## Phase 1 Status
✅ **Phase 1 COMPLETE**
- Wave 1.1: Contact Management UI ✅
- Wave 1.2: Job Management UI ✅
- Wave 1.3: Inbox Enhancements ✅

## Current API Endpoints

### Contacts API
- `GET /api/contacts` - List contacts (supports ?search=)
- `POST /api/contacts` - Create contact
  - Body: `{ email, phone?, firstName, lastName?, address? }`
- `GET /api/contacts/[id]` - Get contact by ID
- `PATCH /api/contacts/[id]` - Update contact

### Jobs API
- `GET /api/jobs` - List jobs (supports ?status=, ?techId=)
- `POST /api/jobs` - Create job
  - Body: `{ contactId, description, scheduledStart?, scheduledEnd?, status?, techAssignedId? }`
- `GET /api/jobs/[id]` - Get job by ID
- `PATCH /api/jobs/[id]/status` - Update job status
- `PATCH /api/jobs/[id]/assign` - Assign technician

### Conversations API
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation (may need to create)
  - Body: `{ accountId, contactId, subject?, channel? }`

## Component Patterns

### Dialog Pattern (from CreateJobDialog)
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  </DialogContent>
</Dialog>
```

### Page Pattern (from existing pages)
- Use `'use client'` directive
- Fetch data in `useEffect`
- Handle loading/error states
- Use existing UI components (Card, Button, etc.)

## Testing Checklist

### Contact Detail
- [x] Page/modal loads without errors
- [x] Displays contact information correctly
- [x] Shows job history (if any)
- [x] Shows conversation history (if any)
- [x] Can navigate back/close

### Add Contact Form
- [x] Dialog opens from "Add Contact" button
- [x] Form validates required fields
- [x] Submits successfully
- [x] Refreshes contact list after creation
- [x] Shows success/error messages

### Message Contact
- [x] Creates conversation if doesn't exist
- [x] Navigates to inbox with conversation selected
- [x] Conversation appears in inbox list

## Files to Create/Modify

### Agent 1.1.1: Contact Detail
- Create: `app/(dashboard)/contacts/[id]/page.tsx` OR `components/contacts/contact-detail-modal.tsx`
- Modify: `app/(dashboard)/contacts/page.tsx` (line 75 - update handleViewContact)

### Agent 1.1.2: Add Contact Form
- Create: `components/contacts/add-contact-dialog.tsx`
- Modify: `app/(dashboard)/contacts/page.tsx` (line 71 - replace alert with dialog)

### Agent 1.1.3: Message Contact
- Modify: `app/(dashboard)/contacts/page.tsx` (line 79 - implement handleMessageContact)
- May need: `app/api/conversations/route.ts` POST endpoint

