// lib/supabaseClient.ts
// Consolidated browser-side Supabase client (singleton)
// Use this for ALL client-side Supabase operations:
// - OAuth login
// - Realtime subscriptions
// - Profile picture uploads
// - Any browser-side Supabase calls

import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Get the singleton browser-side Supabase client.
 * Reuses the same instance across the entire app to avoid
 * multiple GoTrue connections and auth state conflicts.
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}

/**
 * @deprecated Use getSupabaseClient() instead.
 * Kept for backward compatibility during migration.
 */
export const createSupabaseBrowserClient = getSupabaseClient
