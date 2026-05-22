import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function normalizeSupabaseUrl(url) {
  return String(url || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl);
const normalizedSupabaseAnonKey = String(supabaseAnonKey || '').trim();

export const hasSupabaseConfig = Boolean(normalizedSupabaseUrl && normalizedSupabaseAnonKey);

let client = null;
let clientError = '';

if (hasSupabaseConfig) {
  try {
    client = createClient(normalizedSupabaseUrl, normalizedSupabaseAnonKey);
  } catch (error) {
    clientError = error instanceof Error ? error.message : String(error);
  }
}

export const supabase = client;
export const supabaseConfigError = clientError;
