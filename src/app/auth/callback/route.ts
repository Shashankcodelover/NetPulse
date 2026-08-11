// ═══════════════════════════════════════════════════════
// Auth Callback — Handles OAuth redirect & email verification
// ═══════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure user_settings row exists for this user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('user_settings')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existing) {
          await supabase.from('user_settings').insert({
            user_id: user.id,
            scoring_weights: { recency_weight: 35, tier_weight: 25, title_weight: 20, engagement_weight: 20 },
            digest_count: 12,
            digest_email_time: '08:00',
            digest_email_enabled: false,
            cadence_priority_days: 3,
            cadence_warm_days: 30,
            cadence_cold_days: 90,
            target_companies: [],
            target_titles: ['Founder', 'CEO', 'CTO', 'VP', 'Director', 'Head of', 'Partner'],
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
