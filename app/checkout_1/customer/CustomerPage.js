"use client";
import { CREATE_ORDER_FROM_CART } from "../../lib/mutations";
import { graphqlClient } from "../../lib/graphqlClient";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { gql } from "graphql-request";

const GET_SHIPPING_CALCULATION = gql`
  query GetShippingCalculation($country_id: ID!) {
    calculateShipping(country_id: $country_id) {
      normal_shipping {
        type
        name
        cost
        estimated_days
      }
      fast_shipping {
        type
        name
        cost
        estimated_days
      }
    }
  }
`;

export default function CustomerPage() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId") ?? "";
  const countryId = searchParams.get("countryId") ?? "";
  const appliedCoupon = searchParams.get("appliedCoupon") ?? "";

  const [shippingOptions, setShippingOptions] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch shipping options
  useEffect(() => {
    if (!countryId) return;
    const fetchShipping = async () => {
      try {
        setError("");
        const res = await graphqlClient.request(GET_SHIPPING_CALCULATION, {
          country_id: countryId,
        });
        setShippingOptions(res.calculateShipping);
      } catch (err) {
        console.error("Shipping error:", err);
        setError("تعذر تحميل خيارات الشحن");
      }
    };
    fetchShipping();
  }, [countryId]);

  const handlePlaceOrder = async () => {
    if (!cartId) {
      alert("لا يوجد Cart ID");
      return;
    }
    if (!selectedShipping) {
      alert("من فضلك اختر نوع الشحن");
      return;
    }
    if (!paymentType) {
      alert("من فضلك اختر وسيلة الدفع");
      return;
    }

    setLoading(true);
    try {
      const res = await graphqlClient.request(CREATE_ORDER_FROM_CART, {
        cart_id: cartId,
        input: {
          payment_status: paymentType === "COD" ? "PENDING" : "PROCESSING",
          shipping_type: selectedShipping.type,
          reference_id: "WEB-" + Date.now(),
          empty_cart: true,
        },
      });

      alert(`تم إنشاء الأوردر بنجاح برقم: ${res.createOrderFromCart.number}`);
      console.log("Order created:", res.createOrderFromCart);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("حدث خطأ أثناء إنشاء الأوردر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Customer Page</h1>

      {/* Errors */}
      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg">{error}</div>
      )}

      {/* Shipping Options */}
      {!shippingOptions && !error && (
        <p className="text-gray-400">جارِ تحميل خيارات الشحن...</p>
      )}
      {shippingOptions && (
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">خيارات الشحن</h2>
          {[shippingOptions.normal_shipping, shippingOptions.fast_shipping].map(
            (opt, i) => (
              <div
                key={i}
                onClick={() => setSelectedShipping(opt)}
                className={`p-4 mb-3 rounded-xl cursor-pointer border-2 transition ${
                  selectedShipping?.type === opt.type
                    ? "border-yellow-400 bg-yellow-500 text-black"
                    : "border-zinc-700 hover:border-yellow-400"
                }`}
              >
                <p className="font-bold">{opt.name}</p>
                <p>السعر: {opt.cost} SAR</p>
                <p className="text-sm">تقدير: {opt.estimated_days} يوم</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Payment Options */}
      {selectedShipping && (
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-3">اختر وسيلة الدفع</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setPaymentType("COD")}
              className={`px-4 py-2 rounded-lg border transition ${
                paymentType === "COD"
                  ? "bg-yellow-400 text-black"
                  : "bg-black text-white border-yellow-400 hover:bg-yellow-500 hover:text-black"
              }`}
            >
              الدفع عند الاستلام
            </button>
            <button
              onClick={() => setPaymentType("TAP")}
              className={`px-4 py-2 rounded-lg border transition ${
                paymentType === "TAP"
                  ? "bg-yellow-400 text-black"
                  : "bg-black text-white border-yellow-400 hover:bg-yellow-500 hover:text-black"
              }`}
            >
              الدفع عبر Tap
            </button>
          </div>
        </div>
      )}

      {/* Place Order Button */}
      {selectedShipping && paymentType && (
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-yellow-400 text-black py-3 font-bold rounded-xl disabled:opacity-50"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      )}
    </div>
  );
}
