# MCP Tool Requirements - Voice Agent Source of Truth
**Supabase Edge Function Deployment**

**Version:** 4.0 (Cutting-Edge AI Tools Integration)
**Last Updated:** November 28, 2025 - 08:21 PM
**Status:** ✅ DEPLOYED ON SUPABASE (88 TOOLS AVAILABLE - 70 CORE + 18 CUTTING-EDGE AI)
**Purpose:** This document serves as the definitive reference for all MCP tools available to the Voice Agent via the Supabase Edge Function deployment. It bridges TypeScript Zod schemas with Natural Language instructions to prevent input format errors.

**Deployment URL:** https://expbvujyegxmxvatcjqt.supabase.co/functions/v1/mcp-server

---

## 1. create_job
**Description:** Create a new job. CRITICAL: You must provide EITHER `contactId` (preferred) OR `contactName`, but never both.

**Parameters:**
* `description` (String) - **REQUIRED**: The work to be done.
* `contactId` (UUID) - **OPTIONAL (PREFERRED)**: The UUID of the contact. **USE THIS FIELD** if you have a UUID. Do NOT put a UUID in `contactName`.
* `contactName` (String) - **OPTIONAL (FALLBACK)**: The text name. **ONLY** use this if you have NO UUID.
* `scheduledStart` (String) - **OPTIONAL**: ISO 8601 start time.
* `scheduledEnd` (String) - **OPTIONAL**: ISO 8601 end time.
* `techAssignedId` (UUID) - **OPTIONAL**: UUID of the technician.

**Critical Rules:**
* **ID Priority:** If `contactId` is provided, the system links the job directly. This is the **safest** method.
* **Schema Hardening:** The Zod schema description explicitly forbids putting UUIDs in the name field.
* **Workflow:** Always run `Contactss` or `create_contact` first to get the `contactId`.

**Prompting Instruction:** "Always try to use 'contactId' (UUID) to create a job. Only use 'contactName' if you absolutely cannot find the ID first."

**Example Payload:**
```json
{
  "contactId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "description": "Replace water heater",
  "scheduledStart": "2025-01-20T10:00:00Z"
}
2. search_contacts
Description: Searches for contacts in the CRM by name, email, or phone number.

Parameters:

search (String) - REQUIRED: Search query string.

Critical Rules:

Performs case-insensitive matching on Name, Email, and Phone.

Returns: Array of objects containing { "id": "uuid...", "first_name": "...", ... }.

Use this tool to acquire the UUID before creating a job.

Prompting Instruction: "Search here first. If you find the person, capture their 'id' for the next step."

Example Payload:

JSON

{ "search": "Douglas Talley" }
3. create_contact
Description: Creates a new contact profile in the database.

Parameters:

firstName (String) - REQUIRED

lastName (String) - REQUIRED

email (String) - OPTIONAL

phone (String) - OPTIONAL

address (String) - OPTIONAL

notes (String) - OPTIONAL

Critical Rules:

Return Value: Successfully returns { "id": "new-uuid", "success": true }.

Immediate Action: The agent must capture this returned id to immediately create a job for this new person.

Prompting Instruction: "If search returns nothing, ask for details and create the contact. Use the returned ID immediately."

Example Payload:

JSON

{
  "firstName": "Alice",
  "lastName": "Cooper",
  "phone": "555-0199"
}
4. assign_tech
Description: Assigns a technician to a specific job.

Parameters:

jobId (String/UUID) - REQUIRED: The UUID of the job.

techId (String/UUID) - OPTIONAL (PREFERRED): The UUID of the technician.

techName (String) - OPTIONAL (FALLBACK): Name string for fuzzy search.

Critical Rules:

ID Priority: Always prefer techId.

Pre-requisite: Use search_users to find the technician's UUID first.

Prompting Instruction: "Find the tech's ID using 'search_users', then assign them using 'techId'."

Example Payload:

JSON

{
  "jobId": "job-uuid-123",
  "techId": "tech-uuid-456"
}
5. search_users
Description: Searches for internal users (technicians/staff) to get their IDs.

Parameters:

search (String) - REQUIRED: Name or email of the staff member.

Critical Rules:

Used primarily to find a technician's UUID before calling assign_tech.

Example Payload:

JSON

{ "search": "Mike" }
6. update_job
Description: Updates the details (schedule, description) of an existing job.

Parameters:

jobId (String/UUID) - REQUIRED

description (String) - OPTIONAL

scheduledStart (String) - OPTIONAL: ISO 8601.

scheduledEnd (String) - OPTIONAL: ISO 8601.

Critical Rules:

Use this for content updates. Use update_job_status for workflow updates.

Example Payload:

JSON

{
  "jobId": "job-uuid-123",
  "scheduledStart": "2025-02-01T14:00:00Z"
}
7. update_job_status
Description: Moves the job through the workflow stages.

Parameters:

jobId (String/UUID) - REQUIRED

status (Enum) - REQUIRED

Valid Status Options (ENUM): lead, scheduled, en_route, in_progress, completed, invoiced, paid

Critical Rules:

Strict Enum: Values must match exactly.

Use this when the user says "Mark job as completed" or "Tech is en route."

8. navigate
Description: Controls the user's screen navigation.

Parameters:

page (Enum) - REQUIRED

jobId (String/UUID) - OPTIONAL: For deep linking to jobs.

contactId (String/UUID) - OPTIONAL: For deep linking to contacts.

Valid Page Options (ENUM):

inbox

jobs

contacts

analytics

finance

tech

campaigns

email-templates

tags

settings

integrations

Critical Rules:

Validation: The system strictly enforces this list. Hallucinated pages (e.g., "my-profile") will return an error.

Context: Navigating to jobs without an ID opens the list. Navigating with jobId opens the detail view.

### 🚨 CRITICAL: Navigation Pacing Protocol

**NEVER RAPID-FIRE NAVIGATION.** The agent MUST NOT call `navigate` multiple times in quick succession.

**THE RULE: ONE-NAVIGATE-THEN-WAIT**
```
❌ FORBIDDEN: navigate → navigate → navigate → navigate (rapid fire)
✅ REQUIRED:  navigate → EXPLAIN → WAIT for user → navigate → EXPLAIN → WAIT
```

**Pacing Requirements:**
1. Call `navigate` ONCE
2. Speak for 20-30 seconds explaining the page
3. ASK the user if they're ready for the next page
4. WAIT for explicit confirmation ("yes", "ready", "next", "continue")
5. Only THEN call `navigate` again

**Listen for user interruption:** If user says "wait", "stop", "slow down" - STOP navigation immediately.

**See Also:** `VOICE_AGENT_README.md` for complete onboarding tour protocols and role-specific page sequences.

Example Payload:

JSON

{
  "page": "settings"
}
9. send_email
Description: Sends an email via Resend API.

Parameters:

to (String) - REQUIRED: Valid email address.

subject (String) - REQUIRED

body (String) - REQUIRED: HTML allowed.

jobId (String/UUID) - OPTIONAL: For context.

Common Gotchas & Best Practices
The "Search-First, ID-Always" Protocol
The most common error is guessing IDs or using names for database links.

CORRECT FLOW: Input (Name) → Contactss → Result (UUID) → create_job(UUID)

INCORRECT FLOW: Input (Name) → create_job(Name)

Handling New Customers
User says: "New job for Alice."

Agent: Contactss("Alice") → Result: [] (Empty).

Agent asks: "I don't see Alice. What's her phone number?"

Agent: create_contact(...) → Result: { "id": "UUID-NEW" }.

Agent: create_job({ "contactId": "UUID-NEW" }).

Navigation Errors
If Maps returns "Invalid page", check the Enum list.

Do not try to navigate to specific sub-pages that aren't in the list (e.g., /settings/profile is not valid, just use settings).

---

## 10. Utility Tools (Additional Helper Functions)

These tools are not required but provide helpful utility functions for the Voice Agent:

### get_job
**Description:** Retrieves detailed information about a specific job by its UUID.

**Parameters:**
* `jobId` (UUID) - **REQUIRED**: The UUID of the job to retrieve.

**Use Case:** Get full job details including contact and technician information.

### get_user_email
**Description:** Retrieves the email address of the current account owner.

**Parameters:** None

**Use Case:** Get the sender email for notifications or replies.

### get_current_page
**Description:** Gets information about which page the user is currently viewing.

**Parameters:** None

**Use Case:** Understand user context before suggesting navigation or actions.

## 11. read_agent_memory
**Description:** Checks for previous conversations from the last 72 hours to resume context.

**Parameters:**
* `userIdentifier` (UUID) - **REQUIRED**: The UUID of the authenticated user from Supabase Auth.

**Returns:**
* If found: `{ "found": true, "summary": "...", "intent": "...", "stagingData": {...} }`
* If not found: `{ "found": false }`

**Prompting Instruction:** "For web sessions, call immediately with {{user_identifier}}. For phone calls, use the phone number."

**Use Case:** Enable seamless conversation continuity across disconnections.

**Web Session Example:** `read_agent_memory(userIdentifier: "{{user_identifier}}")`

## 12. update_agent_memory
**Description:** Saves the current conversation state (Save Game).

**Parameters:**
* `userIdentifier` (UUID) - **REQUIRED**: The UUID of the authenticated user.
* `summary` (String) - **REQUIRED**: 1-sentence context recap.
* `intent` (String) - **OPTIONAL**: What is the user trying to do?
  - Use "in_progress" for active conversations
  - Use "completed" when task is finished
  - Use specific values (e.g., "job_creation", "system_tour") for tracking
* `stagingData` (String) - **OPTIONAL**: JSON string with rich context data.

**Prompting Instruction:** "Save frequently with current page, user preferences, and progress."

**Use Case:** Maintain context across disconnections and sessions.

**Web Session Example:**
```
update_agent_memory({
  userIdentifier: "{{user_identifier}}",
  summary: "User reviewing dispatch map features",
  intent: "system_tour",
  stagingData: "{\"currentSection\": \"dispatch\", \"role\": \"admin\"}"
})
```

15. add_tag_to_contact
**Description:** Add a tag to a contact. Creates the tag if it doesn't exist.

**Parameters:**
* `contactId` (String/UUID) - **REQUIRED**: The ID of the contact to tag
* `tagName` (String) - **REQUIRED**: The name of the tag
* `tagColor` (String) - **OPTIONAL**: Hex color code (default: #3B82F6)

**Critical Rules:**
* Tags are account-specific and unique by name
* Color accepts standard hex format (#RRGGBB)
* If tag exists, it will be assigned to contact
* Multiple tags can be assigned to same contact

**Example Payload:**
```json
{
  "contactId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tagName": "VIP Customer",
  "tagColor": "#FF6B6B"
}
```

16. remove_tag_from_contact
**Description:** Remove a tag from a contact.

**Parameters:**
* `contactId` (String/UUID) - **REQUIRED**: The ID of the contact
* `tagId` (String/UUID) - **REQUIRED**: The ID of the tag to remove

**Critical Rules:**
* Both IDs must be valid UUIDs
* Tag must be currently assigned to contact
* Other tags on contact remain unaffected
* Tag itself is not deleted, only the assignment

**Example Payload:**
```json
{
  "contactId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tagId": "f1e2d3c4-b5a6-7890-fedc-ba9876543210"
}
```

17. add_note_to_contact
**Description:** Add a note to a contact with type and pinning options.

**Parameters:**
* `contactId` (String/UUID) - **REQUIRED**: The ID of the contact
* `content` (String) - **REQUIRED**: The note content
* `noteType` (Enum) - **OPTIONAL**: Type of note (default: general)
* `isPinned` (Boolean) - **OPTIONAL**: Pin note to top (default: false)

**Valid Note Types (ENUM):** general, call, email, meeting, internal, customer

**Critical Rules:**
* Notes are account-isolated for security
* Pinned notes appear at top of lists
* Each note tracks who created it
* Notes support full text search

**Example Payload:**
```json
{
  "contactId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Customer prefers morning appointments",
  "noteType": "call",
  "isPinned": true
}
```

18. add_note_to_job
**Description:** Add a note to a job with type and pinning options.

**Parameters:**
* `jobId` (String/UUID) - **REQUIRED**: The ID of the job
* `content` (String) - **REQUIRED**: The note content
* `noteType` (Enum) - **OPTIONAL**: Type of note (default: general)
* `isPinned` (Boolean) - **OPTIONAL**: Pin note to top (default: false)

**Valid Note Types (ENUM):** general, call, email, meeting, internal, customer

**Critical Rules:**
* Notes are account-isolated for security
* Pinned notes appear at top of job details
* Each note tracks who created it
* Notes are included in job reports

**Example Payload:**
```json
{
  "jobId": "j1k2l3m4-n5o6-7890-pqrs-tuvwxyz123456",
  "content": "Customer gate code: #1234",
  "noteType": "internal",
  "isPinned": true
}
```

---

## 🚀 CUTTING-EDGE AI TOOLS (18 New Advanced Tools)

### 19. ai_estimate_job
**Description:** AI-powered job estimation using historical data and machine learning. Analyzes 50+ similar jobs to provide accurate cost and duration estimates.

**Parameters:**
* `jobType` (String) - **REQUIRED**: Type of job (plumbing, electrical, etc.)
* `description` (String) - **REQUIRED**: Detailed job description
* `location` (String) - **REQUIRED**: Job location/address
* `urgency` (String) - **OPTIONAL**: low/medium/high/emergency
* `reportedIssues` (Array<String>) - **OPTIONAL**: List of reported issues

**AI Processing:**
- Analyzes historical similar jobs
- Uses GPT-4 for intelligent estimation
- Returns confidence score with reasoning
- Saves estimate to database for future reference

**Returns:** Duration (minutes), cost, confidence (0-100), reasoning

### 20. analyze_customer_sentiment
**Description:** Analyze customer sentiment from conversation history using GPT-4 Turbo with emotion detection and trend analysis.

**Parameters:**
* `contactId` (UUID) - **REQUIRED**: Contact UUID to analyze
* `timeframe` (String) - **OPTIONAL**: Time period (e.g., "30d", "7d")
* `includeEmails` (Boolean) - **OPTIONAL**: Include email analysis (default: true)

**AI Analysis:**
- Sentiment score (-1 to 1)
- Emotion detection (joy, anger, frustration, etc.)
- Key phrases extraction
- Trend analysis over time

**Returns:** Sentiment data, conversations analyzed, trend indicator

### 21. predict_equipment_maintenance
**Description:** Predict equipment failures using AI and historical maintenance data to prevent costly breakdowns.

**Parameters:**
* `equipmentId` (String) - **REQUIRED**: Equipment identifier
* `equipmentType` (String) - **REQUIRED**: Type of equipment
* `lastMaintenance` (String) - **OPTIONAL**: Last maintenance date (YYYY-MM-DD)
* `usageHours` (Number) - **OPTIONAL**: Total usage hours
* `reportedIssues` (Array<String>) - **OPTIONAL**: Recent issues

**Prediction Output:**
- Failure probability (0-100%)
- Predicted failure date
- Risk factors identified
- Maintenance recommendations
- Urgency level

### 22. calculate_dynamic_pricing
**Description:** Real-time pricing optimization based on market conditions, customer value, and competitive analysis.

**Parameters:**
* `jobId` (UUID) - **REQUIRED**: Job UUID for pricing
* `basePrice` (Number) - **REQUIRED**: Base price estimate
* `factors` (Object) - **OPTIONAL**: Additional pricing factors

**Optimization Factors:**
- Customer value score
- Market rates from similar jobs
- Urgency and complexity
- Competitive positioning

**Returns:** Adjusted price, reasoning, market position, customer segment

### 23. assess_job_risk
**Description:** Comprehensive risk analysis for jobs including safety, financial, and reputation risks.

**Parameters:**
* `jobId` (UUID) - **REQUIRED**: Job UUID to assess
* `jobType` (String) - **REQUIRED**: Type of job
* `location` (String) - **REQUIRED**: Job location
* `complexity` (String) - **OPTIONAL**: low/medium/high

**Risk Categories:**
- Overall risk score (0-100)
- Safety risk assessment
- Financial risk evaluation
- Reputation risk analysis
- Required permits and insurance

**Returns:** Risk scores, mitigation strategies, permit requirements

### 24. predict_customer_churn
**Description:** Identify customers at risk of leaving with proactive intervention strategies.

**Parameters:**
* `contactId` (UUID) - **REQUIRED**: Contact UUID to analyze
* `includeHistory` (Boolean) - **OPTIONAL**: Include service history (default: true)

**Analysis Features:**
- Churn risk score (0-100)
- Warning signs detection
- Retention probability
- Recommended interventions
- Actionable retention strategies

**Returns:** Churn prediction, risk level, intervention plan

### 25. provide_sales_coaching
**Description:** Real-time sales guidance and conversation optimization for improving conversion rates.

**Parameters:**
* `context` (String) - **REQUIRED**: Current sales situation
* `conversationId` (UUID) - **OPTIONAL**: Conversation UUID to analyze
* `salesPersonId` (UUID) - **OPTIONAL**: Sales person UUID

**Coaching Features:**
- Performance scoring (0-100)
- Strengths and improvement areas
- Talking points and questions
- Closing probability
- Recommended approach

**Returns:** Coaching insights, success metrics, next steps

### 26. monitor_compliance
**Description:** Automated compliance checking for regulations and standards across jobs, invoices, and contracts.

**Parameters:**
* `entityType` (String) - **REQUIRED**: job/invoice/contract/communication
* `entityId` (String) - **REQUIRED**: Entity UUID to check
* `complianceType` (String) - **REQUIRED**: Type of compliance to check

**Compliance Check:**
- Overall compliance score
- Violations identified
- Required actions
- Risk level assessment
- Documentation needed

**Returns:** Compliance report, violations, recommended actions

### 27. plan_visual_route
**Description:** Interactive route optimization with traffic and priority weighting for technician efficiency.

**Parameters:**
* `techId` (UUID) - **REQUIRED**: Technician UUID
* `jobIds` (Array<UUID>) - **REQUIRED**: List of job UUIDs to route
* `startTime` (String) - **OPTIONAL**: Route start time (ISO 8601)
* `optimizeFor` (String) - **OPTIONAL**: time/distance/priority

**Optimization Features:**
- Optimal job sequence
- Total distance/time calculation
- Priority-based scheduling
- Traffic consideration
- Technician location tracking

**Returns:** Optimized route, total distance, estimated duration

### 28. analyze_job_photos
**Description:** AI analysis of job photos for issue identification and documentation using computer vision.

**Parameters:**
* `jobId` (UUID) - **REQUIRED**: Job UUID
* `photoUrls` (Array<String>) - **REQUIRED**: Photo URLs to analyze
* `analysisType` (String) - **OPTIONAL**: issues/documentation/quality/all

**Analysis Features:**
- Issue detection (leaks, damage, wear)
- Quality scoring (0-100)
- Before/after comparison
- Recommended actions
- Cost estimation for repairs

**Returns:** Analysis results, issues found, quality scores

### 29. verify_signature
**Description:** Verify signature authenticity and detect fraud using biometric analysis.

**Parameters:**
* `jobId` (UUID) - **REQUIRED**: Job UUID
* `signatureImageUrl` (String) - **REQUIRED**: Signature image URL
* `referenceSignatureId` (String) - **OPTIONAL**: Reference signature UUID

**Verification Features:**
- Authenticity verification
- Confidence score (0-100)
- Biometric pattern matching
- Anomaly detection
- Fraud risk assessment

**Returns:** Verification result, confidence score, risk level

### 30. scan_and_process_document
**Description:** Extract and process data from uploaded documents using OCR technology.

**Parameters:**
* `documentUrl` (String) - **REQUIRED**: Document image/PDF URL
* `documentType` (String) - **REQUIRED**: invoice/contract/receipt/form/other
* `extractionFields` (Array<String>) - **OPTIONAL**: Fields to extract

**OCR Features:**
- Text extraction with 95% accuracy
- Field-specific data extraction
- Multiple document formats
- Confidence scoring
- Structured data output

**Returns:** Extracted text, structured data, confidence score

### 31. start_video_support
**Description:** Initiate video call with customer for complex issues using WebRTC technology.

**Parameters:**
* `contactId` (UUID) - **REQUIRED**: Customer contact UUID
* `reason` (String) - **REQUIRED**: Reason for video call
* `jobId` (UUID) - **OPTIONAL**: Job UUID
* `technicianId` (UUID) - **OPTIONAL**: Technician UUID

**Video Features:**
- WebRTC session creation
- Unique session IDs
- Role-based access links
- Session recording
- Duration tracking

**Returns:** Session links, session ID, connection details

### 32. monitor_iot_devices
**Description:** Connect and monitor IoT sensors and smart devices for real-time equipment tracking.

**Parameters:**
* `deviceId` (String) - **REQUIRED**: IoT device identifier
* `deviceType` (String) - **REQUIRED**: Type of IoT device
* `customerId` (UUID) - **REQUIRED**: Customer UUID
* `monitoringPeriod` (String) - **OPTIONAL**: 24h/7d/30d

**IoT Features:**
- Real-time monitoring
- Device health tracking
- Alert management
- Historical data analysis
- Predictive alerts

**Returns:** Device status, last readings, connection status

### 33. process_crypto_payment
**Description:** Accept and process cryptocurrency payments with blockchain transaction tracking.

**Parameters:**
* `invoiceId` (UUID) - **REQUIRED**: Invoice UUID
* `cryptocurrency` (String) - **REQUIRED**: BTC/ETH/USDC/USDT
* `amount` (Number) - **REQUIRED**: Payment amount
* `walletAddress` (String) - **OPTIONAL**: Customer wallet address

**Crypto Features:**
- Multi-cryptocurrency support
- Transaction hash generation
- Status tracking
- Gas fee calculation
- Confirmation monitoring

**Returns:** Transaction ID, hash, status, payment address

### 34. create_ar_preview
**Description:** Augmented reality preview of completed work for customer visualization.

**Parameters:**
* `jobId` (UUID) - **REQUIRED**: Job UUID
* `previewType` (String) - **REQUIRED**: before/after/process
* `modelFiles` (Array<String>) - **OPTIONAL**: 3D model file URLs

**AR Features:**
- 3D model rendering
- AR URL generation
- QR code access
- Mobile compatibility
- Preview tracking

**Returns:** AR URL, QR code, preview ID

### 35. predict_candidate_success
**Description:** AI-powered candidate evaluation and success prediction for optimized hiring.

**Parameters:**
* `candidateId` (UUID) - **REQUIRED**: Candidate UUID
* `positionId` (String) - **REQUIRED**: Position UUID
* `resumeData` (Object) - **OPTIONAL**: Resume/experience data
* `assessmentScores` (Object) - **OPTIONAL**: Assessment test scores

**Evaluation Features:**
- Success probability (0-100)
- Technical skills assessment
- Cultural fit analysis
- Growth potential
- Interview questions

**Returns**: Success metrics, strengths, concerns, recommendations

### 36. clone_customer_voice
**Description:** Create AI voice clones for personalized customer interactions.

**Parameters:**
* `contactId` (UUID) - **REQUIRED**: Contact UUID to clone voice for
* `audioSampleUrl` (String) - **REQUIRED**: Audio sample URL
* `useCase` (String) - **REQUIRED**: notifications/reminders/updates/custom
* `consentRecorded` (Boolean) - **REQUIRED**: Customer consent recorded

**Voice Features:**
- Voice synthesis
- Consent management
- Use case tracking
- Quality assurance
- Processing status

**Returns:** Clone ID, voice ID, processing status, estimated time

---

## Implementation Status

**Last Verified:** November 28, 2025 - 08:21 PM
**Total Tools Deployed:** 88 TOOLS (36 documented + 52 additional business tools)
**Deployment URL:** https://expbvujyegxmxvatcjqt.supabase.co/functions/v1/mcp-server
**Memory Features:** ✅ DEPLOYED AND VERIFIED - read_agent_memory & update_agent_memory now available
**Core Tools Status:** ✅ ALL 18 CORE TOOLS DEPLOYED
**Cutting-Edge AI:** ✅ ALL 18 ADVANCED AI TOOLS DEPLOYED
**Additional Tools:** 52 extra business tools (invoicing, campaigns, analytics, etc.) also available
**UUID-First Protocol:** ✅ FULLY IMPLEMENTED
**Navigation Pacing:** ✅ ONE-NAVIGATE-THEN-WAIT PROTOCOL DOCUMENTED

---

## Cross-Reference Documents

For complete operational protocols, see these companion documents in `/SingleSources/`:

| Document | Content |
|----------|---------|
| `VOICE_AGENT_README.md` | Onboarding tour protocols, role-specific page sequences, navigation pacing rules |
| `UI_UX_MASTER_ROADMAP.md` | Role UI/UX flows, mobile PWA details, page access by role |
| `BUSINESS_WORKFLOWS.md` | Job lifecycle, 7-gate tech workflow, status transitions |
