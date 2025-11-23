# Agent Orchestration Standards - Comprehensive Implementation Guide

**CRITICAL**: All agents MUST follow these standards exactly. Deviations will require refactoring.

---

## Table of Contents

1. [API Route Implementation Standards](#api-route-implementation-standards)
2. [MCP Tool Implementation Standards](#mcp-tool-implementation-standards)
3. [Voice-Command Tool Implementation Standards](#voice-command-tool-implementation-standards)
4. [Naming Conventions](#naming-conventions)
5. [File Structure Standards](#file-structure-standards)
6. [Error Handling Standards](#error-handling-standards)
7. [Response Format Standards](#response-format-standards)
8. [Authentication & Authorization Standards](#authentication--authorization-standards)
9. [Database Query Standards](#database-query-standards)
10. [Progress Tracking Standards](#progress-tracking-standards)
11. [Testing Requirements](#testing-requirements)
12. [Coordination Mechanisms](#coordination-mechanisms)

---

## API Route Implementation Standards

### Required File Structure

**Location**: `app/api/[resource]/route.ts` or `app/api/[resource]/[id]/route.ts`

### Required Imports (Exact Order)

```typescript
import { NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth-helper'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
// Additional imports as needed (e.g., Stripe, Resend)
```

### Standard GET Handler Pattern

```typescript
export async function GET(request: Request) {
  try {
    // 1. Authentication
    const auth = await getAuthenticatedSession(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Supabase Client Setup (supports Bearer token OR cookies)
    const authHeader = request.headers.get('authorization')
    let supabase: ReturnType<typeof createServerClient>

    if (authHeader?.startsWith('Bearer ')) {
      const { createClient } = await import('@supabase/supabase-js')
      const token = authHeader.substring(7)
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )
    } else {
      const cookieStore = await cookies()
      supabase = createServerClient(
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
              Authorization: `Bearer ${auth.session.access_token}`,
            },
          },
        }
      )
    }

    // 3. Get Account ID (REQUIRED for all queries)
    const { data: user } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', auth.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 4. Parse Query Parameters
    const { searchParams } = new URL(request.url)
    const param1 = searchParams.get('param1')
    const param2 = searchParams.get('param2')
    // ... parse all query params

    // 5. Build Query (ALWAYS filter by account_id)
    let query = supabase
      .from('table_name')
      .select('*, relation:related_table(*)') // Use proper joins
      .eq('account_id', user.account_id) // REQUIRED: Account isolation

    // 6. Apply Filters
    if (param1) query = query.eq('field', param1)
    if (param2) query = query.gte('date_field', param2)

    // 7. Ordering & Pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset || 0, (offset || 0) + (limit || 50) - 1)

    // 8. Execute Query
    const { data, error, count } = await query

    // 9. Error Handling
    if (error) {
      console.error('Error fetching [resource]:', error)
      return NextResponse.json({ error: 'Failed to fetch [resource]' }, { status: 500 })
    }

    // 10. Return Response (consistent format)
    return NextResponse.json({
      [resource]: data || [],
      total: count || 0,
      limit: limit || 50,
      offset: offset || 0,
    })
  } catch (error: unknown) {
    console.error('Unexpected error in GET /api/[resource]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### Standard POST Handler Pattern

```typescript
export async function POST(request: Request) {
  try {
    // 1-3. Same as GET (Auth, Supabase, Account ID)
    const auth = await getAuthenticatedSession(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ... (Supabase client setup - same as GET)

    const { data: user } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', auth.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 4. Parse Request Body
    const body = await request.json()
    const { field1, field2, requiredField } = body

    // 5. Validation (REQUIRED)
    if (!requiredField) {
      return NextResponse.json(
        { error: 'Missing required field: requiredField' },
        { status: 400 }
      )
    }

    // 6. Verify Foreign Keys (if applicable)
    if (foreignKeyId) {
      const { data: foreignRecord } = await supabase
        .from('foreign_table')
        .select('account_id')
        .eq('id', foreignKeyId)
        .single()

      if (!foreignRecord || foreignRecord.account_id !== user.account_id) {
        return NextResponse.json({ error: 'Invalid foreign key' }, { status: 404 })
      }
    }

    // 7. Prepare Insert Data (ALWAYS include account_id)
    const insertData = {
      account_id: user.account_id, // REQUIRED
      field1,
      field2,
      requiredField,
      created_at: new Date().toISOString(), // If not auto-generated
    }

    // 8. Insert Record
    const { data: newRecord, error } = await supabase
      .from('table_name')
      .insert(insertData)
      .select('*, relation:related_table(*)') // Include relations
      .single()

    // 9. Error Handling
    if (error) {
      console.error('Error creating [resource]:', error)
      return NextResponse.json({ error: 'Failed to create [resource]' }, { status: 500 })
    }

    // 10. Return Response (consistent format)
    return NextResponse.json({ success: true, [resource]: newRecord }, { status: 201 })
  } catch (error: unknown) {
    console.error('Unexpected error in POST /api/[resource]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### Standard PATCH Handler Pattern

```typescript
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1-3. Same as GET/POST (Auth, Supabase, Account ID)
    // ... (same pattern)

    // 4. Verify Record Exists and Belongs to Account
    const { data: existingRecord } = await supabase
      .from('table_name')
      .select('account_id')
      .eq('id', params.id)
      .single()

    if (!existingRecord || existingRecord.account_id !== user.account_id) {
      return NextResponse.json({ error: '[Resource] not found' }, { status: 404 })
    }

    // 5. Parse Update Data
    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    
    // Only include fields that are provided
    if (body.field1 !== undefined) updateData.field1 = body.field1
    if (body.field2 !== undefined) updateData.field2 = body.field2

    // 6. Update Record
    const { data: updatedRecord, error } = await supabase
      .from('table_name')
      .update(updateData)
      .eq('id', params.id)
      .select('*, relation:related_table(*)')
      .single()

    // 7. Error Handling & Response
    if (error) {
      console.error('Error updating [resource]:', error)
      return NextResponse.json({ error: 'Failed to update [resource]' }, { status: 500 })
    }

    return NextResponse.json({ success: true, [resource]: updatedRecord })
  } catch (error: unknown) {
    console.error('Unexpected error in PATCH /api/[resource]/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### Standard DELETE Handler Pattern

```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1-3. Same as GET/POST (Auth, Supabase, Account ID)
    // ... (same pattern)

    // 4. Verify Record Exists and Belongs to Account
    const { data: existingRecord } = await supabase
      .from('table_name')
      .select('account_id')
      .eq('id', params.id)
      .single()

    if (!existingRecord || existingRecord.account_id !== user.account_id) {
      return NextResponse.json({ error: '[Resource] not found' }, { status: 404 })
    }

    // 5. Delete Record
    const { error } = await supabase
      .from('table_name')
      .delete()
      .eq('id', params.id)

    // 6. Error Handling & Response
    if (error) {
      console.error('Error deleting [resource]:', error)
      return NextResponse.json({ error: 'Failed to delete [resource]' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '[Resource] deleted successfully' })
  } catch (error: unknown) {
    console.error('Unexpected error in DELETE /api/[resource]/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### Admin-Only Endpoint Pattern

```typescript
// After getting user account_id, check role:
const { data: currentUser } = await supabase
  .from('users')
  .select('role, account_id')
  .eq('id', auth.user.id)
  .single()

if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## MCP Tool Implementation Standards

### File Location

**File**: `lib/mcp/tools/crm-tools.ts`

### Tool Schema Pattern

```typescript
{
  name: 'tool_name', // snake_case, descriptive
  description: 'Clear description of what the tool does. Use this when the user says "[example voice command]"',
  inputSchema: {
    type: 'object',
    properties: {
      requiredParam: {
        type: 'string',
        description: 'Clear description of parameter',
      },
      optionalParam: {
        type: 'string',
        description: 'Clear description (optional)',
      },
      dateParam: {
        type: 'string',
        description: 'ISO 8601 date string or relative date (e.g., "today", "tomorrow")',
      },
      idParam: {
        type: 'string',
        description: 'UUID of the [resource]',
      },
    },
    required: ['requiredParam'], // Only truly required params
  },
}
```

### Tool Handler Pattern

```typescript
case 'tool_name': {
  const { requiredParam, optionalParam } = args as {
    requiredParam: string
    optionalParam?: string
  }

  // 1. Validation
  if (!requiredParam) {
    return { error: 'Missing required parameter: requiredParam' }
  }

  // 2. Get Supabase Client (service role for MCP)
  const supabase = getSupabaseClient()
  const accountId = getAccountId()

  // 3. Query/Operation (ALWAYS filter by account_id)
  const { data, error } = await supabase
    .from('table_name')
    .select('*, relation:related_table(*)')
    .eq('account_id', accountId)
    // ... additional filters

  // 4. Error Handling
  if (error) {
    console.error('Error in tool_name:', error)
    return { error: `Failed to [operation]: ${error.message}` }
  }

  // 5. Return Consistent Format
  return {
    success: true,
    [resource]: data,
    count: data?.length || 0,
    message: 'Success message for voice response',
  }
}
```

### API Call Pattern (When Calling REST Endpoints)

```typescript
// When MCP tool needs to call a REST API endpoint:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const apiUrl = `${supabaseUrl.replace('/rest/v1', '')}/api/[endpoint-path]`
const response = await fetch(apiUrl, {
  method: 'GET', // or POST, PATCH, DELETE
  headers: {
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  },
  body: method !== 'GET' ? JSON.stringify(requestBody) : undefined,
})

const data = await response.json()

if (!response.ok) {
  return { error: data.error || 'API call failed' }
}

return { success: true, ...data }
```

---

## Voice-Command Tool Implementation Standards

### File Location

**File**: `supabase/functions/voice-command/index.ts`

### Tool Schema Pattern (OpenAI Function Calling)

```typescript
tool_name: {
  type: 'function',
  function: {
    name: 'tool_name', // Must match handler name
    description: 'Clear description. Use this when the user says "[example voice command]" or "[another example]"',
    parameters: {
      type: 'object',
      properties: {
        requiredParam: {
          type: 'string',
          description: 'Clear description of parameter',
        },
        optionalParam: {
          type: 'string',
          description: 'Clear description (optional)',
        },
        dateParam: {
          type: 'string',
          description: 'Relative date (e.g., "today", "tomorrow", "next week") or ISO 8601 date',
        },
        idParam: {
          type: 'string',
          description: 'UUID of the [resource] or name to search for',
        },
      },
      required: ['requiredParam'], // Only truly required params
    },
  },
}
```

### Tool Execution Pattern

```typescript
else if (functionName === 'tool_name') {
  // 1. Resolve Context IDs (if applicable)
  let resourceId = resolveContextId(functionArgs.resourceId, context, 'resource')
  
  // 2. Name Resolution (if name provided instead of ID)
  if (!resourceId && functionArgs.resourceName) {
    resourceId = await findResourceByName(supabase, accountId, functionArgs.resourceName)
    if (!resourceId) {
      response.error = `[Resource] "${functionArgs.resourceName}" not found.`
      continue
    }
  }

  // 3. Date Parsing (if applicable)
  let dateStr: string | null = null
  if (functionArgs.date) {
    dateStr = parseRelativeDate(functionArgs.date)
  }

  // 4. Build Query or API Call
  // Option A: Direct Supabase Query
  let query = supabase
    .from('table_name')
    .select('*, relation:related_table(*)')
    .eq('account_id', accountId)

  if (functionArgs.status) query = query.eq('status', functionArgs.status)
  if (dateStr) {
    const start = new Date(dateStr)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dateStr)
    end.setHours(23, 59, 59, 999)
    query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
  }

  const { data, error, count } = await query

  // Option B: Call REST API Endpoint
  // const apiUrl = getApiUrl('/api/[endpoint]')
  // const apiRes = await fetch(apiUrl, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${serviceRoleKey}`,
  //   },
  // })
  // const apiData = await apiRes.json()

  // 5. Error Handling
  if (error) {
    response.error = `Failed to [operation]: ${error.message}`
  } else {
    // 6. Format Response for Voice
    response[resource] = data || []
    response[resource]Count = count || 0
    response.formatted = formatForVoice(data || [], 'resource')
    
    // 7. Update Context (if applicable)
    if (data && data.length > 0) {
      context.lastResourceId = data[0].id
    }
  }
}
```

### Helper Functions Pattern

```typescript
// Helper function for API URL construction
function getApiUrl(path: string): string {
  const baseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')!.replace('/rest/v1', '')
  return `${baseUrl}/api${path}`
}

// Helper function for date parsing (use existing lib/voice-date-parser.ts)
// Import or duplicate parseRelativeDate function

// Helper function for name resolution
async function findResourceByName(
  supabase: any,
  accountId: string,
  name: string
): Promise<string | null> {
  const { data } = await supabase
    .from('resources')
    .select('id')
    .eq('account_id', accountId)
    .or(`name.ilike.%${name}%,first_name.ilike.%${name}%,last_name.ilike.%${name}%`)
    .limit(1)
    .single()
  
  return data?.id || null
}
```

---

## Naming Conventions

### API Routes

- **File names**: `route.ts` (always)
- **Directory names**: `kebab-case` (e.g., `job-photos`, `call-logs`)
- **Nested routes**: `[id]/route.ts`, `[id]/status/route.ts`
- **HTTP methods**: `GET`, `POST`, `PATCH`, `DELETE` (exported functions)

### MCP Tools

- **Tool names**: `snake_case` (e.g., `create_job`, `list_contacts`)
- **Descriptive**: `get_tech_location` not `get_location`
- **Action verb**: `create_`, `list_`, `get_`, `update_`, `delete_`, `send_`, `assign_`

### Voice Tools

- **Tool names**: `snake_case` (MUST match MCP tool name)
- **Same naming as MCP tools** (1:1 mapping)

### Database Tables

- **Table names**: `snake_case` (e.g., `job_materials`, `contact_tags`)
- **Column names**: `snake_case` (e.g., `account_id`, `created_at`)

### Variables

- **TypeScript**: `camelCase` (e.g., `accountId`, `createdAt`)
- **Database columns**: `snake_case` (e.g., `account_id`, `created_at`)

---

## File Structure Standards

### API Route File Structure

```
app/api/
├── [resource]/
│   ├── route.ts                    # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts                # GET (get), PATCH (update), DELETE (delete)
│       ├── status/route.ts         # PATCH (update status)
│       ├── assign/route.ts         # PATCH (assign)
│       └── [nested-resource]/
│           └── route.ts            # Nested resources
```

### Examples:

```
app/api/
├── jobs/
│   ├── route.ts                    # GET /api/jobs, POST /api/jobs
│   ├── [id]/
│   │   ├── route.ts                # GET /api/jobs/[id], PATCH /api/jobs/[id]
│   │   ├── status/route.ts         # PATCH /api/jobs/[id]/status
│   │   ├── assign/route.ts         # PATCH /api/jobs/[id]/assign
│   │   ├── location/route.ts       # POST /api/jobs/[id]/location
│   │   └── upload-photo/route.ts   # POST /api/jobs/[id]/upload-photo
│   └── bulk/route.ts               # POST /api/jobs/bulk
├── contacts/
│   ├── route.ts
│   ├── [id]/
│   │   ├── route.ts
│   │   ├── notes/route.ts
│   │   └── tags/route.ts
│   └── bulk/route.ts
```

---

## Error Handling Standards

### Error Response Format (Consistent Across All APIs)

```typescript
// Success Response
{
  success: true,
  [resource]: data,
  total?: number,
  limit?: number,
  offset?: number,
}

// Error Response
{
  error: "User-friendly error message",
  // Optional: details in development
  details?: "Technical details (dev only)"
}
```

### HTTP Status Codes (Standard)

- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors, missing required fields)
- `401` - Unauthorized (no authentication)
- `403` - Forbidden (authenticated but insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate, constraint violation)
- `500` - Internal Server Error (unexpected errors)

### Error Logging Pattern

```typescript
// Always log errors with context
console.error('Error [operation] [resource]:', error)
// Include: operation, resource, error object
```

---

## Response Format Standards

### List Response Format

```typescript
{
  [resource]: Array<ResourceType>,
  total: number,        // Total count (with count: 'exact')
  limit: number,        // Requested limit
  offset: number,       // Requested offset
}
```

### Single Resource Response Format

```typescript
{
  success: true,
  [resource]: ResourceType,
}
```

### Create Response Format

```typescript
{
  success: true,
  [resource]: CreatedResourceType,
}
```

### Update Response Format

```typescript
{
  success: true,
  [resource]: UpdatedResourceType,
}
```

### Delete Response Format

```typescript
{
  success: true,
  message: "[Resource] deleted successfully",
}
```

---

## Authentication & Authorization Standards

### Required Pattern (Every API Route)

```typescript
// 1. Get authenticated session
const auth = await getAuthenticatedSession(request)
if (!auth) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// 2. Get account_id (REQUIRED)
const { data: user } = await supabase
  .from('users')
  .select('account_id')
  .eq('id', auth.user.id)
  .single()

if (!user) {
  return NextResponse.json({ error: 'User not found' }, { status: 404 })
}

// 3. ALWAYS filter by account_id
.eq('account_id', user.account_id)
```

### Admin-Only Endpoints Pattern

```typescript
// After getting user, check role
const { data: currentUser } = await supabase
  .from('users')
  .select('role, account_id')
  .eq('id', auth.user.id)
  .single()

if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Bearer Token Support (Required)

```typescript
// Support BOTH cookie-based AND Bearer token auth
const authHeader = request.headers.get('authorization')
let supabase: ReturnType<typeof createServerClient>

if (authHeader?.startsWith('Bearer ')) {
  // Bearer token path
  const { createClient } = await import('@supabase/supabase-js')
  const token = authHeader.substring(7)
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )
} else {
  // Cookie-based path (standard pattern)
  // ... cookie setup
}
```

---

## Database Query Standards

### Required: Account Isolation

```typescript
// ALWAYS filter by account_id (RLS is backup, not primary)
.eq('account_id', user.account_id)
```

### Required: Proper Joins

```typescript
// Use Supabase joins for relations
.select('*, contact:contacts(*), tech:users!tech_assigned_id(*)')
```

### Required: Pagination

```typescript
// Always support pagination for list endpoints
const limit = parseInt(searchParams.get('limit') || '50')
const offset = parseInt(searchParams.get('offset') || '0')

query = query
  .range(offset, offset + limit - 1)
  .order('created_at', { ascending: false })
```

### Required: Count Support

```typescript
// Include count for pagination
const { data, error, count } = await query

// Return count in response
return NextResponse.json({
  [resource]: data || [],
  total: count || 0,
  limit,
  offset,
})
```

### Required: Error Handling

```typescript
// Always check for errors
if (error) {
  console.error('Error [operation]:', error)
  return NextResponse.json({ error: 'Failed to [operation]' }, { status: 500 })
}
```

---

## Progress Tracking Standards

### Progress File Format

**File**: `shared-docs/WAVE[N]_PROGRESS.md`

```markdown
# Wave [N] Progress - [Wave Name]

**Status**: In Progress / Complete
**Last Updated**: [timestamp]

## Agent [N.X] Progress

### Completed APIs/Tools:
- ✅ `GET /api/resource` - Description
- ✅ `POST /api/resource` - Description
- ✅ `mcp_tool_name` - Description

### In Progress:
- 🚧 `PATCH /api/resource/[id]` - Description

### Blocked:
- ❌ `DELETE /api/resource/[id]` - Reason

## Notes:
- [Any important notes]
```

### Update Frequency

- **After each API/tool completion**: Update immediately
- **On blockers**: Update immediately
- **Hourly**: Update status even if no changes

### Coordination Mechanism

- **Read progress files**: Before starting work, read relevant progress files
- **Update progress files**: After completing work, update immediately
- **File locking**: Use comments in progress files to indicate "working on X"

---

## Testing Requirements

### Required Tests Per API Endpoint

1. **Authentication Test**: Unauthorized request returns 401
2. **Authorization Test**: Admin-only endpoints return 403 for non-admins
3. **Validation Test**: Missing required fields return 400
4. **Success Test**: Valid request returns 200/201 with correct data
5. **Account Isolation Test**: Cannot access other account's data
6. **Error Handling Test**: Invalid IDs return 404

### Test File Location

```
app/api/[resource]/__tests__/
├── route.test.ts
└── [id]/route.test.ts
```

### Test Pattern

```typescript
import { describe, it, expect } from '@jest/globals'

describe('GET /api/[resource]', () => {
  it('should return 401 when unauthorized', async () => {
    // Test implementation
  })
  
  it('should return list of resources', async () => {
    // Test implementation
  })
  
  it('should filter by account_id', async () => {
    // Test implementation
  })
})
```

---

## Coordination Mechanisms

### Shared Progress Files

**Location**: `shared-docs/`

**Files**:
- `WAVE1_PROGRESS.md` - Core API progress
- `WAVE2_PROGRESS.md` - Sales/Marketing API progress
- `WAVE3_PROGRESS.md` - Operations API progress
- `WAVE4_PROGRESS.md` - Management API progress
- `WAVE5_PROGRESS.md` - Enterprise API progress
- `WAVE6_PROGRESS.md` - Core MCP tools progress
- `WAVE7_PROGRESS.md` - Enterprise MCP tools progress

### Master Coordination File

**File**: `shared-docs/SWARM_COORDINATION.md`

**Contents**:
- Overall progress
- Blockers
- Dependencies
- Agent assignments
- Success criteria

### API Inventory File

**File**: `shared-docs/API_INVENTORY.md`

**Contents**:
- Complete list of all APIs
- Status (exists, needs enhancement, missing)
- File location
- MCP tool mapping

### MCP Tool Inventory File

**File**: `shared-docs/MCP_TOOL_INVENTORY.md`

**Contents**:
- Complete list of all MCP tools
- Status (exists, needs implementation)
- API mapping
- Handler location

---

## Critical Rules (MUST FOLLOW)

### 1. Account Isolation (CRITICAL)

```typescript
// ALWAYS filter by account_id - RLS is backup, not primary
.eq('account_id', user.account_id)
```

### 2. Authentication (CRITICAL)

```typescript
// ALWAYS check authentication first
const auth = await getAuthenticatedSession(request)
if (!auth) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 3. Error Handling (CRITICAL)

```typescript
// ALWAYS wrap in try-catch
try {
  // ... operation
} catch (error: unknown) {
  console.error('Unexpected error:', error)
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
```

### 4. Response Format (CRITICAL)

```typescript
// ALWAYS use consistent response format
// Success: { success: true, [resource]: data }
// Error: { error: "message" }
```

### 5. Progress Updates (CRITICAL)

```typescript
// ALWAYS update progress file after completing work
// Read progress files before starting work
```

### 6. Naming Consistency (CRITICAL)

```typescript
// API routes: kebab-case directories
// MCP tools: snake_case names
// Voice tools: MUST match MCP tool names exactly
```

### 7. Bearer Token Support (CRITICAL)

```typescript
// ALWAYS support both cookie-based AND Bearer token auth
// Check authorization header first, fallback to cookies
```

### 8. Foreign Key Validation (CRITICAL)

```typescript
// ALWAYS verify foreign keys belong to same account
// Before inserting/updating with foreign key, verify account_id matches
```

---

## Validation Checklist (Per API/Tool)

Before marking complete, verify:

- [ ] Authentication implemented correctly
- [ ] Account isolation enforced (account_id filter)
- [ ] Bearer token support added
- [ ] Error handling implemented (try-catch, proper status codes)
- [ ] Response format consistent
- [ ] Pagination supported (for list endpoints)
- [ ] Count included (for list endpoints)
- [ ] Foreign keys validated (if applicable)
- [ ] Admin checks added (if admin-only)
- [ ] Progress file updated
- [ ] File follows naming conventions
- [ ] Imports in correct order
- [ ] No linting errors
- [ ] MCP tool created (if API endpoint)
- [ ] Voice tool created (if API endpoint)
- [ ] Tool names match exactly (MCP = Voice)

---

## Common Mistakes to Avoid

### ❌ DON'T:

1. **Skip account_id filtering** - Always filter by account_id
2. **Use different response formats** - Use standard format
3. **Skip error handling** - Always wrap in try-catch
4. **Skip Bearer token support** - Support both auth methods
5. **Use inconsistent naming** - Follow naming conventions exactly
6. **Skip progress updates** - Update progress files immediately
7. **Skip foreign key validation** - Always verify account_id matches
8. **Skip pagination** - Always support limit/offset
9. **Skip count** - Always include total count
10. **Mismatch tool names** - MCP and Voice tool names MUST match

### ✅ DO:

1. **Follow patterns exactly** - Copy from existing working code
2. **Update progress files** - After every completion
3. **Read progress files** - Before starting work
4. **Use helper functions** - For common operations (date parsing, name resolution)
5. **Validate everything** - Required fields, foreign keys, permissions
6. **Test account isolation** - Verify can't access other accounts
7. **Use consistent error messages** - User-friendly, clear
8. **Include relations in selects** - Use Supabase joins
9. **Support both auth methods** - Cookies and Bearer tokens
10. **Match tool names exactly** - MCP = Voice tool names

---

## Quick Reference

### API Route Template

```typescript
import { NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth-helper'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedSession(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    // Supabase client setup (Bearer token OR cookies)
    // Get account_id
    // Build query with .eq('account_id', user.account_id)
    // Execute and return
  } catch (error: unknown) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### MCP Tool Template

```typescript
{
  name: 'tool_name',
  description: 'Description. Use when user says "[example]"',
  inputSchema: {
    type: 'object',
    properties: { /* ... */ },
    required: [/* ... */]
  }
}

// Handler:
case 'tool_name': {
  const { param } = args as { param: string }
  const supabase = getSupabaseClient()
  const accountId = getAccountId()
  // Query with .eq('account_id', accountId)
  // Return consistent format
}
```

### Voice Tool Template

```typescript
tool_name: {
  type: 'function',
  function: {
    name: 'tool_name', // MUST match MCP tool name
    description: 'Description. Use when user says "[example]"',
    parameters: { /* ... */ }
  }
}

// Execution:
else if (functionName === 'tool_name') {
  // Resolve context, parse dates, query, format response
}
```

---

**END OF STANDARDS DOCUMENT**

**All agents MUST read and follow this document exactly. Deviations will require refactoring.**

