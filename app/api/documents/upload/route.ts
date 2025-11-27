import { NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth-helper'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/documents/upload
 * Upload a document to a job
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const jobId = formData.get('jobId') as string
    const type = formData.get('type') as string
    const caption = formData.get('caption') as string | null

    if (!file || !jobId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: file, jobId, type' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
        global: {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        },
      }
    )

    // Verify job exists and get account_id
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('account_id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${jobId}/${type}/${timestamp}-${sanitizedName}`

    // Use service role client for storage operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('job-documents')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload document', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('job-documents')
      .getPublicUrl(filename)

    // Create thumbnail URL for images
    let thumbnailUrl = null
    if (file.type.startsWith('image/')) {
      thumbnailUrl = urlData.publicUrl // Can be enhanced with actual thumbnail generation
    }

    // Store document reference in database
    const { data: document, error: documentError } = await supabase
      .from('job_documents')
      .insert({
        account_id: job.account_id,
        job_id: jobId,
        type,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: filename,
        public_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        caption: caption || null,
        uploaded_by: session.user.id,
      })
      .select()
      .single()

    if (documentError) {
      console.error('Error creating document record:', documentError)
      // Try to clean up uploaded file
      await supabaseAdmin.storage.from('job-documents').remove([filename])
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    return NextResponse.json({ success: true, document }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error in POST /api/documents/upload:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
