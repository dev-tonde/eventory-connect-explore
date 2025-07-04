import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkSupabaseHealth } from "@/lib/supabaseOptimized";

interface HealthStatus {
  database: boolean;
  auth: boolean;
  functions: boolean;
  overall: boolean;
}

/**
 * Custom hook to check the health of Supabase services (database, auth, functions).
 * Returns health status, loading state, and a manual check function.
 */
export const useHealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus>({
    database: false,
    auth: false,
    functions: false,
    overall: false,
  });
  const [loading, setLoading] = useState(true);

  const checkHealth = useCallback(async () => {
    setLoading(true);

    try {
      // Check database connection
      const dbHealth = await checkSupabaseHealth();

      // Check auth service responsiveness
      let authHealth = false;
      try {
        const { data: session, error } = await supabase.auth.getSession();
        authHealth = !error;
      } catch {
        authHealth = false;
      }

      // Check edge functions (basic connectivity)
      let functionsHealth = true;
      try {
        await supabase.functions.invoke("health-check", { body: {} });
      } catch {
        functionsHealth = false;
      }

      const overallHealth = Boolean(dbHealth.healthy && authHealth);

      setHealth({
        database: Boolean(dbHealth.healthy),
        auth: authHealth,
        functions: functionsHealth,
        overall: overallHealth,
      });
    } catch (error) {
      console.error("Health check failed:", error);
      setHealth({
        database: false,
        auth: false,
        functions: false,
        overall: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();

    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  return { health, loading, checkHealth };
};
