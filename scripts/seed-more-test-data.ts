import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seedMoreTestData() {
  console.log('🔍 Agent 4: Adding More Test Data\n')

  // Get account
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('slug', '317plumber')
    .limit(1)

  if (!accounts || accounts.length === 0) {
    console.log('❌ No account found')
    return
  }

  const accountId = accounts[0].id
  console.log(`✅ Using account: ${accountId}\n`)

  // Add more contacts
  console.log('1. Adding more contacts...')
  const newContacts = [
    { email: 'alice.martin@example.com', first_name: 'Alice', last_name: 'Martin', phone: '(317) 555-0201' },
    { email: 'bob.thompson@example.com', first_name: 'Bob', last_name: 'Thompson', phone: '(317) 555-0202' },
    { email: 'carol.white@example.com', first_name: 'Carol', last_name: 'White', phone: '(317) 555-0203' },
    { email: 'david.garcia@example.com', first_name: 'David', last_name: 'Garcia', phone: '(317) 555-0204' },
    { email: 'eve.rodriguez@example.com', first_name: 'Eve', last_name: 'Rodriguez', phone: '(317) 555-0205' },
  ]

  const contactIds: string[] = []
  for (const contact of newContacts) {
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', contact.email)
      .eq('account_id', accountId)
      .single()

    if (existing) {
      contactIds.push(existing.id)
      console.log(`   ⏭️  Contact exists: ${contact.first_name} ${contact.last_name}`)
    } else {
      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert({
          account_id: accountId,
          ...contact,
        })
        .select()
        .single()

      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
      } else {
        contactIds.push(newContact.id)
        console.log(`   ✅ Created: ${contact.first_name} ${contact.last_name}`)
      }
    }
  }

  // Add more jobs
  console.log('\n2. Adding more jobs...')
  const now = new Date()
  const jobs = [
    {
      contact_id: contactIds[0],
      description: 'Install new bathroom sink faucet',
      status: 'scheduled' as const,
      scheduled_start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: 25000,
    },
    {
      contact_id: contactIds[1],
      description: 'Repair broken garbage disposal',
      status: 'scheduled' as const,
      scheduled_start: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: 18000,
    },
    {
      contact_id: contactIds[2],
      description: 'Annual water heater maintenance',
      status: 'scheduled' as const,
      scheduled_start: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: 12000,
    },
  ]

  let jobsCreated = 0
  for (const job of jobs) {
    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert({
        account_id: accountId,
        ...job,
      })
      .select()
      .single()

    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
    } else {
      jobsCreated++
      console.log(`   ✅ Created job: ${job.description}`)
    }
  }

  // Add conversations
  console.log('\n3. Adding conversations...')
  const conversations = [
    {
      contact_id: contactIds[0],
      subject: 'Bathroom sink installation inquiry',
      status: 'open' as const,
    },
    {
      contact_id: contactIds[1],
      subject: 'Garbage disposal repair needed',
      status: 'open' as const,
    },
  ]

  let convsCreated = 0
  for (const conv of conversations) {
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        account_id: accountId,
        ...conv,
      })
      .select()
      .single()

    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
    } else {
      convsCreated++
      console.log(`   ✅ Created conversation: ${conv.subject}`)
    }
  }

  console.log(`\n✅ Summary:`)
  console.log(`   Contacts: ${contactIds.length} processed`)
  console.log(`   Jobs: ${jobsCreated} created`)
  console.log(`   Conversations: ${convsCreated} created`)
}

seedMoreTestData().catch(console.error)

