/**
 * Auth Guard Higher-Order Component
 * Protects routes by checking authentication status
 * Requirement: 1.1, 1.3
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Server Component that guards routes based on auth status
 * Use in layout.tsx or page.tsx files
 */
export async function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/login',
}: AuthGuardProps) {
  const user = await getCurrentUser();

  // Check if authentication is required
  if (requireAuth && !user) {
    redirect(redirectTo);
  }

  // Check if admin access is required
  if (requireAdmin && user) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      redirect('/dashboard');
    }
  }

  return <>{children}</>;
}

/**
 * Utility function to check auth in Server Components
 */
export async function requireAuth(redirectTo: string = '/login') {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Utility function to check admin access in Server Components
 */
export async function requireAdmin(redirectTo: string = '/dashboard') {
  const user = await requireAuth();

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect(redirectTo);
  }

  return user;
}
