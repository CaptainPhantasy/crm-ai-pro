# Database Setup Checklist for Phase 5

## Critical: Database Must Be Set Up Before Email Integration

The `handle-inbound-email` Edge Function **requires**:
1. ✅ `accounts` table exists
2. ✅ At least one account record exists
3. ✅ `contacts` table exists
4. ✅ `conversations` table exists
5. ✅ `messages` table exists
6. ✅ RLS policies applied

## SQL Scripts That Need to Be Run

### 1. Core Schema (REQUIRED)
**File**: `supabase/schema.sql`
**What it does**:
- Creates all core tables: `accounts`, `users`, `contacts`, `conversations`, `messages`, `jobs`, `knowledge_docs`
- Creates `llm_providers` table
- Creates `crmai_audit` table
- Sets up indexes

**How to run**:
```sql
-- Copy contents of supabase/schema.sql
-- Run in Supabase SQL Editor
```

### 2. RLS Policies (REQUIRED)
**File**: `supabase/rls-policies.sql`
**What it does**:
- Enables Row Level Security on all tables
- Creates policies for accounts, contacts, conversations, messages, jobs
- Ensures users can only access their account's data

**How to run**:
```sql
-- Copy contents of supabase/rls-policies.sql
-- Run in Supabase SQL Editor
```

### 3. Persona Config (RECOMMENDED)
**File**: `supabase/add-persona-config.sql`
**What it does**:
- Adds `persona_config` column to `accounts` table
- Needed for AI persona customization

**How to run**:
```sql
-- Copy contents of supabase/add-persona-config.sql
-- Run in Supabase SQL Editor
```

### 4. LLM Providers Seed (RECOMMENDED)
**File**: `supabase/seed-llm-providers.sql`
**What it does**:
- Seeds LLM provider configurations
- Needed for AI features

**How to run**:
```sql
-- Copy contents of supabase/seed-llm-providers.sql
-- Run in Supabase SQL Editor
```

### 5. RAG Function (OPTIONAL - for Phase 5.2)
**File**: `supabase/add-rag-function.sql`
**What it does**:
- Creates vector similarity search function
- Needed for knowledge base RAG

**How to run**:
```sql
-- Copy contents of supabase/add-rag-function.sql
-- Run in Supabase SQL Editor
```

## Quick Verification

### Check if Schema is Applied
Run this in Supabase SQL Editor:
```sql
-- Check if core tables exist
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('accounts', 'contacts', 'conversations', 'messages', 'jobs')
ORDER BY table_name;
```

**Expected**: Should return 5 rows (one for each table)

### Check if Account Exists
Run this in Supabase SQL Editor:
```sql
-- Check if at least one account exists
SELECT id, name, slug FROM accounts LIMIT 1;
```

**Expected**: Should return at least one account row

**If no account exists**, create one:
```sql
INSERT INTO accounts (name, slug) 
VALUES ('317 Plumber', '317plumber') 
RETURNING id;
```

### Check if RLS is Enabled
Run this in Supabase SQL Editor:
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('accounts', 'contacts', 'conversations', 'messages', 'jobs');
```

**Expected**: `rowsecurity` should be `true` for all tables

## Using the Migration Script

Alternatively, you can use the TypeScript migration script:

```bash
# Make sure .env.local has Supabase credentials
npx tsx scripts/apply-migrations.ts
```

This script will:
1. Apply schema updates
2. Apply RLS policies
3. Seed LLM providers

## Manual Steps in Supabase Dashboard

1. **Go to SQL Editor**: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. **Run scripts in order**:
   - `supabase/schema.sql`
   - `supabase/rls-policies.sql`
   - `supabase/add-persona-config.sql`
   - `supabase/seed-llm-providers.sql`
3. **Verify**: Run the verification queries above

## Critical for Email Integration

**The `handle-inbound-email` Edge Function will fail if**:
- ❌ No `accounts` table exists
- ❌ No account record exists (it does `SELECT id FROM accounts LIMIT 1`)

**Before testing inbound email, ensure**:
1. ✅ Schema is applied
2. ✅ At least one account exists
3. ✅ RLS policies are applied (for security)

## Next Steps After Database Setup

1. ✅ Verify schema is applied
2. ✅ Verify account exists
3. ✅ Add Resend API key to `.env.local`
4. ✅ Deploy `handle-inbound-email` Edge Function
5. ✅ Configure Resend webhook
6. ✅ Test inbound email

