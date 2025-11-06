"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { graphqlClient } from "@/app/lib/graphqlClient";
import { gql } from "graphql-request";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      {status === "verifying" && (
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Verifying Payment...</h1>
          <p className="text-gray-500 mt-2">
            Please wait a moment while we confirm your payment.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center animate-fadeIn">
          <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
          <p className="mt-2 text-gray-600">{message}</p>

          {orderData && (
            <div className="mt-6 bg-white shadow-md rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Order Details
              </h2>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-medium">{orderData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-medium">{orderData.number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">
                    {orderData.total_amount} SAR
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleBackToShop}
            className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all"
          >
            Back to Shop
          </button>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center animate-fadeIn">
          <XCircle className="w-20 h-20 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-red-600">Payment Failed</h1>
          <p className="mt-2 text-gray-600">{message}</p>
          <button
            onClick={handleBackToShop}
            className="mt-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all"
          >
            Back to Shop
          </button>
        </div>
      )}
    </div>
  );
}
