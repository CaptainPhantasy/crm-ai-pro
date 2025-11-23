import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseKey) {
      console.error('Seed API: Missing Supabase credentials')
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Create or get account
    let { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .eq('slug', '317plumber')
      .limit(1)

    let accountId: string
    if (!accounts || accounts.length === 0) {
      const { data: newAccount, error } = await supabase
        .from('accounts')
        .insert({
          name: '317 Plumber',
          slug: '317plumber',
          inbound_email_domain: 'reply.317plumber.com',
        })
        .select()
        .single()

      if (error) throw error
      accountId = newAccount.id
    } else {
      accountId = accounts[0].id
    }

    // 2. Create test contacts
    const contacts = [
      {
        account_id: accountId,
        email: 'john.smith@example.com',
        phone: '(317) 555-0101',
        first_name: 'John',
        last_name: 'Smith',
        address: '123 Main Street, Indianapolis, IN 46202',
      },
      {
        account_id: accountId,
        email: 'sarah.johnson@example.com',
        phone: '(317) 555-0102',
        first_name: 'Sarah',
        last_name: 'Johnson',
        address: '456 Oak Avenue, Carmel, IN 46032',
      },
      {
        account_id: accountId,
        email: 'mike.davis@example.com',
        phone: '(317) 555-0103',
        first_name: 'Mike',
        last_name: 'Davis',
        address: '789 Pine Road, Fishers, IN 46038',
      },
      {
        account_id: accountId,
        email: 'emily.wilson@example.com',
        phone: '(317) 555-0104',
        first_name: 'Emily',
        last_name: 'Wilson',
        address: '321 Elm Street, Indianapolis, IN 46220',
      },
      {
        account_id: accountId,
        email: 'david.brown@example.com',
        phone: '(317) 555-0105',
        first_name: 'David',
        last_name: 'Brown',
        address: '654 Maple Drive, Zionsville, IN 46077',
      },
    ]

    const contactIds: string[] = []
    for (const contact of contacts) {
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', contact.email)
        .eq('account_id', accountId)
        .single()

      if (existing) {
        contactIds.push(existing.id)
      } else {
        const { data: newContact, error } = await supabase
          .from('contacts')
          .insert(contact)
          .select()
          .single()

        if (!error && newContact) {
          contactIds.push(newContact.id)
        }
      }
    }

    // 3. Create test conversations
    const conversations = [
      {
        account_id: accountId,
        contact_id: contactIds[0],
        subject: 'Leaky faucet in kitchen',
        status: 'open',
        channel: 'email',
      },
      {
        account_id: accountId,
        contact_id: contactIds[1],
        subject: 'Water heater replacement needed',
        status: 'open',
        channel: 'email',
      },
      {
        account_id: accountId,
        contact_id: contactIds[2],
        subject: 'Emergency plumbing issue',
        status: 'open',
        channel: 'email',
      },
    ]

    const conversationIds: string[] = []
    for (const conv of conversations) {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('contact_id', conv.contact_id)
        .eq('subject', conv.subject)
        .limit(1)
        .single()

      if (existing) {
        conversationIds.push(existing.id)
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert(conv)
          .select()
          .single()

        if (!error && newConv) {
          conversationIds.push(newConv.id)
        }
      }
    }

    // 4. Create test jobs
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)

    const dayAfter = new Date(now)
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(10, 0, 0, 0)

    const jobs = [
      {
        account_id: accountId,
        contact_id: contactIds[0],
        conversation_id: conversationIds[0],
        description: 'Fix leaky kitchen faucet - hot water side not working properly',
        status: 'scheduled' as const,
        scheduled_start: tomorrow.toISOString(),
        scheduled_end: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        total_amount: 15000,
      },
      {
        account_id: accountId,
        contact_id: contactIds[1],
        conversation_id: conversationIds[1],
        description: 'Replace 50-gallon water heater - unit is 12 years old',
        status: 'scheduled' as const,
        scheduled_start: dayAfter.toISOString(),
        scheduled_end: new Date(dayAfter.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        total_amount: 120000,
      },
      {
        account_id: accountId,
        contact_id: contactIds[2],
        conversation_id: conversationIds[2],
        description: 'Emergency: Burst pipe in basement - water leaking',
        status: 'en_route' as const,
        scheduled_start: now.toISOString(),
        scheduled_end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        total_amount: 25000,
      },
      {
        account_id: accountId,
        contact_id: contactIds[3],
        description: 'Install new garbage disposal unit',
        status: 'completed' as const,
        scheduled_start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        scheduled_end: new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString(),
        total_amount: 18000,
      },
      {
        account_id: accountId,
        contact_id: contactIds[4],
        description: 'Drain cleaning service - slow drains in bathroom',
        status: 'in_progress' as const,
        scheduled_start: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        scheduled_end: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
        total_amount: 9500,
      },
    ]

    const jobIds: string[] = []
    for (const job of jobs) {
      // Check if job already exists (by description and contact)
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('contact_id', job.contact_id)
        .eq('description', job.description)
        .limit(1)
        .single()

      if (existing) {
        jobIds.push(existing.id)
      } else {
        const { data: newJob, error } = await supabase
          .from('jobs')
          .insert(job)
          .select()
          .single()

        if (!error && newJob) {
          jobIds.push(newJob.id)
        }
      }
    }

    // 5. Create test messages
    const messages = [
      {
        account_id: accountId,
        conversation_id: conversationIds[0],
        direction: 'inbound' as const,
        sender_type: 'contact' as const,
        subject: 'Leaky faucet in kitchen',
        body_text: 'Hi, I have a leaky faucet in my kitchen. The hot water side is not working properly. Can someone come take a look?',
      },
      {
        account_id: accountId,
        conversation_id: conversationIds[0],
        direction: 'outbound' as const,
        sender_type: 'user' as const,
        subject: 'Re: Leaky faucet in kitchen',
        body_text: 'Hi John, we can schedule you for tomorrow at 2pm. Does that work?',
      },
      {
        account_id: accountId,
        conversation_id: conversationIds[1],
        direction: 'inbound' as const,
        sender_type: 'contact' as const,
        subject: 'Water heater replacement needed',
        body_text: 'Our water heater is 12 years old and starting to leak. We need a replacement. What are your rates?',
      },
    ]

    for (const message of messages) {
      await supabase.from('messages').insert(message)
    }

    return NextResponse.json({
      success: true,
      summary: {
        account: accountId,
        contacts: contactIds.length,
        conversations: conversationIds.length,
        jobs: jobIds.length,
        messages: messages.length,
      }
    })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database', 
      details: error.message 
    }, { status: 500 })
  }
}

