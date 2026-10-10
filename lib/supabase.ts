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

import logger from './logger'

/**
 * Create Supabase Admin Client
 * ----------------------------
 * Uses SERVICE_ROLE_KEY for admin operations like deleting users.
 * ⚠️ NEVER expose this on the client side!
 * 
 * Supported env variables: SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, SECRET_SUPABASE_SERVICE_ROLE_KEY
 */
export function createSupabaseAdminClient() {
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SECRET_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    logger.error("Supabase Admin Client initialization failed: No service role/secret key configured.")
    throw new Error("Supabase service role key is not configured in environment variables.")
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
