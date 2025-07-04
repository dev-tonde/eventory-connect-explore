import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Shield } from "lucide-react";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
}

const LocationPermissionModal = ({
  isOpen,
  onClose,
  onAllow,
  onDeny,
}: LocationPermissionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-modal="true" role="dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" aria-hidden="true" />
            Location Access
          </DialogTitle>
          <DialogDescription>
            Eventory would like to access your location to show you nearby
            events and provide personalized recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield
                className="h-5 w-5 text-blue-600 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h4 className="font-medium text-blue-900">
                  Privacy Protection
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your location data is only used to find nearby events and is
                  never stored or shared with third parties.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">This helps us:</h4>
            <ul
              className="text-sm text-gray-600 space-y-1"
              aria-label="Benefits of location access"
            >
              <li>• Show events happening near you</li>
              <li>• Calculate travel times to events</li>
              <li>• Provide location-based recommendations</li>
              <li>• Display events on the map</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onAllow}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              aria-label="Allow location access"
              type="button"
            >
              Allow Location Access
            </Button>
            <Button
              onClick={onDeny}
              variant="outline"
              className="flex-1"
              aria-label="Deny location access"
              type="button"
            >
              Not Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPermissionModal;
// This component provides a modal dialog to request location access from the user.
