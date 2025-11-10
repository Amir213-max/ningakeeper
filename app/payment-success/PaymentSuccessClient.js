"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { graphqlClient } from "@/app/lib/graphqlClient";
import { gql } from "graphql-request";
import { CheckCircle, XCircle, Loader2, ShoppingBag, Home, Package } from "lucide-react";

const VERIFY_PAYMENT = gql`
  mutation VerifyPayment($input: VerifyPaymentInput!) {
    verifyTapPayment(input: $input) {
      success
      message
      tap_status
      order {
        id
        number
        total_amount
      }
    }
  }
`;

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [status, setStatus] = useState("verifying");
  const [orderData, setOrderData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (orderId) verifyPayment();
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      const res = await graphqlClient.request(VERIFY_PAYMENT, {
        input: { order_id: orderId },
      });

      console.log("Payment verification:", res);
      const result = res?.verifyTapPayment;

      if (result?.success) {
        setStatus("success");
        setOrderData(result.order);
        setMessage(result.message || "Your payment was successful!");
      } else {
        setStatus("failed");
        setMessage(result?.message || "Payment verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setStatus("failed");
      setMessage("An error occurred while verifying your payment.");
    }
  };

  const handleBackToShop = () => {
    router.push("/");
  };

  const handleViewOrders = () => {
    router.push("/myprofile?tab=orders");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-yellow-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-2xl">
        {status === "verifying" && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
            <div className="flex flex-col items-center">
              <Loader2 className="w-20 h-20 text-yellow-400 animate-spin mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Verifying Payment...
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Please wait a moment while we confirm your payment. This may take a few seconds.
              </p>
              <div className="mt-8 w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                <CheckCircle className="w-24 h-24 text-green-500 relative z-10" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">{message}</p>

              {orderData && (
                <div className="w-full bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 md:p-8 mb-8 border-2 border-yellow-200">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Package className="w-6 h-6 text-yellow-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  </div>
                  <div className="space-y-4 text-left max-w-md mx-auto">
                    <div className="flex justify-between items-center py-3 border-b border-yellow-200">
                      <span className="text-gray-600 font-medium">Order ID:</span>
                      <span className="font-bold text-gray-800">{orderData.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-yellow-200">
                      <span className="text-gray-600 font-medium">Order Number:</span>
                      <span className="font-bold text-gray-800">#{orderData.number}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold text-yellow-600">
                        {orderData.total_amount} SAR
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <button
                  onClick={handleViewOrders}
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                >
                  <ShoppingBag className="w-5 h-5" />
                  View My Orders
                </button>
                <button
                  onClick={handleBackToShop}
                  className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                >
                  <Home className="w-5 h-5" />
                  Back to Shop
                </button>
              </div>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                <XCircle className="w-24 h-24 text-red-500 relative z-10" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
                Payment Failed
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">{message}</p>
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <p className="text-sm text-red-800">
                  If you believe this is an error, please contact our support team or try again.
                </p>
              </div>
              <button
                onClick={handleBackToShop}
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Back to Shop
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
