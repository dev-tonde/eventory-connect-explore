import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Use environment variables for credentials (never hardcode secrets)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

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
