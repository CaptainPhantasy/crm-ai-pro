# Phase 2: Management & Configuration UI - Shared Documentation

## Phase 2 Status
✅ **Phase 2 COMPLETE**
- Wave 2.1: User Management ✅
- Wave 2.2: System Configuration ✅
- Wave 2.3: Account Settings ✅

## Database Schema Status
✅ **All Phase 2 database schema is complete**
- `users` table exists with role field
- `llm_providers` table exists
- `automation_rules` table exists
- `crmai_audit` table exists
- `accounts` table with `settings` JSONB field exists
- All tables ready to use
- Reference: shared-docs/SCHEMA_STATUS.md

## Current API Endpoints

### Users API
- Need to create: `GET /api/users` (may already exist from Phase 1)
- Need to create: `POST /api/users` (create user)
- Need to create: `PATCH /api/users/[id]` (update user role)

### LLM Providers API
- Need to check: Direct Supabase queries or API endpoints
- Table: `llm_providers`
- Fields: `id`, `account_id`, `name`, `api_key_encrypted`, `use_cases`, `is_active`, etc.

### Automation Rules API
- Table: `automation_rules`
- Fields: `id`, `account_id`, `trigger_type`, `trigger_conditions`, `action_type`, `action_config`, `is_active`

### Audit Logs API
- Table: `crmai_audit`
- Fields: `id`, `account_id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`

### Account Settings API
- Table: `accounts`
- Field: `settings` (JSONB) - contains business hours, branding, etc.

## Role-Based Access Patterns

### Admin Route Protection
- Check user role in middleware or API route
- Roles: 'owner', 'admin', 'dispatcher', 'tech'
- Admin features require: role === 'owner' OR role === 'admin'
- Use `getAuthenticatedSession` helper
- Query `users` table to get role

### RLS Policy Requirements
- Users can read own account users (RLS exists)
- Only admins can create/update users
- LLM providers: Admins can manage, users can read
- Automation rules: Admins can manage
- Audit logs: Users can read own account logs

## Component Patterns

### Admin Page Pattern
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    // Fetch current user and check role
    // Redirect if not admin
  }

  // Rest of component
}
```

### User Management Pattern
- List users from `/api/users` or direct Supabase query
- Create user via Supabase Auth Admin API
- Update role in `users` table

## Testing Checklist

### User Management
- [ ] Page loads for admin users
- [ ] Non-admin users redirected
- [ ] User list displays correctly
- [ ] Can create new user
- [ ] Can update user role
- [ ] RLS policies enforced

### LLM Provider Management
- [ ] Can view providers
- [ ] Can add provider
- [ ] Can edit provider
- [ ] Can toggle active/inactive
- [ ] API keys encrypted

### Automation Rules
- [ ] Can view rules
- [ ] Can create rule
- [ ] Can edit rule
- [ ] Can toggle active/inactive
- [ ] Rules trigger correctly

### Audit Logs
- [ ] Can view logs
- [ ] Can filter by user/action/date
- [ ] Logs display correctly

### Account Settings
- [ ] Can view settings
- [ ] Can update settings
- [ ] Changes persist

## Files to Create/Modify

### Agent 2.1.1: User Management Page
- Create: `app/(dashboard)/admin/users/page.tsx`
- May need: `lib/admin-auth.ts` (helper for admin checks)

### Agent 2.1.2: Add/Edit User Dialog
- Create: `components/admin/user-dialog.tsx`
- Uses: Supabase Auth Admin API (service role key)

### Agent 2.2.1: LLM Provider Management
- Create: `app/(dashboard)/admin/llm-providers/page.tsx`
- May need: `components/admin/llm-provider-dialog.tsx`

### Agent 2.2.2: Automation Rules Configuration
- Create: `app/(dashboard)/admin/automation/page.tsx`
- May need: `components/admin/automation-rule-dialog.tsx`

### Agent 2.2.3: Audit Log Viewer
- Create: `app/(dashboard)/admin/audit/page.tsx`

### Agent 2.3.1: Account Settings
- Create: `app/(dashboard)/admin/settings/page.tsx`

