import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client - Browser/Client-Side
 * Uses anon key, safe for client-side usage
 * Automatically handles user authentication state
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Supabase Client - Server-Side (Service Role)
 * Uses service role key, bypasses RLS
 * ONLY use for admin operations, migrations, and server actions
 * NEVER expose this client to the browser
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase service role environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Supabase Client - Server-Side (with user context)
 * Uses anon key but can be configured with user's JWT
 * Respects RLS policies for the authenticated user
 * Use this in API routes and server actions
 */
export function createServerClientWithAuth(accessToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (accessToken) {
    // Set the auth header for this request
    client.auth.setSession({ access_token: accessToken, refresh_token: '' });
  }

  return client;
}

/**
 * Database Types
 * Generate using: npx supabase gen types typescript --local > packages/supabase/src/types.ts
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: 'user' | 'admin';
          status: 'pending' | 'verified' | 'blocked' | 'deleted';
          gender: 'male' | 'female' | null;
          step_completed: number;
          age: number | null;
          tagline: string | null;
          description: string | null;
          country: string | null;
          province: string | null;
          city: string | null;
          location_name: string | null;
          latitude: number | null;
          longitude: number | null;
          looking_for: string | null;
          relationship_status: string | null;
          height: string | null;
          body_type: string | null;
          ethnicity: string | null;
          education: string | null;
          occupation: string | null;
          is_verified: boolean;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      // Add other table types as needed
    };
  };
};
