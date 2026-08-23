// ═══════════════════════════════════════════════════════
// Supabase Client — Server (Server Components, API Routes)
// ═══════════════════════════════════════════════════════

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co';
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const key = rawKey.length > 5 ? rawKey : 'placeholder-anon-key';

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be called from Server Components where
            // cookies can't be set. Ignore silently.
          }
        },
      },
    }
  );
}

// Admin client for server-side operations that bypass RLS
export async function createAdminClient() {
  const { createClient } = await import('@supabase/supabase-js');
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co';
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const key = rawKey.length > 5 ? rawKey : 'placeholder-service-key';
  return createClient(
    url,
    key
  );
}
