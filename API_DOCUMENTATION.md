# CRM-AI Pro API Documentation

## Base URL
```
http://localhost:8473/api
```

## Environment Variables Required

Add these to your `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (Required for email)
RESEND_API_KEY=your-resend-key

# OpenAI (Required for AI features)
OPENAI_API_KEY=your-openai-key

# Eleven Labs (Required for voice agent)
ELEVEN_LABS_WEBHOOK_SECRET=your-webhook-secret

# Stripe (Optional, for payments)
STRIPE_SECRET_KEY=your-stripe-key
```

## Authentication
All endpoints require authentication via Supabase session cookies. The webhook endpoint uses service role key for system-level access.

---

## 1. Jobs API

### Create Job
**POST** `/api/jobs`

**Request Body:**
```json
{
  "conversationId": "uuid",
  "contactId": "uuid",
  "description": "string",
  "scheduledStart": "ISO 8601 datetime",
  "scheduledEnd": "ISO 8601 datetime",
  "techAssignedId": "uuid (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "uuid",
    "status": "lead",
    "created_at": "ISO 8601 datetime",
    ...
  }
}
```

### Update Job Status
**PATCH** `/api/jobs/[id]/status`

**Request Body:**
```json
{
  "status": "scheduled|en_route|in_progress|completed|invoiced|paid"
}
```

**Response:**
```json
{
  "success": true,
  "job": { ... }
}
```

### Assign Technician
**PATCH** `/api/jobs/[id]/assign`

**Request Body:**
```json
{
  "techAssignedId": "uuid"
}
```

### List Jobs
**GET** `/api/jobs?status=scheduled&techId=uuid&limit=50&offset=0`

**Query Parameters:**
- `status` (optional): Filter by status
- `techId` (optional): Filter by assigned technician
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "jobs": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### Get Job Details
**GET** `/api/jobs/[id]`

**Response:**
```json
{
  "job": {
    "id": "uuid",
    "status": "scheduled",
    "contact": { ... },
    "conversation": { ... },
    "tech": { ... },
    ...
  }
}
```

---

## 2. Contacts API

### Create Contact
**POST** `/api/contacts`

**Request Body:**
```json
{
  "email": "string",
  "phone": "string (optional)",
  "firstName": "string",
  "lastName": "string",
  "address": "string (optional)"
}
```

### Update Contact
**PATCH** `/api/contacts/[id]`

**Request Body:** (all fields optional)
```json
{
  "email": "string",
  "phone": "string",
  "firstName": "string",
  "lastName": "string",
  "address": "string"
}
```

### List Contacts
**GET** `/api/contacts?search=string&limit=50&offset=0`

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

### Get Contact Details
**GET** `/api/contacts/[id]`

---

## 3. Tech Dashboard API

### Get Tech's Jobs
**GET** `/api/tech/jobs?status=scheduled&date=YYYY-MM-DD`

**Query Parameters:**
- `status` (optional): Filter by status
- `date` (optional): Filter by date (default: today)

**Response:**
```json
{
  "jobs": [...],
  "stats": {
    "today": 5,
    "completed": 2,
    "inProgress": 1,
    "revenue": 890
  }
}
```

### Update Job Status (Tech)
**PATCH** `/api/tech/jobs/[id]/status`

**Request Body:**
```json
{
  "status": "en_route|in_progress|completed",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "job": { ... },
  "emailSent": true  // If status change triggers email
}
```

---

## 4. Eleven Labs Webhook Integration

### Webhook Endpoint
**POST** `/api/webhooks/elevenlabs`

**Headers:**
```
X-ElevenLabs-Signature: string (HMAC SHA256 signature)
Content-Type: application/json
```

**Request Body:** (Eleven Labs webhook payload)
```json
{
  "event": "conversation_item_input_audio_transcription_completed",
  "conversation_id": "string",
  "conversation_item_id": "string",
  "transcription": "string",
  "metadata": { ... }
}
```

**Signature Verification:**
The webhook verifies the signature using HMAC SHA256. Set `ELEVEN_LABS_WEBHOOK_SECRET` in your environment variables.

**Supported Voice Commands:**

1. **Create Job**
   - Pattern: "Create a job for [name], [description], [time]"
   - Examples:
     - "Create a job for John Smith, plumbing repair, tomorrow at 2pm"
     - "Create job for Sarah Johnson, water heater installation, today at 3pm"
   - Response: Confirms job creation with job ID

2. **Update Job Status**
   - Pattern: "Mark job [id] as [status]" or "Update job [id] to [status]"
   - Examples:
     - "Mark job 123 as completed"
     - "Update job 456 to in progress"
     - "Set job 789 to en route"
   - Valid statuses: completed, done, finished, in progress, en route, scheduled
   - Response: Confirms status update

3. **Get Jobs**
   - Pattern: "What jobs do I have [filter]?"
   - Examples:
     - "What jobs do I have today?"
     - "Show me scheduled jobs"
     - "List completed jobs"
   - Response: Returns count and list of jobs

4. **Search Contact**
   - Pattern: "Find contact [name]" or "Search for [name]"
   - Examples:
     - "Find contact John Smith"
     - "Search for Sarah"
   - Response: Returns matching contacts

5. **Send Message**
   - Pattern: "Send message to [name], [message]"
   - Examples:
     - "Send message to John Smith, we'll be there in 30 minutes"
     - "Message Sarah Johnson, your appointment is confirmed"
   - Response: Confirms message sent

**Response Format:**
```json
{
  "success": true,
  "action": "job_created|update_job_status|get_jobs|search_contact|send_message",
  "data": {
    // Action-specific data
  },
  "response": "Text response to speak back to user",
  "transcription": "Original transcription"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "response": "User-friendly error message to speak"
}
```

**Webhook Configuration:**
1. Set `ELEVEN_LABS_WEBHOOK_SECRET` in your `.env.local`
2. Configure Eleven Labs webhook URL: `https://your-domain.com/api/webhooks/elevenlabs`
3. Enable signature verification in Eleven Labs dashboard

---

## 5. Messages API (Existing)

### Send Message
**POST** `/api/send-message`

**Request Body:**
```json
{
  "conversationId": "uuid",
  "message": "string",
  "subject": "string (optional)"
}
```

### AI Draft
**POST** `/api/ai/draft`

**Request Body:**
```json
{
  "conversationId": "uuid"
}
```

**Response:** Streaming text response

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
- Standard endpoints: 100 requests/minute
- Webhook endpoints: 1000 requests/minute

---

## Webhook Security
Eleven Labs webhooks must include signature verification:
- Header: `X-ElevenLabs-Signature`
- Verify using webhook secret from environment variables

