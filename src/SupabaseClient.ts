import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For testing, allow empty strings but throw in production
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.MODE !== "test") {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file."
    );
  }
}

// Create a single client instance with config to avoid GoTrueClient conflicts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Keep true for auth flows
    autoRefreshToken: true, // Keep true for auth
    detectSessionInUrl: true, // Keep true for auth callbacks
  },
  global: {
    fetch: fetch.bind(globalThis), // Explicit fetch binding
  },
});

// Create a single dedicated client for non-auth database operations to avoid conflicts
let databaseClient: any = null;

export const createDatabaseClient = () => {
  if (!databaseClient) {
    databaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Avoid auth state conflicts
        autoRefreshToken: false, // Reduce background activity
        detectSessionInUrl: false, // Don't interfere with auth flows
      },
      global: {
        fetch: fetch.bind(globalThis), // Explicit fetch binding
      },
    });
  }
  return databaseClient;
};

// This function creates a new client instance specifically for the signup process.
// It is configured to NOT persist the user's session, so they are not
// automatically logged in after creating an account.
export function createSupabaseSignupClient() {
  return createClient(
    supabaseUrl || "http://localhost:54321",
    supabaseAnonKey || "test-key",
    {
      auth: {
        persistSession: false,
      },
    }
  );
}
