# Inbox Troubleshooting Guide

## Issue: No Conversations Showing After Seeding

### ✅ Data Seeded Successfully
The seed API confirmed:
- 3 conversations created
- 5 contacts created
- 3 messages created

### Possible Causes

#### 1. Authentication Required
The conversation list requires user authentication. The component uses:
```typescript
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Solution**: 
- Make sure you're logged in
- Check browser console for authentication errors
- Verify Supabase session exists

#### 2. RLS Policies Blocking Access
Row Level Security (RLS) policies require:
- User must be authenticated
- User must have `account_id` matching the conversations

**Solution**:
- Ensure user record exists in `users` table with correct `account_id`
- Verify RLS policies are correctly applied

#### 3. Page Needs Refresh
After seeding, the page may need a refresh to fetch new data.

**Solution**:
- Refresh the page (F5 or Cmd+R)
- The Realtime subscription should pick up new conversations automatically

#### 4. Browser Console Errors
Check for JavaScript errors that might prevent the component from rendering.

**Solution**:
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed API calls

## Quick Fixes

### Option 1: Refresh the Page
Simply refresh the inbox page to reload conversations.

### Option 2: Check Authentication
1. Open browser console (F12)
2. Check for Supabase auth errors
3. Verify you're logged in

### Option 3: Verify User Account
Run this SQL in Supabase to check user account:
```sql
SELECT u.id, u.account_id, a.name 
FROM users u 
JOIN accounts a ON u.account_id = a.id 
LIMIT 1;
```

### Option 4: Check Conversations Directly
Run this SQL to verify conversations exist:
```sql
SELECT c.id, c.subject, c.status, c.last_message_at, ct.first_name, ct.last_name
FROM conversations c
LEFT JOIN contacts ct ON c.contact_id = ct.id
ORDER BY c.last_message_at DESC;
```

## Expected Behavior

After seeding and refreshing:
- 3 conversations should appear in the sidebar
- Each conversation should show:
  - Contact name (John Smith, Sarah Johnson, Mike Davis)
  - Subject line
  - Status badge
  - Last message date

## Next Steps

1. **Refresh the page** - Most common fix
2. **Check browser console** - Look for errors
3. **Verify authentication** - Make sure you're logged in
4. **Check Supabase dashboard** - Verify conversations exist in database

