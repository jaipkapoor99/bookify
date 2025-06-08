import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_BASE_URI;
const supabaseAnonKey = import.meta.env.VITE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This function creates a new client instance specifically for the signup process.
// It is configured to NOT persist the user's session, so they are not
// automatically logged in after creating an account.
export const createSupabaseSignupClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};
