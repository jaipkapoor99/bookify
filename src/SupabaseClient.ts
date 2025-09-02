import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.MODE !== "test") {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file.",
    );
  }
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);