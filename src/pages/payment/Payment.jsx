import { CheckCircle, XCircle, Loader2, Home } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";

function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const status = searchParams.get("status");

  // Auto redirect after successful payment
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        // Get returnUrl from query params first, then localStorage
        const urlReturnUrl = searchParams.get("returnUrl");
        const storedReturnUrl = localStorage.getItem("paymentReturnUrl");
        const paymentType = localStorage.getItem("paymentType");
        
        // Clear stored returnUrl and paymentType after use
        if (storedReturnUrl) {
          localStorage.removeItem("paymentReturnUrl");
        }
        if (paymentType) {
          localStorage.removeItem("paymentType");
        }
        
        // Priority 1: If payment type is orderRestock, always redirect to order restock page (ignore returnUrl from backend)
        if (paymentType === "orderRestock" && user?.role?.[0] === "Dealer Manager") {
          navigate("/agency/order-restock");
          return;
        }
        
        // Priority 2: Use stored returnUrl (set before redirecting to payment)
        if (storedReturnUrl) {
          navigate(storedReturnUrl);
          return;
        }
        
        // Priority 3: Use returnUrl from query params (from backend)
        if (urlReturnUrl) {
          navigate(urlReturnUrl);
          return;
        }
        
        // Priority 4: Default redirect for Dealer Manager to order restock page
        if (user?.role?.[0] === "Dealer Manager") {
          navigate("/agency/order-restock");
        } else {
          navigate("/");
        }
      }, 2000); // Redirect after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [status, searchParams, navigate, user]);

  const handleBackHome = () => {
    // Get returnUrl from query params first, then localStorage
    const urlReturnUrl = searchParams.get("returnUrl");
    const storedReturnUrl = localStorage.getItem("paymentReturnUrl");
    const paymentType = localStorage.getItem("paymentType");
    
    // Clear stored returnUrl and paymentType after use
    if (storedReturnUrl) {
      localStorage.removeItem("paymentReturnUrl");
    }
    if (paymentType) {
      localStorage.removeItem("paymentType");
    }
    
    // Priority 1: If payment type is orderRestock, always redirect to order restock page (ignore returnUrl from backend)
    if (paymentType === "orderRestock" && user?.role?.[0] === "Dealer Manager") {
      navigate("/agency/order-restock");
      return;
    }
    
    // Priority 2: Use stored returnUrl (set before redirecting to payment)
    if (storedReturnUrl) {
      navigate(storedReturnUrl);
      return;
    }
    
    // Priority 3: Use returnUrl from query params (from backend)
    if (urlReturnUrl) {
      navigate(urlReturnUrl);
      return;
    }
    
    // Priority 4: Default redirect for Dealer Manager to order restock page
    if (user?.role?.[0] === "Dealer Manager") {
      navigate("/agency/order-restock");
    } else {
      navigate("/");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="text-green-500" size={80} />
            <h1 className="text-3xl font-bold text-green-600">
              Successfull payment!
            </h1>
            <p className="text-gray-600">Thanks for using our service.</p>
          </div>
        );
      case "invalid":
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="text-red-500" size={80} />
            <h1 className="text-3xl font-bold text-red-600">
              Cancelled payment!
            </h1>
            <p className="text-gray-600">Your payment is cancelled</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="animate-spin text-blue-500" size={80} />
            <h1 className="text-3xl font-bold text-blue-600">Processing</h1>
            <p className="text-gray-600">Wait a minute</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
        {renderContent()}
        <div className="flex justify-center ">
          <button
          onClick={handleBackHome}
          className="mt-8 flex items-center cursor-pointer justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          <Home size={20} />
          {user?.role?.[0] === "Dealer Manager" ? "Quay lại Order Restock" : "Home"}
        </button>
        </div>
        
      </div>
    </div>
  );
}

export default Payment;
