#!/usr/bin/env node

import 'dotenv/config'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceRoleKey)

// Get account ID from environment or use default
let accountId = process.env.DEFAULT_ACCOUNT_ID || 'fde73a6a-ea84-46a7-803b-a3ae7cc09d00'

// Conversation state for multi-turn interactions
interface ConversationState {
  accountId: string
  pendingAction?: {
    type: 'create_job' | 'update_job' | 'send_email'
    collected: Record<string, any>
    required: string[]
  }
}

const conversationStates = new Map<string, ConversationState>()

// Define available tools
const tools: Tool[] = [
  {
    name: 'create_job',
    description: 'Create a new job/work order. Use this when the user wants to create a job. You will need to collect: contact name, description, and optionally scheduled time and technician.',
    inputSchema: {
      type: 'object',
      properties: {
        contactName: {
          type: 'string',
          description: 'Name of the customer/contact (e.g., "John Smith")',
        },
        description: {
          type: 'string',
          description: 'Description of the work to be done',
        },
        scheduledStart: {
          type: 'string',
          description: 'ISO 8601 datetime for scheduled start (optional)',
        },
        scheduledEnd: {
          type: 'string',
          description: 'ISO 8601 datetime for scheduled end (optional)',
        },
        techAssignedId: {
          type: 'string',
          description: 'UUID of assigned technician (optional)',
        },
      },
      required: ['contactName', 'description'],
    },
  },
  {
    name: 'search_contacts',
    description: 'Search for contacts by name, email, or phone number',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search query (name, email, or phone)',
        },
      },
      required: ['search'],
    },
  },
  {
    name: 'get_job',
    description: 'Get details of a specific job by ID',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'UUID of the job',
        },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'update_job_status',
    description: 'Update the status of a job',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'UUID of the job',
        },
        status: {
          type: 'string',
          enum: ['lead', 'scheduled', 'en_route', 'in_progress', 'completed', 'invoiced', 'paid'],
          description: 'New status for the job',
        },
      },
      required: ['jobId', 'status'],
    },
  },
  {
    name: 'assign_tech',
    description: 'Assign a technician to a job',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'UUID of the job',
        },
        techName: {
          type: 'string',
          description: 'Name of the technician to assign',
        },
      },
      required: ['jobId', 'techName'],
    },
  },
  {
    name: 'send_email',
    description: 'Send an email to a contact or send job information via email',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Email address to send to',
        },
        subject: {
          type: 'string',
          description: 'Email subject line',
        },
        body: {
          type: 'string',
          description: 'Email body content',
        },
        jobId: {
          type: 'string',
          description: 'Optional: Job ID to include in email',
        },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'get_user_email',
    description: 'Get the email address for the current user/account owner',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

// Tool implementations
async function createJob(args: any, conversationId: string): Promise<any> {
  const { contactName, description, scheduledStart, scheduledEnd, techAssignedId } = args

  // Search for contact
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .eq('account_id', accountId)
    .or(`first_name.ilike.%${contactName}%,last_name.ilike.%${contactName}%`)
    .limit(5)

  if (!contacts || contacts.length === 0) {
    return {
      error: `Contact "${contactName}" not found. Please provide the correct contact name.`,
    }
  }

  // Find best match
  const matched = contacts.find(
    (c) =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactName.toLowerCase()) ||
      contactName.toLowerCase().includes(c.first_name?.toLowerCase() || '')
  )
  const contactId = matched?.id || contacts[0].id

  // Create job via edge function
  const jobRes = await fetch(`${supabaseUrl}/functions/v1/create-job`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId,
      contactId,
      description,
      scheduledStart,
      scheduledEnd,
      techAssignedId,
    }),
  })

  const jobData = await jobRes.json()

  if (!jobRes.ok) {
    return { error: jobData.error || 'Failed to create job' }
  }

  return {
    success: true,
    jobId: jobData.job?.id,
    jobNumber: jobData.job?.id?.substring(0, 8) || 'N/A',
    message: `Job created successfully. Job number: ${jobData.job?.id?.substring(0, 8)}`,
  }
}

async function searchContacts(args: any): Promise<any> {
  const { search } = args

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone')
    .eq('account_id', accountId)
    .or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    )
    .limit(10)

  return {
    contacts: contacts || [],
    count: contacts?.length || 0,
  }
}

async function getJob(args: any): Promise<any> {
  const { jobId } = args

  const { data: job } = await supabase
    .from('jobs')
    .select('*, contacts(*), users(*)')
    .eq('id', jobId)
    .eq('account_id', accountId)
    .single()

  if (!job) {
    return { error: 'Job not found' }
  }

  return { job }
}

async function updateJobStatus(args: any): Promise<any> {
  const { jobId, status } = args

  const statusRes = await fetch(`${supabaseUrl}/functions/v1/update-job-status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId,
      jobId,
      status,
    }),
  })

  const statusData = await statusRes.json()

  if (!statusRes.ok) {
    return { error: statusData.error || 'Failed to update job status' }
  }

  return {
    success: true,
    job: statusData.job,
    message: `Job status updated to ${status}`,
  }
}

async function assignTech(args: any): Promise<any> {
  const { jobId, techName } = args

  // Search for technician
  const { data: techs } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('account_id', accountId)
    .or(`first_name.ilike.%${techName}%,last_name.ilike.%${techName}%`)
    .limit(5)

  if (!techs || techs.length === 0) {
    return { error: `Technician "${techName}" not found` }
  }

  const techId = techs[0].id

  const assignRes = await fetch(`${supabaseUrl}/functions/v1/assign-tech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId,
      jobId,
      techAssignedId: techId,
    }),
  })

  const assignData = await assignRes.json()

  if (!assignRes.ok) {
    return { error: assignData.error || 'Failed to assign technician' }
  }

  return {
    success: true,
    message: `Technician ${techName} assigned to job`,
  }
}

async function sendEmail(args: any): Promise<any> {
  const { to, subject, body, jobId } = args

  // Use Resend API to send email
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return { error: 'Email service not configured' }
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'CRM <noreply@317plumber.com>',
      to: [to],
      subject,
      html: body,
    }),
  })

  const emailData = await emailRes.json()

  if (!emailRes.ok) {
    return { error: emailData.message || 'Failed to send email' }
  }

  return {
    success: true,
    messageId: emailData.id,
    message: `Email sent to ${to}`,
  }
}

async function getUserEmail(): Promise<any> {
  // Get account owner email
  const { data: account } = await supabase
    .from('accounts')
    .select('owner_email')
    .eq('id', accountId)
    .single()

  if (!account?.owner_email) {
    // Try to get from users table
    const { data: users } = await supabase
      .from('users')
      .select('email')
      .eq('account_id', accountId)
      .eq('role', 'owner')
      .limit(1)

    return {
      email: users?.[0]?.email || null,
    }
  }

  return {
    email: account.owner_email,
  }
}

// Main server setup
async function main() {
  const server = new Server(
    {
      name: 'crm-ai-pro',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }))

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      let result: any

      switch (name) {
        case 'create_job':
          result = await createJob(args, request.params.conversationId || 'default')
          break
        case 'search_contacts':
          result = await searchContacts(args)
          break
        case 'get_job':
          result = await getJob(args)
          break
        case 'update_job_status':
          result = await updateJobStatus(args)
          break
        case 'assign_tech':
          result = await assignTech(args)
          break
        case 'send_email':
          result = await sendEmail(args)
          break
        case 'get_user_email':
          result = await getUserEmail()
          break
        default:
          return {
            content: [
              {
                type: 'text',
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      }
    }
  })

  // Connect via stdio
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('CRM AI Pro MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

