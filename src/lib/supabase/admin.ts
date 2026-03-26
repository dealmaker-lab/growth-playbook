import { createClient } from '@supabase/supabase-js';

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS — use only in server-side admin contexts.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in env vars.
 * Falls back to anon key with a console warning if service role is missing.
 */
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!serviceRoleKey) {
    console.warn(
      '[admin] SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key. ' +
        'Dashboard queries will fail if RLS blocks anon reads.'
    );
  }

  const key = serviceRoleKey || anonKey;
  if (!key) {
    throw new Error(
      'Missing both SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
