import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, QrCode, Calendar, MapPin, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmailNotification } from "@/hooks/useEmailNotification";
import TicketDownload from "./TicketDownload";

interface Ticket {
  id: string;
  ticket_number: string;
  event_id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  qr_code: string;
  status: string;
  purchase_date: string;
  qr_scanned_at?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  organizer?: string;
}

interface TicketWithQRProps {
  ticket: Ticket;
  event: Event;
  userEmail: string;
  userName: string;
}

const TicketWithQR = ({ ticket, event, userEmail, userName }: TicketWithQRProps) => {
  const [showDownload, setShowDownload] = useState(false);
  const { toast } = useToast();

  const generateQRCodeSVG = (qrData: string): string => {
    // Create a simple QR code representation as SVG
    const size = 120;
    const modules = 25; // QR code grid size
    const moduleSize = size / modules;
    
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>`;
    
    // Generate a pattern based on the QR data hash
    const hash = qrData.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const shouldFill = Math.abs(hash + row * modules + col) % 3 === 0;
        if (shouldFill) {
          const x = col * moduleSize;
          const y = row * moduleSize;
          svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    
    svg += '</svg>';
    return svg;
  };

  const qrCodeSVG = generateQRCodeSVG(ticket.qr_code);

  if (showDownload) {
    return (
      <div className="space-y-4">
        <Button 
          onClick={() => setShowDownload(false)} 
          variant="outline"
          size="sm"
        >
          ← Back to Ticket
        </Button>
        <TicketDownload 
          ticket={ticket}
          event={event}
          userEmail={userEmail}
          userName={userName}
        />
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          Event Ticket
        </CardTitle>
        <div className="text-sm opacity-90">#{ticket.ticket_number}</div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Event Details */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-center">{event.title}</h3>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{event.venue}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{userName}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <div className="flex justify-center mb-2">
            <div dangerouslySetInnerHTML={{ __html: qrCodeSVG }} />
          </div>
          <p className="text-xs text-gray-600">Scan at event entrance</p>
        </div>

        {/* Ticket Status */}
        <div className="flex justify-center">
          {ticket.qr_scanned_at ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✓ Scanned on {new Date(ticket.qr_scanned_at).toLocaleDateString()}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Ready for Entry
            </Badge>
          )}
        </div>

        {/* Ticket Info */}
        <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span className="font-medium">{ticket.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Paid:</span>
            <span className="font-medium">R{ticket.total_price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Purchase Date:</span>
            <span className="font-medium">
              {new Date(ticket.purchase_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <Button 
            onClick={() => setShowDownload(true)}
            className="w-full"
            variant="default"
          >
            <Download className="h-4 w-4 mr-2" />
            Download & Email Ticket
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Keep this ticket accessible on your device for event entry
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketWithQR;