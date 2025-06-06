import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_BASE_URI,
  import.meta.env.VITE_API_KEY
);
