// lib/supabase-browser.ts
// @deprecated — This file is kept only for backward compatibility.
// All browser-side Supabase usage should import from "@/lib/supabaseClient" instead.
// This re-exports the singleton client to avoid breaking any remaining references.

export { getSupabaseClient as createSupabaseBrowserClient } from './supabaseClient'
