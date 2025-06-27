
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle } from "lucide-react";

export const HealthIndicator = () => {
  const { health, loading } = useHealthCheck();

  if (loading) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant={health.overall ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {health.overall ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            System
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${health.database ? 'bg-green-500' : 'bg-red-500'}`} />
              Database: {health.database ? 'Online' : 'Offline'}
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${health.auth ? 'bg-green-500' : 'bg-red-500'}`} />
              Auth: {health.auth ? 'Online' : 'Offline'}
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${health.functions ? 'bg-green-500' : 'bg-yellow-500'}`} />
              Functions: {health.functions ? 'Online' : 'Limited'}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
