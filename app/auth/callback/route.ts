/**
 * Auth Callback Route
 * Handles OAuth callback from providers like Google
 * Requirement: 1.1
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    if (data.user) {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Create profile if it doesn't exist (for OAuth users)
      if (!profile) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.name || data.user.email!.split('@')[0],
            avatar_url: data.user.user_metadata.avatar_url,
            streak: 0,
            coins: 0,
            xp: 0,
            interests: [],
            is_admin: false,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }
    }
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(`${origin}/dashboard`);
}
