/**
 * Test Data Seeder
 *
 * Creates deterministic test data for AI agents.
 * Data is predictable - tests know exactly what to expect.
 *
 * Design Principles:
 * 1. IDEMPOTENT - Running multiple times produces same result
 * 2. DETERMINISTIC - Same data every time, predictable assertions
 * 3. ISOLATED - Test account separate from production data
 * 4. COMPLETE - All user roles and relationships created
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { TEST_USERS, TEST_ACCOUNT_SLUG } from './environment-validator'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

export interface TestDataIds {
  accountId: string
  userIds: Record<string, string>
  contactIds: string[]
  jobIds: string[]
  conversationIds: string[]
}

export class TestDataSeeder {
  private supabase: SupabaseClient
  private ids: TestDataIds = {
    accountId: '',
    userIds: {},
    contactIds: [],
    jobIds: [],
    conversationIds: [],
  }

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('TestDataSeeder requires SUPABASE_URL and SERVICE_ROLE_KEY')
    }

    this.supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  /**
   * Seed all test data
   * Idempotent - safe to run multiple times
   */
  async seed(): Promise<TestDataIds> {
    console.log('\n🌱 Seeding test data...\n')

    // 1. Create test account
    await this.createTestAccount()

    // 2. Create test users
    await this.createTestUsers()

    // 3. Create test contacts
    await this.createTestContacts()

    // 4. Create test jobs
    await this.createTestJobs()

    // 5. Create test conversations (optional)
    await this.createTestConversations()

    console.log('\n✅ Test data seeded successfully!')
    console.log('\nCreated IDs:')
    console.log(`  Account: ${this.ids.accountId}`)
    console.log(`  Users: ${Object.keys(this.ids.userIds).join(', ')}`)
    console.log(`  Contacts: ${this.ids.contactIds.length}`)
    console.log(`  Jobs: ${this.ids.jobIds.length}`)
    console.log(`  Conversations: ${this.ids.conversationIds.length}`)

    return this.ids
  }

  private async createTestAccount(): Promise<void> {
    console.log('📋 Creating test account...')

    // Check if exists
    const { data: existing } = await this.supabase
      .from('accounts')
      .select('id')
      .eq('slug', TEST_ACCOUNT_SLUG)
      .single()

    if (existing) {
      console.log(`  ✓ Account already exists: ${existing.id}`)
      this.ids.accountId = existing.id
      return
    }

    // Create new
    const { data: account, error } = await this.supabase
      .from('accounts')
      .insert({
        name: 'Test 317 Plumber',
        slug: TEST_ACCOUNT_SLUG,
        inbound_email_domain: 'test.reply.317plumber.com',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create test account: ${error.message}`)
    }

    console.log(`  ✓ Account created: ${account.id}`)
    this.ids.accountId = account.id
  }

  private async createTestUsers(): Promise<void> {
    console.log('\n👥 Creating test users...')

    for (const user of TEST_USERS) {
      // Check if auth user exists
      const { data: authUsers } = await this.supabase.auth.admin.listUsers()
      const existingAuth = authUsers?.users?.find(u => u.email === user.email)

      let authUserId: string

      if (existingAuth) {
        console.log(`  ✓ Auth user exists: ${user.email}`)
        authUserId = existingAuth.id

        // Update password to ensure it matches
        await this.supabase.auth.admin.updateUserById(authUserId, {
          password: user.password,
        })
      } else {
        // Create auth user
        const { data: newUser, error } = await this.supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: `Test ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`,
          },
        })

        if (error) {
          throw new Error(`Failed to create auth user ${user.email}: ${error.message}`)
        }

        console.log(`  ✓ Auth user created: ${user.email}`)
        authUserId = newUser.user.id
      }

      // Check if public user exists
      const { data: existingPublic } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', authUserId)
        .single()

      if (existingPublic) {
        // Update role
        await this.supabase
          .from('users')
          .update({ role: user.role, account_id: this.ids.accountId })
          .eq('id', authUserId)
        console.log(`  ✓ Public user updated: ${user.role}`)
      } else {
        // Create public user
        const { error } = await this.supabase.from('users').insert({
          id: authUserId,
          account_id: this.ids.accountId,
          role: user.role,
          full_name: `Test ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`,
        })

        if (error) {
          throw new Error(`Failed to create public user ${user.email}: ${error.message}`)
        }

        console.log(`  ✓ Public user created: ${user.role}`)
      }

      this.ids.userIds[user.role] = authUserId
    }
  }

  private async createTestContacts(): Promise<void> {
    console.log('\n📇 Creating test contacts...')

    const testContacts = [
      {
        email: 'john.smith@test.com',
        first_name: 'John',
        last_name: 'Smith',
        phone: '(317) 555-0001',
        address: '123 Main St, Indianapolis, IN 46201',
      },
      {
        email: 'jane.doe@test.com',
        first_name: 'Jane',
        last_name: 'Doe',
        phone: '(317) 555-0002',
        address: '456 Oak Ave, Indianapolis, IN 46202',
      },
      {
        email: 'bob.wilson@test.com',
        first_name: 'Bob',
        last_name: 'Wilson',
        phone: '(317) 555-0003',
        address: '789 Pine St, Indianapolis, IN 46203',
      },
      {
        email: 'alice.brown@test.com',
        first_name: 'Alice',
        last_name: 'Brown',
        phone: '(317) 555-0004',
        address: '321 Elm Dr, Indianapolis, IN 46204',
      },
      {
        email: 'charlie.davis@test.com',
        first_name: 'Charlie',
        last_name: 'Davis',
        phone: '(317) 555-0005',
        address: '654 Cedar Ln, Indianapolis, IN 46205',
      },
    ]

    for (const contact of testContacts) {
      // Check if exists
      const { data: existing } = await this.supabase
        .from('contacts')
        .select('id')
        .eq('email', contact.email)
        .eq('account_id', this.ids.accountId)
        .single()

      if (existing) {
        console.log(`  ✓ Contact exists: ${contact.email}`)
        this.ids.contactIds.push(existing.id)
        continue
      }

      // Create
      const { data: newContact, error } = await this.supabase
        .from('contacts')
        .insert({
          ...contact,
          account_id: this.ids.accountId,
        })
        .select()
        .single()

      if (error) {
        console.error(`  ✗ Failed to create contact ${contact.email}: ${error.message}`)
        continue
      }

      console.log(`  ✓ Contact created: ${contact.email}`)
      this.ids.contactIds.push(newContact.id)
    }
  }

  private async createTestJobs(): Promise<void> {
    console.log('\n🔧 Creating test jobs...')

    if (this.ids.contactIds.length === 0) {
      console.log('  ⚠ No contacts available for jobs')
      return
    }

    const jobStatuses = ['scheduled', 'in_progress', 'completed', 'scheduled', 'scheduled']
    const jobPriorities = ['high', 'medium', 'low', 'urgent', 'medium']
    const jobDescriptions = [
      'Water heater replacement - 50 gallon electric',
      'Leaky faucet repair in master bathroom',
      'Clogged kitchen drain - needs snaking',
      'Annual plumbing inspection',
      'Install new garbage disposal',
    ]

    const techUserId = this.ids.userIds['tech']

    for (let i = 0; i < Math.min(5, this.ids.contactIds.length); i++) {
      const contactId = this.ids.contactIds[i]

      // Check if job exists for this contact
      const { data: existing } = await this.supabase
        .from('jobs')
        .select('id')
        .eq('contact_id', contactId)
        .eq('description', jobDescriptions[i])
        .eq('account_id', this.ids.accountId)
        .single()

      if (existing) {
        console.log(`  ✓ Job exists for contact ${i + 1}`)
        this.ids.jobIds.push(existing.id)
        continue
      }

      // Create job
      const { data: job, error } = await this.supabase
        .from('jobs')
        .insert({
          account_id: this.ids.accountId,
          contact_id: contactId,
          description: jobDescriptions[i],
          status: jobStatuses[i],
          priority: jobPriorities[i],
          scheduled_start: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
          assigned_tech_id: techUserId || null,
        })
        .select()
        .single()

      if (error) {
        console.error(`  ✗ Failed to create job: ${error.message}`)
        continue
      }

      console.log(`  ✓ Job created: ${job.id}`)
      this.ids.jobIds.push(job.id)
    }
  }

  private async createTestConversations(): Promise<void> {
    console.log('\n💬 Creating test conversations...')

    if (this.ids.contactIds.length === 0) {
      console.log('  ⚠ No contacts available for conversations')
      return
    }

    // Create one conversation per contact (first 3)
    for (let i = 0; i < Math.min(3, this.ids.contactIds.length); i++) {
      const contactId = this.ids.contactIds[i]

      // Check if conversation exists
      const { data: existing } = await this.supabase
        .from('conversations')
        .select('id')
        .eq('contact_id', contactId)
        .eq('account_id', this.ids.accountId)
        .limit(1)
        .single()

      if (existing) {
        console.log(`  ✓ Conversation exists for contact ${i + 1}`)
        this.ids.conversationIds.push(existing.id)
        continue
      }

      // Create conversation
      const { data: conversation, error } = await this.supabase
        .from('conversations')
        .insert({
          account_id: this.ids.accountId,
          contact_id: contactId,
          channel: 'email',
          status: 'open',
          subject: `Test conversation ${i + 1}`,
        })
        .select()
        .single()

      if (error) {
        console.error(`  ✗ Failed to create conversation: ${error.message}`)
        continue
      }

      console.log(`  ✓ Conversation created: ${conversation.id}`)
      this.ids.conversationIds.push(conversation.id)

      // Add a test message
      await this.supabase.from('messages').insert({
        conversation_id: conversation.id,
        account_id: this.ids.accountId,
        content: `This is test message ${i + 1} for automated testing.`,
        direction: 'inbound',
        channel: 'email',
      })
    }
  }

  /**
   * Clean up all test data
   * Use this to reset test environment
   */
  async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test data...')

    // Delete in reverse order of creation (respect foreign keys)

    // Messages
    if (this.ids.conversationIds.length > 0) {
      await this.supabase
        .from('messages')
        .delete()
        .in('conversation_id', this.ids.conversationIds)
      console.log('  ✓ Messages deleted')
    }

    // Conversations
    if (this.ids.conversationIds.length > 0) {
      await this.supabase
        .from('conversations')
        .delete()
        .in('id', this.ids.conversationIds)
      console.log('  ✓ Conversations deleted')
    }

    // Jobs
    if (this.ids.jobIds.length > 0) {
      await this.supabase.from('jobs').delete().in('id', this.ids.jobIds)
      console.log('  ✓ Jobs deleted')
    }

    // Contacts
    if (this.ids.contactIds.length > 0) {
      await this.supabase.from('contacts').delete().in('id', this.ids.contactIds)
      console.log('  ✓ Contacts deleted')
    }

    // Users (public)
    const userIds = Object.values(this.ids.userIds)
    if (userIds.length > 0) {
      await this.supabase.from('users').delete().in('id', userIds)
      console.log('  ✓ Public users deleted')

      // Auth users
      for (const userId of userIds) {
        await this.supabase.auth.admin.deleteUser(userId)
      }
      console.log('  ✓ Auth users deleted')
    }

    // Account
    if (this.ids.accountId) {
      await this.supabase.from('accounts').delete().eq('id', this.ids.accountId)
      console.log('  ✓ Account deleted')
    }

    console.log('\n✅ Test data cleanup complete!')
  }
}

/**
 * Get deterministic test data for assertions
 * AI agents can use these to verify expected state
 */
export const expectedTestData = {
  contacts: [
    { email: 'john.smith@test.com', first_name: 'John', last_name: 'Smith' },
    { email: 'jane.doe@test.com', first_name: 'Jane', last_name: 'Doe' },
    { email: 'bob.wilson@test.com', first_name: 'Bob', last_name: 'Wilson' },
    { email: 'alice.brown@test.com', first_name: 'Alice', last_name: 'Brown' },
    { email: 'charlie.davis@test.com', first_name: 'Charlie', last_name: 'Davis' },
  ],

  jobs: [
    { description: 'Water heater replacement - 50 gallon electric', status: 'scheduled', priority: 'high' },
    { description: 'Leaky faucet repair in master bathroom', status: 'in_progress', priority: 'medium' },
    { description: 'Clogged kitchen drain - needs snaking', status: 'completed', priority: 'low' },
    { description: 'Annual plumbing inspection', status: 'scheduled', priority: 'urgent' },
    { description: 'Install new garbage disposal', status: 'scheduled', priority: 'medium' },
  ],

  users: TEST_USERS,
  accountSlug: TEST_ACCOUNT_SLUG,
}

// Run if executed directly
if (require.main === module) {
  const seeder = new TestDataSeeder()

  const command = process.argv[2]

  if (command === 'cleanup') {
    seeder.seed().then(() => seeder.cleanup())
  } else {
    seeder.seed().catch(console.error)
  }
}
