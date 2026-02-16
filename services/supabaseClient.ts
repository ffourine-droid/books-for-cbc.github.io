
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bidwnzcyjgfwgzepskca.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZHduemN5amdmd2d6ZXBza2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODEyNzcsImV4cCI6MjA4NjQ1NzI3N30.m_ObeI1GqSBdg-k-mpoj5aOf8SAGWojbi4NuG-WVlc4";

let client: SupabaseClient | null = null;

try {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.error("Failed to initialize Supabase client:", err);
}

export const supabase = client;
