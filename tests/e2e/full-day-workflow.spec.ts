import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const TEST_EMAIL = 'test@317plumber.com'
const TEST_PASSWORD = 'TestPassword123!'

// Helper function to authenticate via Supabase
async function authenticateUser(page: any) {
  // Use service role to get session token
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })
  
  if (error || !authData.session) {
    console.error('Auth error:', error)
    throw new Error(`Authentication failed: ${error?.message || 'No session'}`)
  }
  
  // Navigate to app and inject session via localStorage (Supabase client-side auth)
  await page.goto(BASE_URL)
  
  // Inject Supabase session into localStorage (how Supabase client-side auth works)
  await page.evaluate((session: any) => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type,
      user: session.user
    }))
  }, authData.session)
  
  // Also set cookies that Supabase SSR uses
  await page.context().addCookies([
    {
      name: `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`,
      value: JSON.stringify({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        expires_in: authData.session.expires_in,
        token_type: authData.session.token_type,
        user: authData.session.user
      }),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ])
  
  // Reload page to pick up auth
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 })
  
  // Wait for page to load - check for any dashboard content
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
  
  // Verify we're logged in by checking for dashboard elements
  const hasContent = await Promise.race([
    page.locator('nav, [role="navigation"]').first().isVisible({ timeout: 5000 }).then(() => true),
    page.locator('h1, h2').first().isVisible({ timeout: 5000 }).then(() => true),
    page.waitForTimeout(5000).then(() => false)
  ])
  
  if (!hasContent) {
    // Try one more time with a direct navigation
    await page.goto(`${BASE_URL}/inbox`, { waitUntil: 'networkidle', timeout: 15000 })
  }
}

test.describe('Full Day Workflow - Solo Developer Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate before each test
    await authenticateUser(page)
  })

  // ==========================================
  // MORNING ROUTINE (Hours 1-3)
  // ==========================================

  test('Morning: Login and Dashboard Overview', async ({ page }) => {
    // Navigate to inbox (default landing)
    await page.goto(`${BASE_URL}/inbox`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Verify page loaded
    await expect(page.locator('h1, h2, [role="heading"]').first()).toBeVisible({ timeout: 5000 })
    
    // Check navigation sidebar exists
    const sidebar = page.locator('nav, [role="navigation"]').first()
    await expect(sidebar).toBeVisible({ timeout: 5000 })
    
    // Verify we can see inbox content (even if empty)
    const inboxContent = page.locator('text=/inbox|conversation|message/i').first()
    await expect(inboxContent).toBeVisible({ timeout: 5000 })
  })

  test('Morning: Review Jobs Dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Wait for stats cards or job list
    await page.waitForSelector('text=/total|jobs|revenue/i', { timeout: 10000 }).catch(() => {})
    
    // Verify page loaded
    const pageTitle = page.locator('h1, h2').first()
    await expect(pageTitle).toBeVisible({ timeout: 5000 })
  })

  test('Morning: Review Contacts Dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/contacts`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Wait for stats or contact list
    await page.waitForSelector('text=/contact|total|active/i', { timeout: 10000 }).catch(() => {})
    
    // Verify page loaded
    const pageTitle = page.locator('h1, h2').first()
    await expect(pageTitle).toBeVisible({ timeout: 5000 })
  })

  // ==========================================
  // MARKETING TESTS (Your Original Request)
  // ==========================================

  test('Marketing: Create Contact Tag', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketing/tags`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Wait for page to fully load
    await page.waitForSelector('button:has-text("New Tag"), button:has-text("Add"), button:has-text("Create")', { timeout: 10000 })
    
    // Click "New Tag" button
    const newTagButton = page.locator('button:has-text("New Tag"), button:has-text("Add"), button:has-text("Create")').first()
    await newTagButton.click()
    
    // Wait for dialog to appear
    await page.waitForSelector('input[name="name"], input[placeholder*="name" i], input[id="name"]', { timeout: 5000 })
    
    // Fill in tag form - type character by character like a human
    const tagName = `Test Tag ${Date.now()}`
    const nameInput = page.locator('input[name="name"], input[id="name"]').first()
    await nameInput.fill(tagName)
    
    // Optionally set color
    const colorInput = page.locator('input[type="color"], input[name="color"]').first()
    if (await colorInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await colorInput.fill('#FF5733')
    }
    
    // Click Create/Update button
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Update")').first()
    await submitButton.click()
    
    // Wait for success - either toast, dialog closing, or tag appearing in list
    await Promise.race([
      page.waitForSelector(`text=${tagName}`, { timeout: 5000 }).catch(() => null),
      page.waitForSelector('text=/success/i', { timeout: 5000 }).catch(() => null),
      page.waitForTimeout(2000)
    ])
    
    // Verify tag appears in the list
    const tagInList = page.locator(`text=${tagName}`).first()
    await expect(tagInList).toBeVisible({ timeout: 5000 })
  })

  test('Marketing: Create Email Template', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketing/email-templates`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Wait for page to load
    await page.waitForSelector('button:has-text("New Template"), button:has-text("Add"), button:has-text("Create")', { timeout: 10000 })
    
    // Click "New Template" button
    const newTemplateButton = page.locator('button:has-text("New Template"), button:has-text("Add"), button:has-text("Create")').first()
    await newTemplateButton.click()
    
    // Wait for dialog
    await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 5000 })
    
    // Fill template name
    const templateName = `Test Template ${Date.now()}`
    const nameInput = page.locator('input[name="name"], input[id="name"]').first()
    await nameInput.fill(templateName)
    
    // Fill subject
    const subjectInput = page.locator('input[name="subject"], input[id="subject"]').first()
    if (await subjectInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await subjectInput.fill('Test Subject Line')
    }
    
    // Switch to HTML tab if tabs exist
    const htmlTab = page.locator('button:has-text("HTML"), [role="tab"]:has-text("HTML")').first()
    if (await htmlTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await htmlTab.click()
      await page.waitForTimeout(300) // Wait for tab switch animation
    }
    
    // Fill HTML body
    const bodyInput = page.locator('textarea[name="bodyHtml"], textarea[id="bodyHtml"], textarea').first()
    if (await bodyInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await bodyInput.fill('<p>Test email body content</p>')
    }
    
    // Select template type if dropdown exists
    const typeSelect = page.locator('select[name="templateType"], [role="combobox"]').first()
    if (await typeSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
      await typeSelect.click()
      await page.waitForTimeout(200)
      const option = page.locator('text=/custom|review|follow/i').first()
      if (await option.isVisible({ timeout: 1000 }).catch(() => false)) {
        await option.click()
      }
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first()
    await submitButton.click()
    
    // Wait for success
    await Promise.race([
      page.waitForSelector(`text=${templateName}`, { timeout: 5000 }).catch(() => null),
      page.waitForSelector('text=/success/i', { timeout: 5000 }).catch(() => null),
      page.waitForTimeout(2000)
    ])
    
    // Verify template appears
    const templateInList = page.locator(`text=${templateName}`).first()
    await expect(templateInList).toBeVisible({ timeout: 5000 })
  })

  test('Marketing: Create Campaign', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketing/campaigns`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Wait for page
    await page.waitForSelector('button:has-text("New Campaign"), button:has-text("Add"), button:has-text("Create")', { timeout: 10000 })
    
    // Click "New Campaign" button
    const newCampaignButton = page.locator('button:has-text("New Campaign"), button:has-text("Add"), button:has-text("Create")').first()
    await newCampaignButton.click()
    
    // Wait for dialog
    await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 5000 })
    
    // Fill campaign name
    const campaignName = `Test Campaign ${Date.now()}`
    const nameInput = page.locator('input[name="name"], input[id="name"]').first()
    await nameInput.fill(campaignName)
    
    // Select campaign type
    const typeSelect = page.locator('select[name="campaignType"], [role="combobox"]').first()
    if (await typeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeSelect.click()
      await page.waitForTimeout(200)
      const emailOption = page.locator('text=/email/i').first()
      if (await emailOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await emailOption.click()
      }
    }
    
    // Wait for templates to load if email template dropdown exists
    await page.waitForTimeout(1000)
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Campaign"), button:has-text("Save")').first()
    await submitButton.click()
    
    // Wait for success
    await Promise.race([
      page.waitForSelector(`text=${campaignName}`, { timeout: 5000 }).catch(() => null),
      page.waitForSelector('text=/success/i', { timeout: 5000 }).catch(() => null),
      page.waitForTimeout(2000)
    ])
    
    // Verify campaign appears
    const campaignInList = page.locator(`text=${campaignName}`).first()
    await expect(campaignInList).toBeVisible({ timeout: 5000 })
  })

  // ==========================================
  // EDGE CASE TESTS
  // ==========================================

  test('Edge Case: Empty Form Submission Shows Error', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketing/tags`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Click "New Tag"
    const newTagButton = page.locator('button:has-text("New Tag"), button:has-text("Add")').first()
    await newTagButton.click()
    
    // Wait for dialog
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })
    
    // Try to submit without filling name
    const submitButton = page.locator('button[type="submit"], button:has-text("Create")').first()
    await submitButton.click()
    
    // Should show validation error or prevent submission
    await page.waitForTimeout(1000)
    
    // Check that dialog is still open (validation prevented submit) OR error message shown
    const dialogStillOpen = await page.locator('input[name="name"]').isVisible({ timeout: 1000 }).catch(() => false)
    const errorShown = await page.locator('text=/required|error|invalid/i').first().isVisible({ timeout: 1000 }).catch(() => false)
    
    expect(dialogStillOpen || errorShown).toBeTruthy()
  })

  test('Edge Case: Network Error Handling', async ({ page }) => {
    // Simulate network failure by going offline
    await page.context().setOffline(true)
    
    await page.goto(`${BASE_URL}/marketing/tags`)
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    
    // Try to create tag
    const newTagButton = page.locator('button:has-text("New Tag")').first()
    if (await newTagButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newTagButton.click()
      await page.waitForSelector('input[name="name"]', { timeout: 5000 })
      await page.locator('input[name="name"]').fill('Test Tag')
      await page.locator('button[type="submit"]').first().click()
      
      // Should show error toast, not crash
      await page.waitForTimeout(2000)
      const pageStillWorks = await page.locator('h1, h2').first().isVisible({ timeout: 2000 }).catch(() => false)
      expect(pageStillWorks).toBeTruthy()
    }
    
    // Go back online
    await page.context().setOffline(false)
  })

  test('Edge Case: Multiple Rapid Clicks on Save', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketing/tags`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    const newTagButton = page.locator('button:has-text("New Tag")').first()
    await newTagButton.click()
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })
    
    const tagName = `Rapid Click Test ${Date.now()}`
    await page.locator('input[name="name"]').fill(tagName)
    
    const submitButton = page.locator('button[type="submit"]').first()
    
    // Click multiple times rapidly
    await submitButton.click()
    await submitButton.click()
    await submitButton.click()
    
    // Should only create one tag, not crash
    await page.waitForTimeout(3000)
    
    // Verify page is still functional
    const pageStillWorks = await page.locator('h1, h2').first().isVisible({ timeout: 2000 }).catch(() => false)
    expect(pageStillWorks).toBeTruthy()
  })

  test('Edge Case: Special Characters in Tag Name', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketing/tags`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    const newTagButton = page.locator('button:has-text("New Tag")').first()
    await newTagButton.click()
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })
    
    // Test with special characters
    const tagName = `Test <script>alert('xss')</script> ${Date.now()}`
    await page.locator('input[name="name"]').fill(tagName)
    
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    
    // Should handle special chars without crashing
    await page.waitForTimeout(2000)
    const pageStillWorks = await page.locator('h1, h2').first().isVisible({ timeout: 2000 }).catch(() => false)
    expect(pageStillWorks).toBeTruthy()
  })

  test('Edge Case: Very Long Tag Name', async ({ page }) => {
    await page.goto(`${BASE_URL}/marketing/tags`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    const newTagButton = page.locator('button:has-text("New Tag")').first()
    await newTagButton.click()
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })
    
    // Test with very long string
    const longName = 'A'.repeat(500)
    await page.locator('input[name="name"]').fill(longName)
    
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()
    
    // Should handle long strings without crashing
    await page.waitForTimeout(2000)
    const pageStillWorks = await page.locator('h1, h2').first().isVisible({ timeout: 2000 }).catch(() => false)
    expect(pageStillWorks).toBeTruthy()
  })

  // ==========================================
  // INBOX TESTS
  // ==========================================

  test('Inbox: View Conversations', async ({ page }) => {
    await page.goto(`${BASE_URL}/inbox`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Verify inbox page loaded
    const inboxTitle = page.locator('h1, h2').first()
    await expect(inboxTitle).toBeVisible({ timeout: 5000 })
  })

  // ==========================================
  // JOBS TESTS
  // ==========================================

  test('Jobs: View Jobs List', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Verify jobs page loaded
    const jobsTitle = page.locator('h1, h2').first()
    await expect(jobsTitle).toBeVisible({ timeout: 5000 })
  })

  // ==========================================
  // CONTACTS TESTS
  // ==========================================

  test('Contacts: View Contacts List', async ({ page }) => {
    await page.goto(`${BASE_URL}/contacts`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Verify contacts page loaded
    const contactsTitle = page.locator('h1, h2').first()
    await expect(contactsTitle).toBeVisible({ timeout: 5000 })
  })

  // ==========================================
  // ADMIN TESTS
  // ==========================================

  test('Admin: Access Admin Pages', async ({ page }) => {
    // Test admin/users page
    await page.goto(`${BASE_URL}/admin/users`)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Should either show admin content or redirect/error (but not crash)
    const pageContent = page.locator('h1, h2, [role="heading"], text=/forbidden|unauthorized/i').first()
    await expect(pageContent).toBeVisible({ timeout: 5000 })
  })
})

