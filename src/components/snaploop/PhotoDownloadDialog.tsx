import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Image as ImageIcon, ShoppingCart, FileImage, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PhotoDownloadDialogProps {
  photoId: string;
  eventId: string;
  photoUrl: string;
  caption?: string;
}

const PRINT_PRICES = {
  '4x6': { none: 8.99, black: 18.99, white: 18.99, wood: 24.99, gold: 29.99 },
  '5x7': { none: 12.99, black: 24.99, white: 24.99, wood: 32.99, gold: 39.99 },
  '8x10': { none: 19.99, black: 34.99, white: 34.99, wood: 44.99, gold: 54.99 },
  '11x14': { none: 34.99, black: 59.99, white: 59.99, wood: 74.99, gold: 89.99 },
  '16x20': { none: 54.99, black: 89.99, white: 89.99, wood: 114.99, gold: 139.99 },
};

export const PhotoDownloadDialog: React.FC<PhotoDownloadDialogProps> = ({
  photoId,
  eventId,
  photoUrl,
  caption
}) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrintOrderOpen, setIsPrintOrderOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState({
    guest_name: '',
    guest_email: '',
    phone_number: '',
    print_size: '8x10' as keyof typeof PRINT_PRICES,
    frame_type: 'none' as keyof typeof PRINT_PRICES['8x10'],
    quantity: 1,
    shipping_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'South Africa'
    }
  });

  const handleDownload = async (downloadType: 'standard' | 'high_res' | 'print_ready') => {
    setIsDownloading(true);
    try {
      // Log the download
      await supabase.from('photo_downloads').insert({
        photo_id: photoId,
        event_id: eventId,
        download_type: downloadType,
        resolution: downloadType === 'high_res' ? '4K' : downloadType === 'print_ready' ? 'print_300dpi' : '1920x1080'
      });

      // Create download link
      const link = document.createElement('a');
      link.href = photoUrl;
      link.download = `snaploop-photo-${downloadType}-${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download Started',
        description: `${downloadType === 'high_res' ? 'High-resolution' : downloadType === 'print_ready' ? 'Print-ready' : 'Standard'} photo download has started.`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const calculatePrice = () => {
    const basePrice = PRINT_PRICES[printOrder.print_size][printOrder.frame_type];
    return basePrice * printOrder.quantity;
  };

  const handlePrintOrder = async () => {
    try {
      const totalPrice = calculatePrice();
      
      const { error } = await supabase.from('print_orders').insert({
        photo_id: photoId,
        event_id: eventId,
        guest_name: printOrder.guest_name,
        guest_email: printOrder.guest_email,
        phone_number: printOrder.phone_number,
        print_size: printOrder.print_size,
        frame_type: printOrder.frame_type,
        quantity: printOrder.quantity,
        unit_price: PRINT_PRICES[printOrder.print_size][printOrder.frame_type],
        total_price: totalPrice,
        shipping_address: printOrder.shipping_address
      });

      if (error) throw error;

      toast({
        title: 'Print Order Submitted',
        description: `Your order for ${printOrder.quantity} ${printOrder.print_size} print(s) has been submitted. You'll receive an email with payment details.`,
      });
      
      setIsPrintOrderOpen(false);
    } catch (error) {
      toast({
        title: 'Order Failed',
        description: 'Failed to submit print order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Download Photo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Photo Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={photoUrl}
              alt={caption || 'Event photo'}
              className="w-full h-full object-cover"
            />
            {caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                {caption}
              </div>
            )}
          </div>

          {/* Download Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <FileImage className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">Standard Quality</h3>
                <p className="text-sm text-muted-foreground mb-3">1920x1080 • Perfect for social media</p>
                <Button 
                  onClick={() => handleDownload('standard')} 
                  disabled={isDownloading}
                  className="w-full"
                  variant="outline"
                >
                  Free Download
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">High Resolution</h3>
                <p className="text-sm text-muted-foreground mb-3">4K • Great for digital displays</p>
                <Button 
                  onClick={() => handleDownload('high_res')} 
                  disabled={isDownloading}
                  className="w-full"
                >
                  Free Download
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Palette className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-1">Print Ready</h3>
                <p className="text-sm text-muted-foreground mb-3">300 DPI • Perfect for printing</p>
                <Button 
                  onClick={() => handleDownload('print_ready')} 
                  disabled={isDownloading}
                  className="w-full"
                >
                  Free Download
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Print Order Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Framed Print
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get a professional print delivered to your door
                </p>
              </div>
              <Dialog open={isPrintOrderOpen} onOpenChange={setIsPrintOrderOpen}>
                <DialogTrigger asChild>
                  <Button>Order Print</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Order Framed Print</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={printOrder.guest_name}
                          onChange={(e) => setPrintOrder({ ...printOrder, guest_name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={printOrder.guest_email}
                          onChange={(e) => setPrintOrder({ ...printOrder, guest_email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={printOrder.phone_number}
                        onChange={(e) => setPrintOrder({ ...printOrder, phone_number: e.target.value })}
                        placeholder="+27 12 345 6789"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Print Size</Label>
                        <Select
                          value={printOrder.print_size}
                          onValueChange={(value: keyof typeof PRINT_PRICES) => 
                            setPrintOrder({ ...printOrder, print_size: value, frame_type: 'none' })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4x6">4" × 6"</SelectItem>
                            <SelectItem value="5x7">5" × 7"</SelectItem>
                            <SelectItem value="8x10">8" × 10"</SelectItem>
                            <SelectItem value="11x14">11" × 14"</SelectItem>
                            <SelectItem value="16x20">16" × 20"</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Frame</Label>
                        <Select
                          value={printOrder.frame_type}
                          onValueChange={(value: keyof typeof PRINT_PRICES['8x10']) => 
                            setPrintOrder({ ...printOrder, frame_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Frame</SelectItem>
                            <SelectItem value="black">Black Frame</SelectItem>
                            <SelectItem value="white">White Frame</SelectItem>
                            <SelectItem value="wood">Wood Frame</SelectItem>
                            <SelectItem value="gold">Gold Frame</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max="10"
                        value={printOrder.quantity}
                        onChange={(e) => setPrintOrder({ ...printOrder, quantity: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Shipping Address</Label>
                      <Input
                        placeholder="Street Address"
                        value={printOrder.shipping_address.street}
                        onChange={(e) => setPrintOrder({
                          ...printOrder,
                          shipping_address: { ...printOrder.shipping_address, street: e.target.value }
                        })}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="City"
                          value={printOrder.shipping_address.city}
                          onChange={(e) => setPrintOrder({
                            ...printOrder,
                            shipping_address: { ...printOrder.shipping_address, city: e.target.value }
                          })}
                        />
                        <Input
                          placeholder="Postal Code"
                          value={printOrder.shipping_address.postal_code}
                          onChange={(e) => setPrintOrder({
                            ...printOrder,
                            shipping_address: { ...printOrder.shipping_address, postal_code: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-lg font-semibold">
                          Total: R{calculatePrice().toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Including shipping & handling
                        </p>
                      </div>
                      <Button onClick={handlePrintOrder}>
                        Place Order
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              {Object.entries(PRINT_PRICES).map(([size, prices]) => (
                <div key={size} className="text-center p-2 border rounded">
                  <p className="font-medium">{size.replace('x', '" × "')}"</p>
                  <p className="text-muted-foreground">from R{Math.min(...Object.values(prices)).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};