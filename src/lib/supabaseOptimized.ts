import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Use direct Supabase configuration (avoid VITE_ env vars in Lovable)
const SUPABASE_URL = "https://yaihbkgojeuewdacmtje.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaWhia2dvamV1ZXdkYWNtdGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzUxMTMsImV4cCI6MjA2NTc1MTExM30.SUEAIV1nq_3q6z6oir5SqNUAF5cmacu14-bZdqaDcvY";

// Optimized Supabase client with connection pooling and custom settings
export const supabaseOptimized = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    db: {
      schema: "public",
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-client-info": "optimized-event-app",
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 2, // Reduce realtime load
      },
    },
  }
);

/**
 * Checks Supabase connection health by querying the 'events' table.
 * @returns {Promise<{ healthy: boolean; error?: unknown }>}
 */
export const checkSupabaseHealth = async (): Promise<{
  healthy: boolean;
  error?: unknown;
}> => {
  try {
    const { error } = await supabaseOptimized
      .from("events")
      .select("id")
      .limit(1);

    return { healthy: !error, error };
  } catch (error) {
    return { healthy: false, error };
  }
};
