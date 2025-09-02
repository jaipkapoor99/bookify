import { createClient } from '@supabase/supabase-js';
import { ENV_VARS } from './constants';

const supabaseUrl = import.meta.env[ENV_VARS.SUPABASE_URL];
const supabaseAnonKey = import.meta.env[ENV_VARS.SUPABASE_ANON_KEY];

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.MODE !== 'test') {
    throw new Error('Missing Supabase environment variables');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

