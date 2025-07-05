import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Scan,
  StopCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface QRCodeScannerProps {
  eventId: string;
  eventTitle: string;
}

interface ScanResult {
  success: boolean;
  error?: string;
  code?: string;
  ticket_id?: string;
  event_title?: string;
  scanned_at?: string;
}

const QRCodeScanner = ({ eventId, eventTitle }: QRCodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRecentScans();
    return () => {
      stopScanning();
    };
  }, [eventId]);

  const loadRecentScans = async () => {
    try {
      const { data, error } = await supabase
        .from("qr_scan_logs")
        .select(`
          *,
          tickets (
            ticket_number,
            user_id,
            quantity
          )
        `)
        .eq("event_id", eventId)
        .order("scanned_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentScans(data || []);
    } catch (error) {
      console.error("Error loading recent scans:", error);
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start scanning loop
        scanIntervalRef.current = setInterval(scanQRCode, 500);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  };

  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR detection (in production, use a proper QR library like jsQR)
    // For now, we'll use manual input as the primary method
  };

  const processQRCode = async (qrData: string) => {
    if (!user || !qrData.trim()) return;

    try {
      let ticketId: string;
      
      // Try to parse QR data as JSON first
      try {
        const parsed = JSON.parse(qrData);
        ticketId = parsed.ticket_id;
      } catch {
        // If not JSON, assume it's a direct ticket ID
        ticketId = qrData.trim();
      }

      // Call the database function to process the scan
      const { data, error } = await supabase.rpc('process_qr_scan', {
        p_ticket_id: ticketId,
        p_scanner_id: user.id,
        p_scan_location: `Event: ${eventTitle}`,
        p_device_info: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      // Type guard to ensure data is an object with expected properties
      const result = data as any;
      setScanResult(result);
      
      if (result?.success) {
        toast({
          title: "Ticket Scanned Successfully!",
          description: `Access granted for ${result.event_title}`,
        });
        loadRecentScans(); // Refresh recent scans
      } else {
        toast({
          title: "Scan Failed",
          description: result?.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Scan Error",
        description: error.message || "Failed to process QR code",
        variant: "destructive",
      });
    }
  };

  const handleManualScan = () => {
    if (manualCode.trim()) {
      processQRCode(manualCode);
      setManualCode("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Scanner */}
          <div className="space-y-4">
            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" className="flex items-center gap-2">
                  <StopCircle className="h-4 w-4" />
                  Stop Camera
                </Button>
              )}
            </div>
            
            {isScanning && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or enter ticket code manually:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter ticket ID or scan QR data"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button onClick={handleManualScan} disabled={!manualCode.trim()}>
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <Alert className={scanResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {scanResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={scanResult.success ? "text-green-800" : "text-red-800"}>
                {scanResult.success ? (
                  <div>
                    <p className="font-medium">Access Granted!</p>
                    <p className="text-sm">Ticket scanned successfully at {new Date().toLocaleTimeString()}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Access Denied</p>
                    <p className="text-sm">{scanResult.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length > 0 ? (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">Ticket #{scan.tickets?.ticket_number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(scan.scanned_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Scanned</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No scans yet for this event</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;