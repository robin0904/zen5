/**
 * Supabase Utilities Index
 * Central export point for all Supabase-related utilities
 */

// Client exports
export { createClient as createBrowserClient, getClient } from './client';

// Server exports
export { createClient as createServerClient, createAdminClient } from './server';

// Auth helper exports
export {
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
  isAdmin,
  getUserProfile,
  signOut,
  onAuthStateChange,
  getUserId,
  userOwnsResource,
} from './auth-helpers';

// Type exports
export type { Database } from './types';
