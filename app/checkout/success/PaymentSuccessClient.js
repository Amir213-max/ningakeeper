"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccessClient() {
  const params = useSearchParams();
  const orderId = params.get("order_id"); // أو "orderId" حسب اللي جاي من Tap

  useEffect(() => {
    if (orderId) {
      console.log("Payment succeeded for order:", orderId);
      // هنا ممكن تحدث حالة الطلب فى GraphQL إلى paid لو حبيت
    }
  }, [orderId]);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful ✅
      </h1>
      <p className="mt-4 text-gray-600">Order ID: {orderId || "N/A"}</p>
    </div>
  );
}
