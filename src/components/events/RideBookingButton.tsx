import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RideBookingButtonProps {
  venue: string;
  address?: string;
  coordinates?: [number, number];
  eventDate: string;
  eventTime: string;
}

const RideBookingButton: React.FC<RideBookingButtonProps> = ({
  venue,
  address,
  coordinates,
  eventDate,
  eventTime,
}) => {
  const { toast } = useToast();

  const handleUberBooking = () => {
    const destination = encodeURIComponent(address || venue);
    const uberUrl = `uber://?action=setPickup&pickup=my_location&dropoff[formatted_address]=${destination}`;
    const uberWebUrl = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${destination}`;
    
    // Try to open the Uber app, fallback to web
    window.location.href = uberUrl;
    
    // Fallback to web after a short delay
    setTimeout(() => {
      window.open(uberWebUrl, '_blank');
    }, 1000);

    toast({
      title: "Opening Uber",
      description: "Redirecting to Uber with your destination pre-filled.",
    });
  };

  const handleBoltBooking = () => {
    const destination = encodeURIComponent(address || venue);
    const boltUrl = `bolt://riderequest?destination=${destination}`;
    const boltWebUrl = `https://m.bolt.eu/en/book-a-ride/?destination=${destination}`;
    
    // Try to open the Bolt app, fallback to web
    window.location.href = boltUrl;
    
    // Fallback to web after a short delay
    setTimeout(() => {
      window.open(boltWebUrl, '_blank');
    }, 1000);

    toast({
      title: "Opening Bolt",
      description: "Redirecting to Bolt with your destination pre-filled.",
    });
  };

  const formatEventDateTime = () => {
    const date = new Date(`${eventDate}T${eventTime}`);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-blue-600" />
          Book Your Ride
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatEventDateTime()}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleUberBooking}
            variant="outline"
            className="w-full border-black hover:bg-black hover:text-white transition-colors"
          >
            <Car className="h-4 w-4 mr-2" />
            Uber
          </Button>
          <Button
            onClick={handleBoltBooking}
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
          >
            <Car className="h-4 w-4 mr-2" />
            Bolt
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Destination will be pre-filled with the event venue
        </p>
      </CardContent>
    </Card>
  );
};

export default RideBookingButton;