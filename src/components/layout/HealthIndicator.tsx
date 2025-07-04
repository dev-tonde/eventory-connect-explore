import { useHealthCheck } from "@/hooks/useHealthCheck";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle } from "lucide-react";

export const HealthIndicator = () => {
  const { health, loading } = useHealthCheck();

  if (loading || !health) return null;

  const statusColor = (
    status: boolean | undefined,
    warnColor = "bg-yellow-500"
  ) =>
    status === undefined ? warnColor : status ? "bg-green-500" : "bg-red-500";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={health.overall ? "default" : "destructive"}
            className="flex items-center gap-1 cursor-pointer"
            aria-label={
              health.overall ? "System healthy" : "System experiencing issues"
            }
          >
            {health.overall ? (
              <CheckCircle className="h-3 w-3" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
            )}
            System
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${statusColor(
                  health.database
                )}`}
                aria-label={`Database status: ${
                  health.database ? "Online" : "Offline"
                }`}
              />
              Database:{" "}
              <span className="font-medium">
                {health.database ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${statusColor(health.auth)}`}
                aria-label={`Auth status: ${
                  health.auth ? "Online" : "Offline"
                }`}
              />
              Auth:{" "}
              <span className="font-medium">
                {health.auth ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${statusColor(
                  health.functions,
                  "bg-yellow-500"
                )}`}
                aria-label={`Functions status: ${
                  health.functions ? "Online" : "Limited"
                }`}
              />
              Functions:{" "}
              <span className="font-medium">
                {health.functions ? "Online" : "Limited"}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HealthIndicator;
// This component provides a health indicator for the system, displaying the overall status and detailed statuses for database, auth, and functions.
// It uses a tooltip to show detailed information when hovered over.
// The indicator uses different colors to represent the status: green for online, red for offline, and yellow for limited functionality.
