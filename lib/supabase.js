import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Konfigurasi Supabase frontend belum lengkap.");
}

// Untuk komponen yang import { supabase }
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Untuk komponen yang import { createClient }
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}