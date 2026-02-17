// lib/supabase.ts
import { createServerClient} from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies() // read cookies from incoming request

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll() // array of cookies sent by browser
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignore if called in server component
          }
        },
      },
    }
  )
}

/**
 * Create Supabase Admin Client
 * ----------------------------
 * Uses SERVICE_ROLE_KEY for admin operations like deleting users.
 * ⚠️ NEVER expose this on the client side!
 * 
 * Required env variable: SECRET_SUPABASE_SERVICE_ROLE_KEY
 */
export function createSupabaseAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SECRET_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
