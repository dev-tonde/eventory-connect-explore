import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Mail, QrCode, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmailNotification } from "@/hooks/useEmailNotification";

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
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
}

interface TicketDownloadProps {
  ticket: Ticket;
  event: Event;
  userEmail: string;
  userName: string;
}

const TicketDownload = ({ ticket, event, userEmail, userName }: TicketDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const { toast } = useToast();
  const { sendTicketConfirmationEmail } = useEmailNotification();

  const generateQRCodeDataURL = (qrData: string): string => {
    // Create a simple QR code representation as SVG
    const size = 200;
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
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const generateTicketHTML = () => {
    const qrDataURL = generateQRCodeDataURL(ticket.qr_code);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Event Ticket - ${event.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .ticket { background: white; max-width: 600px; margin: 0 auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { font-size: 16px; opacity: 0.9; }
          .content { padding: 30px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-item { }
          .info-label { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 5px; }
          .info-value { font-size: 16px; font-weight: bold; color: #333; }
          .qr-section { text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .qr-code { margin: 15px 0; }
          .ticket-number { font-size: 18px; font-weight: bold; color: #667eea; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          @media print { body { background: white; } .ticket { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div class="title">${event.title}</div>
            <div class="subtitle">Event Ticket</div>
          </div>
          
          <div class="content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Event Name</div>
                <div class="info-value">${event.title}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date & Time</div>
                <div class="info-value">${new Date(event.date).toLocaleDateString()} at ${event.time}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Venue</div>
                <div class="info-value">${event.venue}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Address</div>
                <div class="info-value">${event.address || 'See event details'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Ticket Holder</div>
                <div class="info-value">${userName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Quantity</div>
                <div class="info-value">${ticket.quantity} ticket(s)</div>
              </div>
            </div>
            
            <div class="qr-section">
              <div>Scan QR Code for Entry</div>
              <div class="qr-code">
                <img src="${qrDataURL}" alt="QR Code" width="150" height="150" />
              </div>
              <div class="ticket-number">Ticket #${ticket.ticket_number}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Present this ticket at the event entrance for admission.</p>
            <p>This ticket is valid for ${event.title} on ${new Date(event.date).toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const downloadTicket = async () => {
    setIsDownloading(true);
    try {
      const ticketHTML = generateTicketHTML();
      const blob = new Blob([ticketHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticket.ticket_number}-${event.title.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Ticket Downloaded",
        description: "Your ticket has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const emailTicket = async () => {
    setIsEmailSending(true);
    try {
      await sendTicketConfirmationEmail(
        userEmail,
        userName,
        event.title,
        ticket.ticket_number,
        ticket.quantity,
        ticket.total_price,
        new Date(event.date).toLocaleDateString(),
        event.time,
        event.venue
      );

      toast({
        title: "Ticket Emailed",
        description: "Your ticket has been sent to your email address.",
      });
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send ticket via email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Your Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ticket Preview */}
        <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(event.date).toLocaleDateString()} at {event.time}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="h-4 w-4" />
                <span className="text-sm font-mono">#{ticket.ticket_number}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Venue:</span>
              <p className="font-medium">{event.venue}</p>
            </div>
            <div>
              <span className="text-gray-600">Quantity:</span>
              <p className="font-medium">{ticket.quantity} ticket(s)</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={downloadTicket} 
            disabled={isDownloading}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download Ticket"}
          </Button>
          
          <Button 
            onClick={emailTicket} 
            disabled={isEmailSending}
            variant="outline"
            className="flex-1"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isEmailSending ? "Sending..." : "Email Ticket"}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Present this ticket at the event entrance</p>
          <p>• The QR code will be scanned for verification</p>
          <p>• Keep a backup copy on your device</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketDownload;