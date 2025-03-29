import { createClient } from "@supabase/supabase-js"

// Environment variables are validated at build time
// This ensures they are available when the app is running
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Create a Supabase client using environment variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
})

// Creates a Supabase client for server components
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  })
}

// Creates a Supabase client for storage operations
export const createStorageClient = () => {
  const client = createClient(supabaseUrl, supabaseAnonKey)
  return client.storage
}
