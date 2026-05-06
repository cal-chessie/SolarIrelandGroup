/**
 * Supabase Client — Solar Ireland
 *
 * Creates typed Supabase clients for use throughout the Next.js app.
 * - `createBrowserClient`: for client components (uses anon key)
 * - `createServerClient`: for server components / API routes
 *
 * Both gracefully handle missing env vars (returns null-ish client).
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/** Typed client for use in client components */
export const supabase = getSupabaseBrowserClient();
