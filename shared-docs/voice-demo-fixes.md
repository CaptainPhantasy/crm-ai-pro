# Voice Demo Fixes Needed

## Current Issues

1. **Authentication Problem**: Supabase edge functions validate Authorization header as JWT before code runs
   - Service role key from .env.local is not a valid JWT
   - Edge function rejects with "Invalid JWT" before our code executes

2. **Account Loading**: Frontend can't reliably get account ID
   - RLS policies may be blocking anonymous queries
   - Need fallback to hardcoded demo account

## Solutions

### Option 1: Use Anon Key with User Session (Recommended)
- Frontend gets user session token
- Pass token to API route
- API route uses anon key + token to call edge function
- Edge function validates token and uses service role for DB operations

### Option 2: Bypass Edge Function Auth
- Make edge function public (no auth required)
- Validate accountId in function code
- Use service role key directly for DB operations

### Option 3: Use Service Role Key as JWT
- Generate proper JWT from service role key
- Use that JWT to authenticate edge function calls

## Next Steps

1. Update edge function to accept requests without JWT validation
2. Add accountId validation in edge function
3. Test with actual voice commands
4. Verify tool calls execute correctly

