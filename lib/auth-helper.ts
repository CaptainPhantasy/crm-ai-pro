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

  // Use getUser() instead of getSession() for better security
  // getUser() validates the session with Supabase Auth, while getSession() just reads cookies
  const { data: { user }, error } = await supabase.auth.getUser()

  if (user && !error) {
    // Get the session to include the access token
    const { data: { session } } = await supabase.auth.getSession()
    return { user, session: session || { user, access_token: '' } }
  }

  return null
}

