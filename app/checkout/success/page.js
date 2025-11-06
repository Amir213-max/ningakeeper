"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  useEffect(() => {
    // هنا ممكن تحدث حالة الطلب فى GraphQL إلى paid لو حبيت
    console.log("Payment succeeded for order:", orderId);
  }, [orderId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful ✅</h1>
      <p className="mt-4 text-gray-600">Order ID: {orderId}</p>
    </div>
  );
}
