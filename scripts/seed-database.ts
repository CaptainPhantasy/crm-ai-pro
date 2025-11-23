import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  try {
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
      console.log('✅ Created account:', accountId)
    } else {
      accountId = accounts[0].id
      console.log('✅ Using existing account:', accountId)
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
      // Check if contact exists
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', contact.email)
        .eq('account_id', accountId)
        .single()

      if (existing) {
        contactIds.push(existing.id)
        console.log(`✅ Contact exists: ${contact.first_name} ${contact.last_name}`)
      } else {
        const { data: newContact, error } = await supabase
          .from('contacts')
          .insert(contact)
          .select()
          .single()

        if (error) {
          console.error('Error creating contact:', error)
        } else {
          contactIds.push(newContact.id)
          console.log(`✅ Created contact: ${contact.first_name} ${contact.last_name}`)
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
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert(conv)
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
      } else {
        conversationIds.push(newConv.id)
        console.log(`✅ Created conversation: ${newConv.subject}`)
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
        total_amount: 15000, // $150.00
      },
      {
        account_id: accountId,
        contact_id: contactIds[1],
        conversation_id: conversationIds[1],
        description: 'Replace 50-gallon water heater - unit is 12 years old',
        status: 'scheduled' as const,
        scheduled_start: dayAfter.toISOString(),
        scheduled_end: new Date(dayAfter.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        total_amount: 120000, // $1,200.00
      },
      {
        account_id: accountId,
        contact_id: contactIds[2],
        conversation_id: conversationIds[2],
        description: 'Emergency: Burst pipe in basement - water leaking',
        status: 'en_route' as const,
        scheduled_start: now.toISOString(),
        scheduled_end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        total_amount: 25000, // $250.00
      },
      {
        account_id: accountId,
        contact_id: contactIds[3],
        description: 'Install new garbage disposal unit',
        status: 'completed' as const,
        scheduled_start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        scheduled_end: new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString(),
        total_amount: 18000, // $180.00
      },
      {
        account_id: accountId,
        contact_id: contactIds[4],
        description: 'Drain cleaning service - slow drains in bathroom',
        status: 'in_progress' as const,
        scheduled_start: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        scheduled_end: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
        total_amount: 9500, // $95.00
      },
    ]

    for (const job of jobs) {
      const { data: newJob, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single()

      if (error) {
        console.error('Error creating job:', error)
      } else {
        console.log(`✅ Created job: ${job.description} (${job.status})`)
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
        body_html: '<p>Hi, I have a leaky faucet in my kitchen. The hot water side is not working properly. Can someone come take a look?</p>',
      },
      {
        account_id: accountId,
        conversation_id: conversationIds[0],
        direction: 'outbound' as const,
        sender_type: 'user' as const,
        subject: 'Re: Leaky faucet in kitchen',
        body_text: 'Hi John, we can schedule you for tomorrow at 2pm. Does that work?',
        body_html: '<p>Hi John, we can schedule you for tomorrow at 2pm. Does that work?</p>',
      },
      {
        account_id: accountId,
        conversation_id: conversationIds[1],
        direction: 'inbound' as const,
        sender_type: 'contact' as const,
        subject: 'Water heater replacement needed',
        body_text: 'Our water heater is 12 years old and starting to leak. We need a replacement. What are your rates?',
        body_html: '<p>Our water heater is 12 years old and starting to leak. We need a replacement. What are your rates?</p>',
      },
    ]

    for (const message of messages) {
      const { error } = await supabase
        .from('messages')
        .insert(message)

      if (error) {
        console.error('Error creating message:', error)
      } else {
        console.log(`✅ Created message in conversation`)
      }
    }

    console.log('\n🎉 Database seeding complete!')
    console.log(`\n📊 Summary:`)
    console.log(`   - Account: 317 Plumber`)
    console.log(`   - Contacts: ${contactIds.length}`)
    console.log(`   - Conversations: ${conversationIds.length}`)
    console.log(`   - Jobs: ${jobs.length}`)
    console.log(`   - Messages: ${messages.length}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()

