/**
 * UHS-RIMS — Supabase Configuration
 * -----------------------------------------------------------
 * Fill in your own Supabase project values below.
 * Found in: Supabase Dashboard > Project Settings > API
 *
 * SUPABASE_URL    -> "Project URL"
 * SUPABASE_ANON_KEY -> "anon public" key (safe for frontend use,
 *                       access is controlled by Row Level Security)
 * -----------------------------------------------------------
 */
const SUPABASE_URL = "https://mffuhbgpjcjrhfgxpunu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZnVoYmdwamNqcmhmZ3hwdW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Nzk3ODksImV4cCI6MjA5ODQ1NTc4OX0.w208z2LafCsASCvxbOezjyJJLGT6pAXObZrvsUW2uDk";

// Single shared Supabase client instance (loaded via CDN script in each page)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
