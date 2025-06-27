
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { useYocoPayment } from "@/hooks/useYocoPayment";

interface YocoPaymentFormProps {
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

const YocoPaymentForm = ({
  eventId,
  quantity,
  totalPrice,
  onSuccess,
  onCancel,
}: YocoPaymentFormProps) => {
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [yocoInlineForm, setYocoInlineForm] = useState<any>(null);
  const { processPayment, isProcessing } = useYocoPayment();

  useEffect(() => {
    // Load YOCO SDK
    const script = document.createElement('script');
    script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';
    script.async = true;
    script.onload = initializeYoco;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
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
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-2">
            R{totalPrice.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            {quantity} ticket{quantity > 1 ? 's' : ''}
          </div>
        </div>

        <div>
          <div
            id="yoco-card-frame"
            className="min-h-[120px] p-4 border border-gray-300 rounded-lg bg-white"
          >
            {!isSDKReady && (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading payment form...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!isSDKReady || isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay R${totalPrice.toFixed(2)}`
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Secure payment powered by YOCO
        </div>
      </CardContent>
    </Card>
  );
};

export default YocoPaymentForm;
