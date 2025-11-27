# Dispatch Utilities

This directory contains utilities for the Dispatch Map Dashboard.

## Modules

### geocoding.ts

Geocoding utilities for converting addresses to lat/lng coordinates.

**Key Functions:**

```typescript
// Geocode a single address
import { geocodeAddress } from '@/lib/dispatch/geocoding'
const result = await geocodeAddress('123 Main St, Indianapolis, IN')
// Returns: { lat: 39.7690, lng: -86.1577, accuracy: 'exact', formattedAddress: '...' }

// Batch geocode multiple jobs
import { batchGeocodeJobs } from '@/lib/dispatch/geocoding'
const result = await batchGeocodeJobs(['job-id-1', 'job-id-2'])
// Returns: { success: [...], failed: [...], results: Map, errors: Map }

// Update a single job's location
import { updateJobLocation } from '@/lib/dispatch/geocoding'
const success = await updateJobLocation('job-id')

// Get jobs that need geocoding
import { getJobsNeedingGeocode } from '@/lib/dispatch/geocoding'
const jobIds = await getJobsNeedingGeocode(100) // limit to 100
```

**Features:**
- Cache-first strategy (checks `geocode_cache` table before API call)
- Automatic retry with exponential backoff (3 attempts)
- Rate limiting (5 requests/second to respect Google API limits)
- Comprehensive error handling
- TypeScript support

**Requirements:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`
- Database migration applied (`supabase/add-geocoding-support.sql`)

**Documentation:**
See `/shared-docs/geocoding-implementation-guide.md` for full details.

**Scripts:**
- `npm run test:geocoding` - Run test suite
- `npm run geocode-jobs` - Batch geocode existing jobs
- `npm run geocode-jobs -- --help` - Show all options

## Future Modules

This directory will contain additional dispatch utilities as Phase 3 development continues:

- **distance.ts** - Haversine distance calculations between coordinates
- **routing.ts** - Route optimization for tech assignments
- **eta.ts** - Estimated time of arrival calculations
- **geofencing.ts** - Service area boundary checks

---

*Last Updated: 2025-11-27*
*Agent 11: Geocoding Integration Specialist*
