import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Environment variables not set — running in mock mode')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Set VITE_MOCK_AUTH=true in .env.local to bypass real Supabase auth during development.
// Remove the flag (or set it to false) when ready for production auth.
export const isMockMode =
  import.meta.env.VITE_MOCK_AUTH === 'true' || !supabaseUrl || !supabaseAnonKey
