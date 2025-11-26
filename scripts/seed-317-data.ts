/**
 * Seed Script: 317 Plumber Test Data
 * 
 * Populates the database with realistic plumbing business data
 * for testing and demonstration purposes.
 * 
 * Usage: npx tsx scripts/seed-317-data.ts
 * 
 * Created: Nov 26, 2025
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role for seeding
)

// ============================================
// CONTACTS - Indianapolis area homeowners
// ============================================
const contacts = [
  {
    first_name: 'Mike',
    last_name: 'Henderson',
    email: 'mike.henderson@email.com',
    phone: '317-555-0101',
    address: '4521 Meridian St, Indianapolis, IN 46208',
    lead_source: 'google',
    profile: {
      family: 'Wife Sarah, two kids (Emma 8, Jake 12)',
      preferences: 'Prefers morning appointments, has a golden retriever named Max',
      notes: 'Long-time customer since 2019'
    }
  },
  {
    first_name: 'Jennifer',
    last_name: 'Walsh',
    email: 'jwalsh42@gmail.com',
    phone: '317-555-0102',
    address: '892 College Ave, Indianapolis, IN 46220',
    lead_source: 'referral',
    lead_source_detail: 'Referred by Mike Henderson',
    profile: {
      family: 'Single, works from home',
      preferences: 'Very detail-oriented, likes updates via text',
      notes: 'First-time customer'
    }
  },
  {
    first_name: 'Robert',
    last_name: 'Chen',
    email: 'rchen.indy@yahoo.com',
    phone: '317-555-0103',
    address: '1547 Washington Blvd, Indianapolis, IN 46205',
    lead_source: 'google',
    utm_campaign: 'water_heater_2024',
    profile: {
      family: 'Wife Lin, elderly mother lives with them',
      preferences: 'Needs accessible bathroom, budget-conscious',
      notes: 'House built in 1965, old plumbing'
    }
  },
  {
    first_name: 'Amanda',
    last_name: 'Torres',
    email: 'amanda.torres@outlook.com',
    phone: '317-555-0104',
    address: '3201 Fall Creek Pkwy, Indianapolis, IN 46205',
    lead_source: 'facebook',
    profile: {
      family: 'Husband Carlos, newborn baby',
      preferences: 'Very concerned about water quality for baby',
      notes: 'Emergency call - water damage'
    }
  },
  {
    first_name: 'David',
    last_name: 'Mitchell',
    email: 'dmitchell@businessmail.com',
    phone: '317-555-0105',
    address: '7845 Keystone Ave, Indianapolis, IN 46240',
    lead_source: 'google',
    profile: {
      family: 'Divorced, teenage daughter visits weekends',
      preferences: 'Saturday appointments only, very busy professional',
      notes: 'Owns rental properties too'
    }
  },
  {
    first_name: 'Lisa',
    last_name: 'Park',
    email: 'lisa.park.indy@gmail.com',
    phone: '317-555-0106',
    address: '2156 Broad Ripple Ave, Indianapolis, IN 46220',
    lead_source: 'yelp',
    profile: {
      family: 'Partner Kim, two cats',
      preferences: 'Eco-friendly options when available',
      notes: 'Restaurant owner - may need commercial work'
    }
  },
  {
    first_name: 'James',
    last_name: 'Wilson',
    email: 'jwilson.contractor@gmail.com',
    phone: '317-555-0107',
    address: '5432 Massachusetts Ave, Indianapolis, IN 46218',
    lead_source: 'contractor_referral',
    profile: {
      family: 'Wife Betty, grown kids',
      preferences: 'Retired contractor himself, knows the trade',
      notes: 'Main sewer line issues - older neighborhood'
    }
  }
]

// ============================================
// JOBS - Matching the photo assets
// ============================================
const jobs = [
  // Job 001 - General plumbing repair
  {
    contact_index: 0, // Mike Henderson
    description: 'Kitchen sink faucet replacement and garbage disposal repair',
    status: 'completed',
    scheduled_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    total_amount: 45000, // $450.00 in cents
    notes: 'Customer reported leaky faucet and disposal making grinding noise. Replaced both.',
    completion_notes: 'Installed new Moen faucet and InSinkErator disposal. Customer very happy.',
    photos: ['job-001-front-before.jpg', 'job-001-back-before.jpg', 'job-001-materials.jpg', 
             'job-001-work-progress.jpg', 'job-001-front-after.jpg', 'job-001-back-after.jpg']
  },
  // Job 002 - Water heater installation
  {
    contact_index: 2, // Robert Chen
    description: 'Water heater replacement - 50 gallon gas unit',
    status: 'completed',
    scheduled_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    total_amount: 185000, // $1,850.00
    notes: 'Old water heater from 2008 showing rust and inefficiency. Customer wants high-efficiency unit.',
    completion_notes: 'Installed new Rheem 50-gallon high-efficiency gas water heater. Explained new thermostat to customer.',
    photos: ['job-002-before-old-unit.jpg', 'job-002-problem-rust.jpg', 'job-002-materials-new-unit.jpg',
             'job-002-work-installation.jpg', 'job-002-safety-vent-check.jpg', 'job-002-after-installed.jpg',
             'job-002-front-complete.jpg']
  },
  // Job 003 - Drain clearing
  {
    contact_index: 1, // Jennifer Walsh
    description: 'Bathroom drain clearing - slow drain in master bath',
    status: 'completed',
    scheduled_start: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    total_amount: 22500, // $225.00
    notes: 'Slow drain in master bathroom sink and tub. Customer tried Drano with no luck.',
    completion_notes: 'Hair clog about 18 inches down. Used drain snake. Recommended drain guards.',
    photos: ['job-003-problem-clogged.jpg', 'job-003-work-drain-snake.jpg', 'job-003-materials-extracted.jpg',
             'job-003-after-cleared.jpg', 'job-003-front-complete.jpg']
  },
  // Job 004 - Emergency water damage
  {
    contact_index: 3, // Amanda Torres (emergency)
    description: 'EMERGENCY: Burst pipe and water damage mitigation',
    status: 'completed',
    scheduled_start: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    total_amount: 275000, // $2,750.00
    notes: 'EMERGENCY CALL 11:30 PM. Pipe burst in basement laundry room. Significant flooding. Baby in home.',
    completion_notes: 'Shut off water, repaired copper pipe (pinhole leak from age), extracted ~40 gallons water, set up 3 dehumidifiers. Referred to restoration company for drywall.',
    photos: ['job-004-problem-broken-pipe.jpg', 'job-004-problem-flooding.jpg', 'job-004-work-pipe-repair.jpg',
             'job-004-work-water-extraction.jpg', 'job-004-materials-drying-equipment.jpg', 'job-004-after-dry.jpg',
             'job-004-after-repair-complete.jpg', 'job-004-front-mitigation-complete.jpg']
  },
  // Job 005 - Toilet replacement
  {
    contact_index: 4, // David Mitchell
    description: 'Toilet replacement - master bathroom upgrade',
    status: 'completed',
    scheduled_start: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    total_amount: 65000, // $650.00
    notes: 'Customer wants to upgrade to a high-efficiency toilet. Current toilet running constantly.',
    completion_notes: 'Removed old American Standard, installed new Kohler Cimarron comfort height. Flapper was bad on old one.',
    photos: ['job-005-before-old-toilet.jpg', 'job-005-work-removal.jpg', 'job-005-materials-new-toilet.jpg',
             'job-005-work-installation.jpg', 'job-005-after-installed.jpg', 'job-005-front-complete.jpg']
  },
  // Job 006 - Sewer line inspection (scheduled for today)
  {
    contact_index: 6, // James Wilson
    description: 'Main sewer line camera inspection and hydro jetting',
    status: 'scheduled',
    scheduled_start: new Date().toISOString(), // Today
    total_amount: 89500, // $895.00 (estimate)
    notes: 'Customer reports slow drains throughout house. Suspects main line. Old neighborhood with clay pipes.',
    photos: ['job-006-problem-drain-issue.jpg', 'job-006-work-camera-setup.jpg', 'job-006-problem-roots.jpg',
             'job-006-work-hydro-jetting.jpg', 'job-006-after-cleared.jpg']
  },
  // Job 007 - Commercial grease trap (scheduled for tomorrow)
  {
    contact_index: 5, // Lisa Park (restaurant owner)
    description: 'Commercial grease trap cleaning - Broad Ripple Cafe',
    status: 'scheduled',
    scheduled_start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    total_amount: 45000, // $450.00
    notes: 'Quarterly grease trap cleaning. Restaurant closed Mondays - can do full cleaning.',
    photos: ['job-007-problem-grease-trap.jpg', 'job-007-safety-ppe.jpg', 'job-007-work-cleaning.jpg',
             'job-007-materials-extracted.jpg', 'job-007-after-cleaned.jpg', 'job-007-front-complete.jpg']
  }
]

// ============================================
// USERS - 317 Plumber team
// ============================================
const users = [
  {
    email: 'ryan@317plumber.com',
    full_name: 'Ryan Galbraith',
    role: 'owner'
  },
  {
    email: 'dispatch@317plumber.com',
    full_name: 'Sarah Johnson',
    role: 'dispatcher'
  },
  {
    email: 'tech1@317plumber.com',
    full_name: 'Marcus Williams',
    role: 'tech'
  },
  {
    email: 'tech2@317plumber.com',
    full_name: 'Jake Thompson',
    role: 'tech'
  },
  {
    email: 'sales@317plumber.com',
    full_name: 'Emily Davis',
    role: 'sales'
  }
]

// ============================================
// CONVERSATIONS - Sample messages
// ============================================
const conversations = [
  {
    contact_index: 0, // Mike Henderson
    subject: 'Follow-up on kitchen repair',
    status: 'closed',
    channel: 'email',
    messages: [
      {
        direction: 'inbound',
        sender_type: 'contact',
        body_text: 'Hey, just wanted to let you know the faucet and disposal are working great! Thanks for the quick service.',
      },
      {
        direction: 'outbound',
        sender_type: 'user',
        body_text: 'Thanks Mike! Glad everything is working well. Don\'t hesitate to reach out if you need anything else. - 317 Plumber',
      }
    ]
  },
  {
    contact_index: 3, // Amanda Torres
    subject: 'Emergency water damage - follow up',
    status: 'open',
    channel: 'sms',
    messages: [
      {
        direction: 'inbound',
        sender_type: 'contact',
        body_text: 'Hi, the restoration company came today. They said your team did a great job with the initial mitigation. Thank you so much for coming out at midnight!',
      },
      {
        direction: 'outbound',
        sender_type: 'user',
        body_text: 'So glad we could help Amanda! How is the baby doing with all the construction? Let us know if you need anything.',
      },
      {
        direction: 'inbound',
        sender_type: 'contact',
        body_text: 'She\'s fine, we\'re staying at my mom\'s for a few days. Can you send over the invoice when you get a chance?',
      }
    ]
  },
  {
    contact_index: 6, // James Wilson
    subject: 'Main line inspection appointment',
    status: 'open',
    channel: 'email',
    messages: [
      {
        direction: 'inbound',
        sender_type: 'contact',
        body_text: 'Confirming my appointment for today. I\'ll be home all day. The cleanout is on the east side of the house by the garage.',
      }
    ]
  }
]

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function seed() {
  console.log('🌱 Starting 317 Plumber data seed...\n')

  // 1. Get or create account
  console.log('1️⃣ Checking account...')
  let { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('slug', '317-plumber')
    .single()

  if (!account) {
    const { data: newAccount, error } = await supabase
      .from('accounts')
      .insert({
        name: '317 Plumber',
        slug: '317-plumber',
        google_review_link: 'https://g.page/317plumber/review',
        persona_config: {
          companyName: '317 Plumber',
          tone: 'friendly, professional',
          services: ['residential plumbing', 'commercial plumbing', 'water heaters', 'drain cleaning', 'emergency service']
        },
        settings: {
          timezone: 'America/Indiana/Indianapolis',
          businessHours: { start: '07:00', end: '18:00' },
          emergencyAfterHours: true
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create account:', error)
      return
    }
    account = newAccount
    console.log('   ✅ Created account:', account.id)
  } else {
    console.log('   ✅ Using existing account:', account.id)
  }

  // 2. Create contacts
  console.log('\n2️⃣ Creating contacts...')
  const contactIds: string[] = []
  
  for (const contact of contacts) {
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('account_id', account.id)
      .eq('email', contact.email)
      .single()

    if (existingContact) {
      contactIds.push(existingContact.id)
      console.log(`   ⏭️ Contact exists: ${contact.first_name} ${contact.last_name}`)
    } else {
      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert({
          account_id: account.id,
          ...contact
        })
        .select()
        .single()

      if (error) {
        console.error(`   ❌ Failed to create ${contact.email}:`, error.message)
        contactIds.push('') // placeholder
      } else {
        contactIds.push(newContact.id)
        console.log(`   ✅ Created: ${contact.first_name} ${contact.last_name}`)
      }
    }
  }

  // 3. Get or create tech user for job assignment
  console.log('\n3️⃣ Checking tech user for job assignment...')
  let { data: techUser } = await supabase
    .from('users')
    .select('id')
    .eq('account_id', account.id)
    .eq('role', 'tech')
    .limit(1)
    .single()

  if (!techUser) {
    console.log('   ⚠️ No tech user found - jobs will be unassigned')
  } else {
    console.log(`   ✅ Using tech user: ${techUser.id}`)
  }

  // 4. Create jobs
  console.log('\n4️⃣ Creating jobs...')
  const jobIds: string[] = []

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]
    const contactId = contactIds[job.contact_index]
    
    if (!contactId) {
      console.log(`   ⏭️ Skipping job ${i + 1} - no contact`)
      jobIds.push('')
      continue
    }

    // Check if job already exists (by description and contact)
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id')
      .eq('account_id', account.id)
      .eq('contact_id', contactId)
      .eq('description', job.description)
      .single()

    if (existingJob) {
      jobIds.push(existingJob.id)
      console.log(`   ⏭️ Job exists: ${job.description.substring(0, 40)}...`)
    } else {
      const { data: newJob, error } = await supabase
        .from('jobs')
        .insert({
          account_id: account.id,
          contact_id: contactId,
          description: job.description,
          status: job.status,
          scheduled_start: job.scheduled_start,
          total_amount: job.total_amount,
          notes: job.notes,
          completion_notes: job.completion_notes,
          tech_assigned_id: techUser?.id || null
        })
        .select()
        .single()

      if (error) {
        console.error(`   ❌ Failed job:`, error.message)
        jobIds.push('')
      } else {
        jobIds.push(newJob.id)
        console.log(`   ✅ Job ${i + 1}: ${job.description.substring(0, 50)}...`)
      }
    }
  }

  // 5. Create conversations and messages
  console.log('\n5️⃣ Creating conversations...')
  
  for (const convo of conversations) {
    const contactId = contactIds[convo.contact_index]
    if (!contactId) continue

    // Check if conversation exists
    const { data: existingConvo } = await supabase
      .from('conversations')
      .select('id')
      .eq('account_id', account.id)
      .eq('contact_id', contactId)
      .eq('subject', convo.subject)
      .single()

    if (existingConvo) {
      console.log(`   ⏭️ Conversation exists: ${convo.subject}`)
      continue
    }

    const { data: newConvo, error: convoError } = await supabase
      .from('conversations')
      .insert({
        account_id: account.id,
        contact_id: contactId,
        subject: convo.subject,
        status: convo.status,
        channel: convo.channel
      })
      .select()
      .single()

    if (convoError) {
      console.error(`   ❌ Conversation failed:`, convoError.message)
      continue
    }

    // Create messages
    for (const msg of convo.messages) {
      await supabase
        .from('messages')
        .insert({
          account_id: account.id,
          conversation_id: newConvo.id,
          direction: msg.direction,
          sender_type: msg.sender_type,
          body_text: msg.body_text
        })
    }

    console.log(`   ✅ Conversation: ${convo.subject} (${convo.messages.length} messages)`)
  }

  // 6. Summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 SEED COMPLETE!')
  console.log('='.repeat(50))
  console.log(`
📊 Summary:
   • Account: 317 Plumber (${account.id})
   • Contacts: ${contactIds.filter(Boolean).length} created
   • Jobs: ${jobIds.filter(Boolean).length} created
   • Conversations: ${conversations.length} created

📁 Photo Assets Location:
   /public/assets/317/317_assets/

🔐 Test Login (if user exists):
   Email: test@317plumber.com
   Password: TestPassword123!

💡 Next Steps:
   1. Create auth users in Supabase for each team member
   2. Link photos to jobs via the job_photos table
   3. Test the mobile dashboards with real data
`)
}

// Run the seed
seed().catch(console.error)

