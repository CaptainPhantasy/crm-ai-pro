import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for MCP server
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey)
}

// Get account ID from environment or use default
function getAccountId(): string {
  return process.env.DEFAULT_ACCOUNT_ID || 'fde73a6a-ea84-46a7-803b-a3ae7cc09d00'
}

export const crmTools: Tool[] = [
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
  {
    name: 'create_contact',
    description: 'Create a new contact in the CRM',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address (required)',
        },
        firstName: {
          type: 'string',
          description: 'First name (required)',
        },
        lastName: {
          type: 'string',
          description: 'Last name (optional)',
        },
        phone: {
          type: 'string',
          description: 'Phone number (optional)',
        },
        address: {
          type: 'string',
          description: 'Address (optional)',
        },
      },
      required: ['email', 'firstName'],
    },
  },
  {
    name: 'get_contact',
    description: 'Get details of a specific contact by ID',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'UUID of the contact',
        },
      },
      required: ['contactId'],
    },
  },
  {
    name: 'list_jobs',
    description: 'List jobs with optional filters (status, tech, date range)',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status (lead, scheduled, en_route, in_progress, completed, invoiced, paid)',
        },
        techId: {
          type: 'string',
          description: 'Filter by assigned technician ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 50)',
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination (default: 0)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_dashboard_stats',
    description: 'Get dashboard statistics including jobs, revenue, contacts, and invoices',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_invoice',
    description: 'Create a new invoice for a job',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'UUID of the job',
        },
        totalAmount: {
          type: 'number',
          description: 'Total amount in cents',
        },
        dueDate: {
          type: 'string',
          description: 'ISO 8601 date for due date',
        },
        notes: {
          type: 'string',
          description: 'Optional notes',
        },
      },
      required: ['jobId', 'totalAmount'],
    },
  },
  {
    name: 'get_invoice',
    description: 'Get details of a specific invoice by ID',
    inputSchema: {
      type: 'object',
      properties: {
        invoiceId: {
          type: 'string',
          description: 'UUID of the invoice',
        },
      },
      required: ['invoiceId'],
    },
  },
  {
    name: 'list_invoices',
    description: 'List invoices with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status (draft, sent, paid, overdue)',
        },
        jobId: {
          type: 'string',
          description: 'Filter by job ID',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 50)',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_notification',
    description: 'Create a notification for a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'UUID of the user to notify',
        },
        type: {
          type: 'string',
          description: 'Notification type (job_assigned, message_received, payment_received, etc.)',
        },
        title: {
          type: 'string',
          description: 'Notification title',
        },
        message: {
          type: 'string',
          description: 'Notification message',
        },
        link: {
          type: 'string',
          description: 'Optional link URL',
        },
      },
      required: ['userId', 'type', 'title', 'message'],
    },
  },
  {
    name: 'list_notifications',
    description: 'List notifications for a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'UUID of the user',
        },
        isRead: {
          type: 'boolean',
          description: 'Filter by read status (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 50)',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'create_call_log',
    description: 'Create a call log entry',
    inputSchema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'UUID of the contact',
        },
        jobId: {
          type: 'string',
          description: 'UUID of the job (optional)',
        },
        direction: {
          type: 'string',
          enum: ['inbound', 'outbound'],
          description: 'Call direction',
        },
        duration: {
          type: 'number',
          description: 'Call duration in seconds',
        },
        recordingUrl: {
          type: 'string',
          description: 'URL to call recording (optional)',
        },
        transcription: {
          type: 'string',
          description: 'Call transcription (optional)',
        },
        notes: {
          type: 'string',
          description: 'Notes about the call',
        },
      },
      required: ['contactId', 'direction', 'duration'],
    },
  },
  {
    name: 'get_job_analytics',
    description: 'Get analytics for jobs (revenue, counts, status breakdown)',
    inputSchema: {
      type: 'object',
      properties: {
        dateFrom: {
          type: 'string',
          description: 'ISO 8601 date to start from (optional)',
        },
        dateTo: {
          type: 'string',
          description: 'ISO 8601 date to end at (optional)',
        },
        status: {
          type: 'string',
          description: 'Filter by status (optional)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_revenue_analytics',
    description: 'Get revenue analytics grouped by date, tech, or status',
    inputSchema: {
      type: 'object',
      properties: {
        dateFrom: {
          type: 'string',
          description: 'ISO 8601 date to start from (optional)',
        },
        dateTo: {
          type: 'string',
          description: 'ISO 8601 date to end at (optional)',
        },
        groupBy: {
          type: 'string',
          enum: ['date', 'tech', 'status'],
          description: 'Group results by date, tech, or status',
        },
      },
      required: [],
    },
  },
  {
    name: 'send_review_request',
    description: 'Send a review request email to a contact after job completion',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'UUID of the completed job',
        },
        contactId: {
          type: 'string',
          description: 'UUID of the contact',
        },
      },
      required: ['jobId', 'contactId'],
    },
  },
  {
    name: 'list_job_photos',
    description: 'List photos for a specific job',
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
]

export async function handleCrmTool(
  name: string,
  args: Record<string, unknown>,
  userId?: string
): Promise<unknown> {
  const supabase = getSupabaseClient()
  const accountId = getAccountId()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  switch (name) {
    case 'create_job': {
      const { contactName, description, scheduledStart, scheduledEnd, techAssignedId } = args as {
        contactName: string
        description: string
        scheduledStart?: string
        scheduledEnd?: string
        techAssignedId?: string
      }

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
          Authorization: `Bearer ${serviceRoleKey}`,
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

    case 'search_contacts': {
      const { search } = args as { search: string }

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

    case 'get_job': {
      const { jobId } = args as { jobId: string }

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

    case 'update_job_status': {
      const { jobId, status } = args as { jobId: string; status: string }

      const statusRes = await fetch(`${supabaseUrl}/functions/v1/update-job-status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
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

    case 'assign_tech': {
      const { jobId, techName } = args as { jobId: string; techName: string }

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
          Authorization: `Bearer ${serviceRoleKey}`,
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

    case 'send_email': {
      const { to, subject, body, jobId } = args as {
        to: string
        subject: string
        body: string
        jobId?: string
      }

      // Use Resend API to send email
      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey) {
        return { error: 'Email service not configured' }
      }

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
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

    case 'get_user_email': {
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

    case 'create_contact': {
      const { email, firstName, lastName, phone, address } = args as {
        email: string
        firstName: string
        lastName?: string
        phone?: string
        address?: string
      }

      // Check if contact exists
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', email)
        .eq('account_id', accountId)
        .single()

      if (existing) {
        return {
          error: `Contact with email ${email} already exists`,
          contactId: existing.id,
        }
      }

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert({
          account_id: accountId,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          address,
        })
        .select()
        .single()

      if (error) {
        return { error: error.message }
      }

      return {
        success: true,
        contact,
        message: `Contact ${firstName} ${lastName || ''} created successfully`,
      }
    }

    case 'get_contact': {
      const { contactId } = args as { contactId: string }

      const { data: contact } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('account_id', accountId)
        .single()

      if (!contact) {
        return { error: 'Contact not found' }
      }

      return { contact }
    }

    case 'list_jobs': {
      const { status, techId, limit = 50, offset = 0 } = args as {
        status?: string
        techId?: string
        limit?: number
        offset?: number
      }

      let query = supabase
        .from('jobs')
        .select('*, contacts(*), users(*)')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status) {
        query = query.eq('status', status)
      }

      if (techId) {
        query = query.eq('tech_assigned_id', techId)
      }

      const { data: jobs, error } = await query

      if (error) {
        return { error: error.message }
      }

      return {
        jobs: jobs || [],
        count: jobs?.length || 0,
      }
    }

    case 'get_dashboard_stats': {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

      // Jobs stats
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)

      const { count: todayJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      const { count: completedJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .eq('status', 'completed')

      // Revenue stats
      const { data: allPayments } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('account_id', accountId)
        .eq('status', 'completed')

      const totalRevenue = allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      const todayRevenue =
        allPayments
          ?.filter((p) => {
            const paymentDate = new Date(p.created_at)
            return paymentDate >= today && paymentDate < tomorrow
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      const weekRevenue =
        allPayments
          ?.filter((p) => {
            const paymentDate = new Date(p.created_at)
            return paymentDate >= weekStart && paymentDate < weekEnd
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      const monthRevenue =
        allPayments
          ?.filter((p) => {
            const paymentDate = new Date(p.created_at)
            return paymentDate >= monthStart && paymentDate < monthEnd
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      // Contacts stats
      const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)

      const { count: newContactsThisMonth } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .gte('created_at', monthStart.toISOString())
        .lt('created_at', monthEnd.toISOString())

      // Outstanding invoices
      const { data: outstandingInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('account_id', accountId)
        .in('status', ['sent', 'overdue'])

      const outstandingAmount = outstandingInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

      return {
        jobs: {
          total: totalJobs || 0,
          today: todayJobs || 0,
          completed: completedJobs || 0,
        },
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          thisWeek: weekRevenue,
          thisMonth: monthRevenue,
        },
        contacts: {
          total: totalContacts || 0,
          newThisMonth: newContactsThisMonth || 0,
        },
        invoices: {
          outstanding: outstandingInvoices?.length || 0,
          outstandingAmount,
        },
      }
    }

    case 'create_invoice': {
      const { jobId, totalAmount, dueDate, notes } = args as {
        jobId: string
        totalAmount: number
        dueDate?: string
        notes?: string
      }

      // Verify job exists
      const { data: job } = await supabase
        .from('jobs')
        .select('id, contact_id')
        .eq('id', jobId)
        .eq('account_id', accountId)
        .single()

      if (!job) {
        return { error: 'Job not found' }
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          account_id: accountId,
          job_id: jobId,
          contact_id: job.contact_id,
          total_amount: totalAmount,
          status: 'draft',
          due_date: dueDate || null,
          notes: notes || null,
        })
        .select()
        .single()

      if (error) {
        return { error: error.message }
      }

      return {
        success: true,
        invoice,
        message: 'Invoice created successfully',
      }
    }

    case 'get_invoice': {
      const { invoiceId } = args as { invoiceId: string }

      const { data: invoice } = await supabase
        .from('invoices')
        .select('*, jobs(*), contacts(*)')
        .eq('id', invoiceId)
        .eq('account_id', accountId)
        .single()

      if (!invoice) {
        return { error: 'Invoice not found' }
      }

      return { invoice }
    }

    case 'list_invoices': {
      const { status, jobId, limit = 50 } = args as {
        status?: string
        jobId?: string
        limit?: number
      }

      let query = supabase
        .from('invoices')
        .select('*, jobs(*), contacts(*)')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status) {
        query = query.eq('status', status)
      }

      if (jobId) {
        query = query.eq('job_id', jobId)
      }

      const { data: invoices, error } = await query

      if (error) {
        return { error: error.message }
      }

      return {
        invoices: invoices || [],
        count: invoices?.length || 0,
      }
    }

    case 'create_notification': {
      const { userId, type, title, message, link } = args as {
        userId: string
        type: string
        title: string
        message: string
        link?: string
      }

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          account_id: accountId,
          user_id: userId,
          type,
          title,
          message,
          link: link || null,
          is_read: false,
        })
        .select()
        .single()

      if (error) {
        return { error: error.message }
      }

      return {
        success: true,
        notification,
        message: 'Notification created successfully',
      }
    }

    case 'list_notifications': {
      const { userId, isRead, limit = 50 } = args as {
        userId: string
        isRead?: boolean
        limit?: number
      }

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('account_id', accountId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (isRead !== undefined) {
        query = query.eq('is_read', isRead)
      }

      const { data: notifications, error } = await query

      if (error) {
        return { error: error.message }
      }

      const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

      return {
        notifications: notifications || [],
        count: notifications?.length || 0,
        unreadCount,
      }
    }

    case 'create_call_log': {
      const { contactId, jobId, direction, duration, recordingUrl, transcription, notes } = args as {
        contactId: string
        jobId?: string
        direction: string
        duration: number
        recordingUrl?: string
        transcription?: string
        notes?: string
      }

      const { data: callLog, error } = await supabase
        .from('call_logs')
        .insert({
          account_id: accountId,
          contact_id: contactId,
          job_id: jobId || null,
          direction,
          duration,
          recording_url: recordingUrl || null,
          transcription: transcription || null,
          notes: notes || null,
          status: 'completed',
        })
        .select()
        .single()

      if (error) {
        return { error: error.message }
      }

      return {
        success: true,
        callLog,
        message: 'Call log created successfully',
      }
    }

    case 'get_job_analytics': {
      const { dateFrom, dateTo, status } = args as {
        dateFrom?: string
        dateTo?: string
        status?: string
      }

      let query = supabase
        .from('jobs')
        .select('id, status, total_amount, created_at')
        .eq('account_id', accountId)

      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data: jobs, error } = await query

      if (error) {
        return { error: error.message }
      }

      const totalJobs = jobs?.length || 0
      const totalRevenue = jobs?.reduce((sum, j) => sum + (j.total_amount || 0), 0) || 0
      const avgValue = totalJobs > 0 ? Math.round(totalRevenue / totalJobs) : 0
      const completedCount = jobs?.filter((j) => j.status === 'completed').length || 0
      const paidCount = jobs?.filter((j) => j.status === 'paid').length || 0

      // Status breakdown
      const statusBreakdown: Record<string, number> = {}
      jobs?.forEach((job) => {
        statusBreakdown[job.status] = (statusBreakdown[job.status] || 0) + 1
      })

      return {
        totalJobs,
        totalRevenue,
        avgValue,
        completedCount,
        paidCount,
        statusBreakdown,
      }
    }

    case 'get_revenue_analytics': {
      const { dateFrom, dateTo, groupBy = 'date' } = args as {
        dateFrom?: string
        dateTo?: string
        groupBy?: 'date' | 'tech' | 'status'
      }

      let query = supabase
        .from('payments')
        .select('amount, created_at, jobs(tech_assigned_id, status)')
        .eq('account_id', accountId)
        .eq('status', 'completed')

      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }

      const { data: payments, error } = await query

      if (error) {
        return { error: error.message }
      }

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      let breakdown: Record<string, number> = {}

      if (groupBy === 'date') {
        payments?.forEach((payment) => {
          const date = new Date(payment.created_at).toISOString().split('T')[0]
          breakdown[date] = (breakdown[date] || 0) + (payment.amount || 0)
        })
      } else if (groupBy === 'tech') {
        payments?.forEach((payment) => {
          const techId = (payment.jobs as any)?.tech_assigned_id || 'unassigned'
          breakdown[techId] = (breakdown[techId] || 0) + (payment.amount || 0)
        })
      } else if (groupBy === 'status') {
        payments?.forEach((payment) => {
          const status = (payment.jobs as any)?.status || 'unknown'
          breakdown[status] = (breakdown[status] || 0) + (payment.amount || 0)
        })
      }

      return {
        totalRevenue,
        breakdown,
      }
    }

    case 'send_review_request': {
      const { jobId, contactId } = args as { jobId: string; contactId: string }

      // Get job and contact details
      const { data: job } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('id', jobId)
        .eq('account_id', accountId)
        .single()

      if (!job) {
        return { error: 'Job not found' }
      }

      if (job.status !== 'completed' && job.status !== 'paid') {
        return { error: 'Job must be completed or paid before sending review request' }
      }

      const { data: contact } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email')
        .eq('id', contactId)
        .eq('account_id', accountId)
        .single()

      if (!contact) {
        return { error: 'Contact not found' }
      }

      if (!contact.email) {
        return { error: 'Contact does not have an email address' }
      }

      // Get review request template
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('account_id', accountId)
        .eq('type', 'review_request')
        .eq('active', true)
        .limit(1)
        .single()

      let emailBody = template?.body_html || template?.body_text || ''
      const emailSubject = template?.subject || 'We\'d love your feedback!'

      // Replace template variables
      emailBody = emailBody
        .replace(/\{\{contact_name\}\}/g, `${contact.first_name} ${contact.last_name || ''}`.trim())
        .replace(/\{\{company_name\}\}/g, '317 Plumber')
        .replace(/\{\{job_id\}\}/g, jobId.substring(0, 8))
        .replace(/\{\{review_link\}\}/g, 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK')

      // Send email via Resend
      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey) {
        return { error: 'Email service not configured' }
      }

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CRM <noreply@317plumber.com>',
          to: [contact.email],
          subject: emailSubject,
          html: emailBody,
        }),
      })

      const emailData = await emailRes.json()

      if (!emailRes.ok) {
        return { error: emailData.message || 'Failed to send review request' }
      }

      return {
        success: true,
        messageId: emailData.id,
        message: `Review request sent to ${contact.email}`,
      }
    }

    case 'list_job_photos': {
      const { jobId } = args as { jobId: string }

      const { data: photos, error } = await supabase
        .from('job_photos')
        .select('*')
        .eq('account_id', accountId)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        return { error: error.message }
      }

      return {
        photos: photos || [],
        count: photos?.length || 0,
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

