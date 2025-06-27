
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, Shield, Lock } from "lucide-react";
import { useYocoPayment } from "@/hooks/useYocoPayment";

interface MobileOptimizedYocoFormProps {
  eventId: string;
  quantity: number;
  totalPrice: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    YocoSDK: any;
  }
}

const MobileOptimizedYocoForm = ({
  eventId,
  quantity,
  totalPrice,
  onSuccess,
  onCancel,
}: MobileOptimizedYocoFormProps) => {
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [yocoInlineForm, setYocoInlineForm] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { processPayment, isProcessing } = useYocoPayment();

  useEffect(() => {
    // Detect mobile device
    setIsMobile(window.innerWidth < 768);

    // Load YOCO SDK with mobile optimization
    const script = document.createElement('script');
    script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';
    script.async = true;
    script.onload = initializeYoco;
    document.head.appendChild(script);

    // Handle orientation changes on mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeYoco = () => {
    if (window.YocoSDK) {
      const yoco = new window.YocoSDK({
        publicKey: import.meta.env.VITE_YOCO_PUBLIC_KEY || 'pk_test_ed3c54a6gOol69qa7f45',
      });

      const inlineForm = yoco.inline({
        containerSelector: '#yoco-card-frame',
        styling: {
          base: {
            fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
            color: '#424770',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#e53e3e',
          },
        },
      });

      setYocoInlineForm(inlineForm);
      setIsSDKReady(true);
    }
  };

  const handlePayment = async () => {
    if (!yocoInlineForm) return;

    try {
      // Disable scroll on mobile during payment processing
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }

      const { error, token } = await yocoInlineForm.createToken();
      
      if (error) {
        console.error('YOCO token creation failed:', error);
        return;
      }

      const result = await processPayment(
        { eventId, quantity, totalPrice },
        token
      );

      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      // Re-enable scroll
      if (isMobile) {
        document.body.style.overflow = 'auto';
      }
    }
  };

  return (
    <div className={`${isMobile ? 'px-2' : ''}`}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-green-600" />
            Secure Payment
          </CardTitle>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <Lock className="h-3 w-3" />
            256-bit SSL encryption
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Amount Display - Mobile Optimized */}
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">
              R{totalPrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {quantity} ticket{quantity > 1 ? 's' : ''}
            </div>
          </div>

          {/* Card Form - Mobile Optimized */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Card Details
            </label>
            <div
              id="yoco-card-frame"
              className={`
                border border-gray-300 rounded-lg bg-white
                ${isMobile ? 'min-h-[140px] p-4' : 'min-h-[120px] p-4'}
                focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
              `}
            >
              {!isSDKReady && (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading secure form...</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile-Optimized Buttons */}
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
            <Button
              variant="outline"
              onClick={onCancel}
              className={`${isMobile ? 'h-12 text-base' : 'flex-1'}`}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!isSDKReady || isProcessing}
              className={`${isMobile ? 'h-12 text-base' : 'flex-1'} bg-green-600 hover:bg-green-700`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay R{totalPrice.toFixed(2)}
                </>
              )}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center space-y-2 pt-4 border-t">
            <div className="text-xs text-gray-500">
              Secure payment powered by YOCO
            </div>
            <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
              <span>🔒 SSL Secure</span>
              <span>💳 PCI Compliant</span>
              <span>🇿🇦 SA Licensed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimizedYocoForm;
