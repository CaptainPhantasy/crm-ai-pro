# API Contracts Reference

## Contacts API

### GET /api/contacts
**Query Params:**
- `search` (optional): string
- `limit` (optional): number (default: 50)
- `offset` (optional): number (default: 0)

**Response:**
```json
{
  "contacts": Contact[],
  "total": number,
  "limit": number,
  "offset": number
}
```

### POST /api/contacts
**Body:**
```json
{
  "email": string (required),
  "phone": string (optional),
  "firstName": string (required),
  "lastName": string (optional),
  "address": string (optional)
}
```

**Response:**
```json
{
  "success": true,
  "contact": Contact
}
```

### GET /api/contacts/[id]
**Response:**
```json
{
  "contact": Contact
}
```

### PATCH /api/contacts/[id]
**Body:** (all fields optional)
```json
{
  "email": string,
  "phone": string,
  "firstName": string,
  "lastName": string,
  "address": string
}
```

## Users API

### GET /api/users
**Query Params:**
- `role` (optional): string - Filter by role (e.g., 'tech')

**Response:**
```json
{
  "users": User[]
}
```

## Jobs API

### GET /api/jobs
**Query Params:**
- `status` (optional): string
- `techId` (optional): uuid
- `limit` (optional): number
- `offset` (optional): number

**Response:**
```json
{
  "jobs": Job[],
  "total": number,
  "limit": number,
  "offset": number
}
```

### POST /api/jobs
**Body:**
```json
{
  "contactId": uuid (required),
  "description": string (required),
  "scheduledStart": string (optional, ISO 8601),
  "scheduledEnd": string (optional, ISO 8601),
  "status": string (optional),
  "techAssignedId": uuid (optional),
  "conversationId": uuid (optional)
}
```

### GET /api/jobs/[id]
**Response:**
```json
{
  "job": Job
}
```

## Conversations API

### GET /api/conversations
**Response:**
```json
{
  "conversations": Conversation[]
}
```

### POST /api/conversations
**Body:**
```json
{
  "contactId": uuid (required),
  "subject": string (optional),
  "channel": string (optional, default: "email")
}
```

**Response:**
```json
{
  "success": true,
  "conversation": Conversation,
  "existing": boolean
}
```

### PATCH /api/conversations/[id]
**Body:**
```json
{
  "status": "open" | "closed" | "snoozed" (required)
}
```

**Response:**
```json
{
  "success": true,
  "conversation": Conversation
}
```

