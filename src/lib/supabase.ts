import { createClient } from "@supabase/supabase-js";

// Use direct Supabase configuration (avoid VITE_ env vars in Lovable)
const supabaseUrl = "https://yaihbkgojeuewdacmtje.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaWhia2dvamV1ZXdkYWNtdGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzUxMTMsImV4cCI6MjA2NTc1MTExM30.SUEAIV1nq_3q6z6oir5SqNUAF5cmacu14-bZdqaDcvY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
