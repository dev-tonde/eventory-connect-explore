import { useParams } from "react-router-dom";
import SplitPaymentStatus from "@/components/payments/SplitPaymentStatus";

const SplitPaymentPage = () => {
  const { splitId } = useParams<{ splitId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Split Payment</h1>
            <p className="text-gray-600 mt-2">
              Track your group payment status
            </p>
          </div>
          {splitId ? (
            <SplitPaymentStatus splitId={splitId} />
          ) : (
            <div className="text-center text-red-500 py-8">
              Invalid or missing split payment ID.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitPaymentPage;
// This code defines a SplitPaymentPage component that displays the status of a split payment based on the provided splitId from the URL parameters. It uses the SplitPaymentStatus component to show the details of the payment. If no splitId is provided, it displays an error message indicating that the ID is invalid or missing.
