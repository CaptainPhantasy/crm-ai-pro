# Database Fix Instructions

## What Happened
You accidentally ran SQL scripts from another project in the Supabase SQL Editor, which may have messed up the database schema.

## Quick Fix (Recommended)

### Option 1: Safe Fix (Non-Destructive)
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `supabase/FIX_DATABASE.sql`
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. **Review the script** (especially any DROP statements)
6. Click **Run**

This script will:
- ✅ Create missing tables (IF NOT EXISTS - safe)
- ✅ Add missing columns
- ✅ Fix RLS policies
- ✅ Ensure the 317 Plumber account exists
- ✅ **NOT delete existing data** (unless you uncomment DROP statements)

### Option 2: Complete Reset (Destructive - Use Only If Needed)
If Option 1 doesn't work, you may need to completely reset:

1. Open `supabase/FIX_DATABASE.sql`
2. Find the section that says:
   ```sql
   -- Uncomment these ONLY if you want to completely reset
   /*
   DROP TABLE IF EXISTS ...
   */
   ```
3. Uncomment those DROP statements (remove `/*` and `*/`)
4. Run the script
5. **WARNING: This will DELETE ALL DATA!**

## What Gets Fixed

The script will ensure:
- ✅ All 9 core tables exist with correct schema
- ✅ All required columns are present
- ✅ RLS policies are correctly applied
- ✅ Indexes are created
- ✅ Extensions (uuid-ossp, pgcrypto, vector) are enabled
- ✅ 317 Plumber account exists

## After Running the Fix

1. **Verify the fix worked**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
   Should show: accounts, contacts, conversations, jobs, messages, etc.

2. **Check account exists**:
   ```sql
   SELECT * FROM accounts WHERE slug = '317plumber';
   ```

3. **Re-seed test data** (if needed):
   - Go to http://localhost:3000/jobs
   - Click "Seed Test Data" button
   - Or run: `curl -X POST http://localhost:3000/api/seed`

## Files Created

- `supabase/FIX_DATABASE.sql` - Complete fix script (use this!)
- `scripts/fix-database-schema.ts` - TypeScript script (for reference)

## Need Help?

If the fix script doesn't work:
1. Check Supabase SQL Editor for error messages
2. Look for specific table/column errors
3. You may need to manually drop problematic tables first
4. Then re-run the fix script

## Prevention

To avoid this in the future:
- ✅ Always check which Supabase project you're in
- ✅ Review SQL scripts before running
- ✅ Use separate Supabase projects for different apps
- ✅ Keep a backup of your schema files

