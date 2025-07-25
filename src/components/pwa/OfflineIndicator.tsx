import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, CloudSnow, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OfflineIndicatorProps {
  isOnline: boolean;
  hasOfflineData: boolean;
  syncInProgress?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  hasOfflineData,
  syncInProgress = false,
}) => {
  if (isOnline && !syncInProgress) return null;

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg border-2">
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-2 text-sm">
          {!isOnline && (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-red-600 font-medium">Offline Mode</span>
              {hasOfflineData && (
                <Badge variant="secondary" className="ml-2">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Cached Data Available
                </Badge>
              )}
            </>
          )}
          {syncInProgress && (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-600 font-medium">Syncing...</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineIndicator;