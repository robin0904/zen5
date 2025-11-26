/**
 * Authentication Helper Functions
 * Utilities for checking auth state and user information
 * Requirements: 1.1, 1.3
 */

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Get current user from server-side
 * Use in Server Components, Route Handlers, Server Actions
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user:', error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Get current session from server-side
 * Use in Server Components, Route Handlers, Server Actions
 */
export async function getCurrentSession() {
  const supabase = await createServerClient();

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error.message);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error in getCurrentSession:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user is admin (server-side)
 * Queries the users table to check is_admin flag
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerClient();
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error.message);
      return false;
    }

    return data?.is_admin === true;
  } catch (error) {
    console.error('Error in isAdmin:', error);
    return false;
  }
}

/**
 * Get user profile data (server-side)
 * Returns full user profile from users table
 */
export async function getUserProfile() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error getting user profile:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

/**
 * Sign out user (can be used client or server side)
 */
export async function signOut() {
  // Try server-side first
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    // If server-side fails, try client-side
    console.error('Server-side signout failed, trying client-side:', error);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
  }
}

/**
 * Client-side auth state listener
 * Use in Client Components to listen for auth changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = createBrowserClient();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null);
    }
  );

  return subscription;
}

/**
 * Get user ID from session (server-side)
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Check if user owns a resource (server-side)
 * Useful for authorization checks
 */
export async function userOwnsResource(resourceUserId: string): Promise<boolean> {
  const userId = await getUserId();
  return userId === resourceUserId;
}
