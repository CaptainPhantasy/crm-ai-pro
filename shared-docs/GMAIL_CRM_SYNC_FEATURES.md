# Gmail CRM Sync - Comprehensive Integration

## Overview

This integration syncs emails from Gmail Workspace accounts and automatically extracts contact information to populate the CRM. Based on how modern CRMs like HubSpot, Salesforce, and Copper integrate with Gmail.

## Key Features

### 1. Email Synchronization
- **Sync from Gmail API**: Uses [Gmail API v1](https://developers.google.com/workspace/gmail/api/reference/rest) to fetch emails
- **Multiple Labels**: Syncs from INBOX, SENT, and custom labels
- **Date Range**: Sync emails from a specific date forward
- **Pagination**: Handles large email volumes with pagination

### 2. Contact Extraction & Auto-Creation
- **From Email Headers**: Extracts name and email from From/To/CC headers
- **From Email Signatures**: Parses email signatures for:
  - Full name
  - Phone number
  - Address
  - Company name
  - Job title
- **From Email Body**: Extracts phone numbers and addresses from email content
- **Auto-Create Contacts**: Automatically creates contacts in CRM from email addresses
- **Auto-Update Contacts**: Updates existing contacts with new information found in emails

### 3. Conversation Management
- **Thread Linking**: Links emails to conversations by thread ID
- **Message Storage**: Stores all emails as messages in the CRM
- **Thread Tracking**: Maintains email thread relationships
- **Contact Association**: Links conversations to contacts

### 4. Team/Salesperson Tracking
- **User Association**: Tracks which team member's Gmail account synced the email
- **Direction Detection**: Identifies inbound vs outbound emails
- **Sender Tracking**: Records who sent/received each email

## How It Works

### Email Sync Flow

1. **User Triggers Sync**
   - User clicks "Sync Emails" in integrations page
   - API endpoint: `POST /api/integrations/gmail/sync`

2. **Fetch Emails from Gmail**
   - Uses Gmail API `users.messages.list` to get message IDs
   - Uses Gmail API `users.messages.get` to fetch full message details
   - Parses email headers, body, and metadata

3. **Extract Contact Information**
   - Parses email headers (From, To, CC)
   - Extracts signature information
   - Parses email body for phone/address
   - Identifies company and title information

4. **Create/Update Contacts**
   - Checks if contact exists by email
   - Creates new contact if not found
   - Updates existing contact with new information
   - Links contact to account

5. **Create Conversations & Messages**
   - Creates or finds conversation by thread/subject
   - Links conversation to contact
   - Stores email as message record
   - Maintains thread relationships

## API Endpoints

### Sync Emails
```
POST /api/integrations/gmail/sync
Body: {
  syncFrom?: string,      // ISO date string (optional)
  maxMessages?: number,   // Default: 100
  labelIds?: string[]     // Default: ['INBOX', 'SENT']
}
Response: {
  success: true,
  stats: {
    messagesProcessed: number,
    contactsCreated: number,
    contactsUpdated: number,
    conversationsCreated: number,
    messagesCreated: number
  }
}
```

## Contact Extraction Logic

### From Email Headers
- **From**: Extracts sender name and email
- **To**: Extracts recipient emails
- **CC**: Extracts CC'd emails
- **Subject**: Used for conversation matching

### From Email Signature
Parses common signature patterns:
- Name: "John Smith" or "Smith, John"
- Phone: Various formats (US and international)
- Address: Street address patterns
- Company: "Company Name Inc" patterns
- Title: Job title patterns

### From Email Body
- Phone number extraction (regex patterns)
- Address extraction (street address patterns)
- Company name extraction

## Data Flow

```
Gmail Workspace
    ↓
Gmail API (users.messages.list/get)
    ↓
Parse Email (headers, body, signature)
    ↓
Extract Contact Info
    ↓
Create/Update Contact in CRM
    ↓
Create/Update Conversation
    ↓
Store Message Record
```

## Gmail API Usage

Based on [Gmail API Reference](https://developers.google.com/workspace/gmail/api/reference/rest):

- **users.messages.list**: List message IDs
- **users.messages.get**: Get full message with format='full'
- **Scopes Required**:
  - `gmail.readonly` - Read emails
  - `gmail.modify` - Access full message content
  - `gmail.send` - Send emails

## Benefits

1. **Automatic Contact Creation**: No manual data entry
2. **Complete Email History**: All emails stored in CRM
3. **Contact Enrichment**: Automatically updates contacts with new info
4. **Team Collaboration**: All team emails synced to shared CRM
5. **Email Threading**: Maintains conversation context
6. **Search & Analytics**: Full email history searchable in CRM

## Usage Example

```typescript
// Sync last 30 days of emails
const response = await fetch('/api/integrations/gmail/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    syncFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    maxMessages: 200,
    labelIds: ['INBOX', 'SENT']
  })
})

const { stats } = await response.json()
// stats: { messagesProcessed, contactsCreated, contactsUpdated, ... }
```

## Status: ✅ Implemented

The Gmail CRM sync is fully implemented and ready to use!

