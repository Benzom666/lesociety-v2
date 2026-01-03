/**
 * Supabase Client Singleton
 * Lazy initialization to avoid build-time errors
 */

import { createClient } from '@supabase/supabase-js';

let supabase = null;

export const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (typeof window === 'undefined') {
      // During SSR/build, return a mock to avoid crashes
      return null;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return supabase;
};
