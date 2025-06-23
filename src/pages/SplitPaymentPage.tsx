
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import SplitPaymentStatus from "@/components/payments/SplitPaymentStatus";

const SplitPaymentPage = () => {
  const { splitId } = useParams<{ splitId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Split Payment</h1>
            <p className="text-gray-600 mt-2">Track your group payment status</p>
          </div>

          {splitId && <SplitPaymentStatus splitId={splitId} />}
        </div>
      </div>
    </div>
  );
};

export default SplitPaymentPage;
