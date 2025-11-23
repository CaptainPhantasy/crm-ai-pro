# API Endpoints Implementation - Agent Coordination

**Status**: In Progress
**Last Updated**: 2025-01-XX

## Implementation Waves

### Wave 1: Priority 1 - Job Photos API (Complete Phase 4)
- **Agent 1.1**: Job Photos CRUD API
  - Files: `app/api/job-photos/route.ts`, `app/api/job-photos/[id]/route.ts`
  - Endpoints: GET (list), POST (create), DELETE
  - Dependencies: Existing upload-photo pattern

### Wave 2: Priority 2 - Real-time Features (Phase 7)
- **Agent 2.1**: Notifications API
  - Files: `app/api/notifications/route.ts`, `app/api/notifications/[id]/route.ts`
  - Endpoints: GET (list with filters), POST, PATCH (read/unread), DELETE
- **Agent 2.2**: Call Logs API
  - Files: `app/api/call-logs/route.ts`, `app/api/call-logs/[id]/route.ts`
  - Endpoints: GET (list), POST, GET [id], PATCH

### Wave 3: Priority 3 - Marketing Features (Phase 6)
- **Agent 3.1**: Email Templates API
  - Files: `app/api/email-templates/route.ts`, `app/api/email-templates/[id]/route.ts`
- **Agent 3.2**: Contact Tags API
  - Files: `app/api/contact-tags/route.ts`, `app/api/contact-tags/[id]/route.ts`
- **Agent 3.3**: Contact Tag Assignments API
  - Files: `app/api/contacts/[id]/tags/route.ts`
- **Agent 3.4**: Campaigns API
  - Files: `app/api/campaigns/route.ts`, `app/api/campaigns/[id]/route.ts`, `app/api/campaigns/[id]/recipients/route.ts`

### Wave 4: Priority 4 - Enhance Existing APIs
- **Agent 4.1**: Invoices API Enhancements
  - Files: `app/api/invoices/[id]/route.ts` (NEW)
  - Endpoints: GET [id], PATCH, DELETE, POST send, POST mark-paid
- **Agent 4.2**: Payments API Enhancements
  - Files: `app/api/payments/route.ts` (enhance), `app/api/payments/[id]/route.ts` (NEW)
- **Agent 4.3**: Bulk Operations API
  - Files: `app/api/jobs/bulk/route.ts`, `app/api/contacts/bulk/route.ts`

### Wave 5: Priority 5 - Analytics & Reporting
- **Agent 5.1**: Analytics API
  - Files: `app/api/analytics/route.ts` and sub-routes
- **Agent 5.2**: Reports API
  - Files: `app/api/reports/route.ts`

### Wave 6: Priority 6 - Advanced Features
- **Agent 6.1**: Schedule Optimization API
  - Files: `app/api/schedule/optimize/route.ts`
- **Agent 6.2**: Review Requests API
  - Files: `app/api/review-requests/route.ts`

## Shared Patterns

### Authentication Pattern
```typescript
const session = await getAuthenticatedSession(request)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Supabase Client Pattern
```typescript
const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
    global: {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`,
      },
    },
  }
)
```

### Account ID Retrieval
```typescript
const { data: user } = await supabase
  .from('users')
  .select('account_id')
  .eq('id', session.user.id)
  .single()

if (!user) {
  return NextResponse.json({ error: 'User not found' }, { status: 404 })
}
```

### Error Handling Pattern
```typescript
try {
  // ... operation
  return NextResponse.json({ success: true, data })
} catch (error: unknown) {
  console.error('Error:', error)
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
```

## File Status Tracking

### Completed ✅
- **Wave 1**: Job Photos API (route.ts, [id]/route.ts)
- **Wave 2**: Notifications API (route.ts, [id]/route.ts, read-all/route.ts), Call Logs API (route.ts, [id]/route.ts)
- **Wave 3**: Email Templates API (route.ts, [id]/route.ts, [id]/preview/route.ts), Contact Tags API (route.ts, [id]/route.ts), Contact Tag Assignments API (contacts/[id]/tags/route.ts, contacts/[id]/tags/[tagId]/route.ts, contacts/bulk-tag/route.ts), Campaigns API (route.ts, [id]/route.ts, [id]/send/route.ts, [id]/pause/route.ts, [id]/resume/route.ts, [id]/recipients/route.ts, [id]/recipients/[contactId]/route.ts)
- **Wave 4**: Invoices API Enhancements ([id]/route.ts, [id]/send/route.ts, [id]/mark-paid/route.ts), Payments API Enhancements (POST added to route.ts, [id]/route.ts), Bulk Operations API (jobs/bulk/route.ts, contacts/bulk/route.ts)
- **Wave 5**: Analytics API (analytics/jobs/route.ts, analytics/contacts/route.ts, analytics/revenue/route.ts, analytics/dashboard/route.ts), Reports API (reports/route.ts)
- **Wave 6**: Schedule Optimization API (schedule/optimize/route.ts), Review Requests API (review-requests/route.ts)

### Total Endpoints Created: 30+ API route files

## Notes
- All endpoints must respect RLS policies (enforced automatically by Supabase)
- Use `current_account_id()` function for account filtering where applicable
- All endpoints require authentication
- Follow existing API response patterns for consistency

