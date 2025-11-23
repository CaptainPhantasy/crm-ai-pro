# Database Seeding & Photo Upload Setup

## 🗄️ Database Seeding

### Option 1: Via UI (Recommended)
1. Navigate to the **Jobs** page
2. Click the **"Seed Test Data"** button
3. Confirm the action
4. The database will be populated with:
   - 5 test contacts (John Smith, Sarah Johnson, Mike Davis, Emily Wilson, David Brown)
   - 3 conversations
   - 5 jobs (various statuses: scheduled, en_route, in_progress, completed)
   - 3 test messages

### Option 2: Via API
```bash
curl -X POST http://localhost:8473/api/seed
```

## 📸 Photo Upload Setup

### 1. Create Supabase Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the sidebar
4. Click **"New bucket"**
5. Configure:
   - **Name**: `job-photos`
   - **Public bucket**: ✅ Yes (or No if you want private)
   - **File size limit**: 10MB (or your preference)
   - **Allowed MIME types**: `image/*` (optional, for extra security)

### 2. Set Up Storage Policies

If the bucket is **private**, you'll need to set up RLS policies:

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'job-photos');

-- Allow users to read their own photos
CREATE POLICY "Allow users to read photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'job-photos');
```

If the bucket is **public**, photos will be accessible to anyone with the URL.

### 3. Test Photo Upload

1. Go to **Tech Dashboard**
2. Click **"Upload Photo"** button in the header (will prompt for Job ID)
   OR
3. Click the **"Photo"** button on any job card
4. Select an image file
5. The photo will be uploaded to Supabase Storage
6. You'll receive a confirmation with the photo URL

### 4. Photo Storage Structure

Photos are stored in the following structure:
```
job-photos/
  └── {jobId}/
      └── {timestamp}-{filename}
```

Example:
```
job-photos/
  └── abc123def456/
      └── 1703123456789-photo.jpg
```

## 🔧 Troubleshooting

### "Failed to upload photo" Error
- Check that the `job-photos` bucket exists in Supabase
- Verify storage policies if using a private bucket
- Check file size (max 10MB)
- Ensure file is an image (jpg, png, gif, etc.)

### "Job not found or not assigned to you" Error
- Make sure you're logged in as a tech user
- Verify the job is assigned to your user ID
- Check that the job exists in the database

### Storage Upload Errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Check Supabase Storage quota/limits
- Ensure bucket name matches exactly: `job-photos`

## 📝 API Endpoint

**POST** `/api/jobs/[id]/upload-photo`

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (File object)

**Response:**
```json
{
  "success": true,
  "url": "https://...supabase.co/storage/v1/object/public/job-photos/...",
  "filename": "jobId/timestamp-filename.jpg"
}
```

