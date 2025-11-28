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
import { z } from 'zod'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceRoleKey)

// Get account ID from environment or use default
let accountId = process.env.DEFAULT_ACCOUNT_ID || 'fde73a6a-ea84-46a7-803b-a3ae7cc09d00'

// Define schemas with Zod for validation
const createJobSchema = z.object({
  description: z.string().describe("The work to be done (e.g. 'Install water heater')"),
  contactId: z.string().uuid().optional().describe("THE UUID of the contact. USE THIS FIELD if you have a UUID (e.g. from search_contacts or create_contact). Do NOT put a UUID in contactName."),
  contactName: z.string().optional().describe("The text name of the person (e.g. 'John Smith'). ONLY use this if you have NO UUID. Do NOT put an ID here."),
  scheduledStart: z.string().optional().describe("ISO 8601 start time (e.g. 2025-01-15T09:00:00Z)"),
  scheduledEnd: z.string().optional().describe("ISO 8601 end time"),
  techAssignedId: z.string().uuid().optional().describe("UUID of the technician to assign immediately. Use search_users to find this first."),
}).refine(data => data.contactId || data.contactName, {
  message: "Either contactId or contactName must be provided",
})

const searchContactsSchema = z.object({
  search: z.string().describe("Name, email, or phone number to fuzzy search.")
})

const getJobSchema = z.object({
  jobId: z.string().uuid().describe("The UUID of the job to retrieve"),
})

const updateJobStatusSchema = z.object({
  jobId: z.string().uuid().describe("The UUID of the job"),
  status: z.enum(['lead', 'scheduled', 'en_route', 'in_progress', 'completed', 'invoiced', 'paid']).describe("The target status. Must be one of these exact values."),
})

const assignTechSchema = z.object({
  jobId: z.string().uuid().describe("The UUID of the job to update"),
  techId: z.string().uuid().optional().describe("The UUID of the technician. USE THIS if you have the ID."),
  techName: z.string().optional().describe("The name of the tech. Only use if you absolutely cannot find the ID."),
}).refine(data => data.techId || data.techName, {
  message: "Either techId or techName must be provided",
})

const createContactSchema = z.object({
  firstName: z.string().describe("First name"),
  lastName: z.string().describe("Last name"),
  email: z.string().optional().describe("Email address"),
  phone: z.string().optional().describe("Phone number (digits only preferred)"),
  address: z.string().optional(),
  notes: z.string().optional()
})

const updateJobSchema = z.object({
  jobId: z.string().uuid().describe("The UUID of the job"),
  description: z.string().optional(),
  scheduledStart: z.string().optional().describe("ISO 8601 timestamp"),
  scheduledEnd: z.string().optional().describe("ISO 8601 timestamp"),
  notes: z.string().optional()
})

const searchUsersSchema = z.object({
  search: z.string().describe("Name or email of the staff member.")
})

const sendEmailSchema = z.object({
  to: z.string().email().describe("Valid email address"),
  subject: z.string().describe("Email subject line"),
  body: z.string().describe("Email body content (HTML supported)"),
  jobId: z.string().uuid().optional().describe("Optional: Link this email to a specific job context"),
})

const navigateSchema = z.object({
  page: z.enum(['inbox', 'jobs', 'contacts', 'analytics', 'finance', 'tech', 'campaigns', 'email-templates', 'tags', 'settings', 'integrations']).describe("The exact page route to load. Do not guess other values."),
  jobId: z.string().uuid().optional().describe("Optional: The UUID of the job to open details for."),
  contactId: z.string().uuid().optional().describe("Optional: The UUID of the contact to open details for."),
})

// Schema for get_user_email (empty object)
const getUserEmailSchema = z.object({})

// Schema for get_current_page (empty object)
const getCurrentPageSchema = z.object({})

// Define available tools
const tools: Tool[] = [
  {
    name: 'create_job',
    description: "Create a new job. CRITICAL: You must provide EITHER 'contactId' (preferred) OR 'contactName', but never both.",
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: "The work to be done (e.g. 'Install water heater')",
        },
        contactId: {
          type: 'string',
          description: "THE UUID of the contact. USE THIS FIELD if you have a UUID (e.g. from search_contacts or create_contact). Do NOT put a UUID in contactName.",
        },
        contactName: {
          type: 'string',
          description: "The text name of the person (e.g. 'John Smith'). ONLY use this if you have NO UUID. Do NOT put an ID here.",
        },
        scheduledStart: {
          type: 'string',
          description: "ISO 8601 start time (e.g. 2025-01-15T09:00:00Z)",
        },
        scheduledEnd: {
          type: 'string',
          description: "ISO 8601 end time",
        },
        techAssignedId: {
          type: 'string',
          description: "UUID of the technician to assign immediately. Use search_users to find this first.",
        },
      },
      required: ['description'],
    },
  },
  {
    name: 'search_contacts',
    description: "Search for a contact to get their UUID. ALWAYS do this before creating a job.",
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: "Name, email, or phone number to fuzzy search.",
        },
      },
      required: ['search'],
    },
  },
  {
    name: 'get_job',
    description: 'Get details of a specific job by its UUID',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The UUID of the job to retrieve',
        },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'update_job_status',
    description: "Move a job through the workflow stages (e.g. lead -> scheduled -> completed).",
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The UUID of the job',
        },
        status: {
          type: 'string',
          enum: ['lead', 'scheduled', 'en_route', 'in_progress', 'completed', 'invoiced', 'paid'],
          description: "The target status. Must be one of these exact values.",
        },
      },
      required: ['jobId', 'status'],
    },
  },
  {
    name: 'assign_tech',
    description: "Assign a technician to a job. Use search_users first to get the techId.",
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The UUID of the job to update',
        },
        techId: {
          type: 'string',
          description: "The UUID of the technician. USE THIS if you have the ID.",
        },
        techName: {
          type: 'string',
          description: "The name of the tech. Only use if you absolutely cannot find the ID.",
        },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'create_contact',
    description: "Create a new contact. Returns the new UUID which you must capture immediately.",
    inputSchema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: "First name",
        },
        lastName: {
          type: 'string',
          description: "Last name",
        },
        email: {
          type: 'string',
          description: "Email address",
        },
        phone: {
          type: 'string',
          description: "Phone number (digits only preferred)",
        },
        address: {
          type: 'string',
          description: "Physical address",
        },
        notes: {
          type: 'string',
          description: "Additional notes about the contact",
        },
      },
      required: ['firstName', 'lastName'],
    },
  },
  {
    name: 'update_job',
    description: "Update job details (time, description). Do not use this for Status changes.",
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The UUID of the job',
        },
        description: {
          type: 'string',
          description: "Updated work description",
        },
        scheduledStart: {
          type: 'string',
          description: "ISO 8601 timestamp",
        },
        scheduledEnd: {
          type: 'string',
          description: "ISO 8601 timestamp",
        },
        notes: {
          type: 'string',
          description: "Additional notes for the job",
        },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'search_users',
    description: "Search for a technician/employee to get their UUID.",
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: "Name or email of the staff member.",
        },
      },
      required: ['search'],
    },
  },
  {
    name: 'send_email',
    description: "Send an email to a contact.",
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: "Valid email address",
        },
        subject: {
          type: 'string',
          description: "Email subject line",
        },
        body: {
          type: 'string',
          description: "Email body content (HTML supported)",
        },
        jobId: {
          type: 'string',
          description: "Optional: Link this email to a specific job context",
        },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'get_user_email',
    description: "Get the email address of the current account owner",
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'navigate',
    description: "Navigate the user's screen to a specific page.",
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          enum: ['inbox', 'jobs', 'contacts', 'analytics', 'finance', 'tech', 'campaigns', 'email-templates', 'tags', 'settings', 'integrations'],
          description: "The exact page route to load. Do not guess other values.",
        },
        jobId: {
          type: 'string',
          description: "Optional: The UUID of the job to open details for.",
        },
        contactId: {
          type: 'string',
          description: "Optional: The UUID of the contact to open details for.",
        },
      },
      required: ['page'],
    },
  },
  {
    name: 'get_current_page',
    description: "Get information about what page the user is currently viewing",
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

// Tool implementations
async function createJob(args: any): Promise<any> {
  // Validate input
  const validated = createJobSchema.parse(args)
  const { contactId, contactName, description, scheduledStart, scheduledEnd, techAssignedId } = validated

  let resolvedContactId: string

  // If contactId is provided, use it directly
  if (contactId) {
    // Verify the contact exists
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', contactId)
      .eq('account_id', accountId)
      .single()

    if (error || !contact) {
      return {
        error: `Contact with ID "${contactId}" not found. Please verify the contact exists.`,
      }
    }

    resolvedContactId = contactId
  } else if (contactName) {
    // Fall back to contactName search
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, first_name, last_name')
      .eq('account_id', accountId)
      .or(`first_name.ilike.%${contactName}%,last_name.ilike.%${contactName}%`)
      .limit(5)

    if (!contacts || contacts.length === 0) {
      return {
        error: `Contact "${contactName}" not found. Please provide the correct contact name or contactId.`,
      }
    }

    // Find best match
    const matched = contacts.find(
      (c) =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactName.toLowerCase()) ||
        contactName.toLowerCase().includes(c.first_name?.toLowerCase() || '')
    )
    resolvedContactId = matched?.id || contacts[0].id
  } else {
    return {
      error: 'Either contactId or contactName must be provided to create a job.',
    }
  }

  // Create job via edge function
  const jobRes = await fetch(`${supabaseUrl}/functions/v1/create-job`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId,
      contactId: resolvedContactId,
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
  const validated = searchContactsSchema.parse(args)
  const { search } = validated

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
  const validated = getJobSchema.parse(args)
  const { jobId } = validated

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
  const validated = updateJobStatusSchema.parse(args)
  const { jobId, status } = validated

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
  const validated = assignTechSchema.parse(args)
  const { jobId, techId, techName } = validated

  let resolvedTechId: string

  // If techId is provided, use it directly
  if (techId) {
    // Verify the technician exists
    const { data: tech, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', techId)
      .eq('account_id', accountId)
      .single()

    if (error || !tech) {
      return {
        error: `Technician with ID "${techId}" not found. Please verify the technician exists.`,
      }
    }

    resolvedTechId = techId
  } else if (techName) {
    // Fall back to techName search
    const { data: techs } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('account_id', accountId)
      .or(`first_name.ilike.%${techName}%,last_name.ilike.%${techName}%`)
      .limit(5)

    if (!techs || techs.length === 0) {
      return { error: `Technician "${techName}" not found` }
    }

    resolvedTechId = techs[0].id
  } else {
    return {
      error: 'Either techId or techName must be provided to assign a technician.',
    }
  }

  const assignRes = await fetch(`${supabaseUrl}/functions/v1/assign-tech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountId,
      jobId,
      techAssignedId: resolvedTechId,
    }),
  })

  const assignData = await assignRes.json()

  if (!assignRes.ok) {
    return { error: assignData.error || 'Failed to assign technician' }
  }

  return {
    success: true,
    message: `Technician assigned to job successfully`,
  }
}

async function createContact(args: any): Promise<any> {
  const validated = createContactSchema.parse(args)
  const { firstName, lastName, email, phone, address, notes } = validated

  // Create contact via direct database insert
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      account_id: accountId,
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message || 'Failed to create contact' }
  }

  return {
    success: true,
    contactId: data.id,
    contact: {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes,
    },
    message: `Contact "${firstName} ${lastName}" created successfully with ID: ${data.id}`,
  }
}

async function updateJob(args: any): Promise<any> {
  const validated = updateJobSchema.parse(args)
  const { jobId, description, scheduledStart, scheduledEnd, notes } = validated

  // Build update object with only provided fields
  const updateData: any = {}
  if (description !== undefined) updateData.description = description
  if (scheduledStart !== undefined) updateData.scheduled_start = scheduledStart
  if (scheduledEnd !== undefined) updateData.scheduled_end = scheduledEnd
  if (notes !== undefined) updateData.notes = notes

  // Update the job
  const { data, error } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', jobId)
    .eq('account_id', accountId)
    .select()
    .single()

  if (error) {
    return { error: error.message || 'Failed to update job' }
  }

  if (!data) {
    return { error: 'Job not found' }
  }

  return {
    success: true,
    job: data,
    message: 'Job updated successfully',
  }
}

async function searchUsers(args: any): Promise<any> {
  const validated = searchUsersSchema.parse(args)
  const { search } = validated

  const { data: users } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role')
    .eq('account_id', accountId)
    .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    .limit(10)

  return {
    users: users || [],
    count: users?.length || 0,
  }
}

async function sendEmail(args: any): Promise<any> {
  const validated = sendEmailSchema.parse(args)
  const { to, subject, body, jobId } = validated

  // Use Resend API to send email
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return { error: 'Email service not configured' }
  }

  // Get sender email from environment config
  const senderEmail = process.env.RESEND_VERIFIED_DOMAIN
    ? (process.env.RESEND_VERIFIED_DOMAIN.includes('@')
        ? `CRM <${process.env.RESEND_VERIFIED_DOMAIN}>`
        : `CRM <noreply@${process.env.RESEND_VERIFIED_DOMAIN}>`)
    : 'CRM <noreply@resend.dev>'

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: senderEmail,
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

async function getUserEmail(args: any): Promise<any> {
  // Validate input (empty object)
  getUserEmailSchema.parse(args)

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

// Page URL mappings
const pageRoutes: Record<string, string> = {
  'inbox': '/inbox',
  'jobs': '/jobs',
  'contacts': '/contacts',
  'analytics': '/analytics',
  'finance': '/finance/dashboard',
  'tech': '/tech/dashboard',
  'campaigns': '/marketing/campaigns',
  'email-templates': '/marketing/email-templates',
  'tags': '/marketing/tags',
  'settings': '/admin/settings',
  'integrations': '/settings/integrations',
}

async function navigate(args: any): Promise<any> {
  const validated = navigateSchema.parse(args)
  const { page, jobId, contactId } = validated

  // Build the full path
  let fullPath = pageRoutes[page]

  // Handle specific item navigation
  if (page === 'jobs' && jobId) {
    fullPath = `/jobs/${jobId}`
  } else if (page === 'contacts' && contactId) {
    fullPath = `/contacts/${contactId}`
  }

  // Insert navigation command into Supabase
  const { data, error } = await supabase
    .from('voice_navigation_commands')
    .insert({
      account_id: accountId,
      page: fullPath,
      params: { jobId, contactId },
      executed: false,
    })
    .select()
    .single()

  if (error) {
    return { error: `Failed to send navigation command: ${error.message}` }
  }

  return {
    success: true,
    message: `Navigating to ${page}${jobId ? ` (Job: ${jobId.substring(0, 8)})` : ''}${contactId ? ` (Contact: ${contactId.substring(0, 8)})` : ''}`,
    path: fullPath,
    commandId: data?.id,
  }
}

async function getCurrentPage(args: any): Promise<any> {
  // Validate input (empty object)
  getCurrentPageSchema.parse(args)

  // Get the most recent executed navigation command to know where user is
  // This is a best-effort - the frontend will have the actual current page
  const { data } = await supabase
    .from('voice_navigation_commands')
    .select('page, executed_at')
    .eq('account_id', accountId)
    .eq('executed', true)
    .order('executed_at', { ascending: false })
    .limit(1)

  if (data && data.length > 0) {
    const pageName = Object.entries(pageRoutes).find(([_, path]) => path === data[0].page)?.[0] || data[0].page
    return {
      currentPage: pageName,
      path: data[0].page,
      lastNavigated: data[0].executed_at,
    }
  }

  return {
    currentPage: 'unknown',
    message: 'Unable to determine current page. The user may not have navigated via voice commands yet.',
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
          result = await createJob(args)
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
        case 'create_contact':
          result = await createContact(args)
          break
        case 'update_job':
          result = await updateJob(args)
          break
        case 'search_users':
          result = await searchUsers(args)
          break
        case 'send_email':
          result = await sendEmail(args)
          break
        case 'get_user_email':
          result = await getUserEmail()
          break
        case 'navigate':
          result = await navigate(args)
          break
        case 'get_current_page':
          result = await getCurrentPage()
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
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return {
          content: [
            {
              type: 'text',
              text: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
            },
          ],
          isError: true,
        }
      }

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