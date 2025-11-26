/**
 * Client-side Supabase Client
 * For use in Client Components and browser-side code
 * Requirements: 1.1, 1.3
 */

import { createBrowserClient } from '@supabase/ssr';
import { getEnv } from '@/lib/env';

export function createClient() {
  return createBrowserClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  );
}

/**
 * Singleton instance for client-side usage
 * Reuses the same client instance across the application
 */
let client: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}
