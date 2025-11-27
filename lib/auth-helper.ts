import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function getAuthenticatedSession(request?: Request) {
  // Support Bearer token authentication
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        )
        const { data: { user }, error } = await supabaseClient.auth.getUser()
        if (user && !error) {
          return { user, session: { user, access_token: token } }
        } else {
          console.error('Supabase getUser error:', error)
        }
      } catch (err) {
        console.error('Error validating Bearer token:', err)

      }
    }
  }

  // Fallback to cookie-based authentication
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
          } catch { }
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return { user: session.user, session }
  }

  return null
}

