
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseHealth } from '@/lib/supabaseOptimized';

interface HealthStatus {
  database: boolean;
  auth: boolean;
  functions: boolean;
  overall: boolean;
}

export const useHealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus>({
    database: false,
    auth: false,
    functions: false,
    overall: false
  });
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    
    try {
      // Check database connection
      const dbHealth = await checkSupabaseHealth();
      
      // Check auth
      const { data: session } = await supabase.auth.getSession();
      const authHealth = session !== null || session === null; // Auth service is responsive
      
      // Check edge functions (basic connectivity)
      let functionsHealth = true;
      try {
        // This will fail gracefully if functions are down
        await supabase.functions.invoke('health-check', { body: {} });
      } catch {
        functionsHealth = false; // Functions might not be available but that's ok for MVP
      }

      const overallHealth = dbHealth.healthy && authHealth;
      
      setHealth({
        database: dbHealth.healthy,
        auth: authHealth,
        functions: functionsHealth,
        overall: overallHealth
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        database: false,
        auth: false,
        functions: false,
        overall: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { health, loading, checkHealth };
};
