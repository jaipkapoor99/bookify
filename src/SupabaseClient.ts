import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For testing, allow empty strings but throw in production
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.MODE !== 'test') {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }
}

export const supabase = createClient(supabaseUrl || 'http://localhost:54321', supabaseAnonKey || 'test-key');

// This function creates a new client instance specifically for the signup process.
// It is configured to NOT persist the user's session, so they are not
// automatically logged in after creating an account.
export function createSupabaseSignupClient() {
  return createClient(supabaseUrl || 'http://localhost:54321', supabaseAnonKey || 'test-key', {
    auth: {
      persistSession: false,
    },
  });
}
