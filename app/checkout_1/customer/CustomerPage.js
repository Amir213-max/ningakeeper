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
    <div className="min-h-screen bg-white md:bg-gray-50 text-[#111]">
      {/* Header */}
      <div className="bg-white md:bg-gray-50 border-b border-gray-200 md:border-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111] text-center">
            Complete Your Order
          </h1>
          <div className="w-24 h-1 bg-[#FFD300] mx-auto mt-4 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Errors */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Shipping Options */}
          {!shippingOptions && !error && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD300] mx-auto mb-4"></div>
                <p className="text-[#555] text-lg">Loading shipping options...</p>
              </div>
            </div>
          )}

          {shippingOptions && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-[#FFD300] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#111] font-bold text-sm">1</span>
                </div>
                <h2 className="text-2xl font-bold text-[#111]">Shipping Options</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[shippingOptions.normal_shipping, shippingOptions.fast_shipping].map(
                  (opt, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedShipping(opt)}
                      className={`p-6 rounded-xl cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02] ${
                        selectedShipping?.type === opt.type
                          ? "border-[#FFD300] bg-[#FFD300] bg-opacity-10"
                          : "border-gray-200 hover:border-[#FFD300] hover:border-opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[#111] text-lg">{opt.name}</h3>
                        {selectedShipping?.type === opt.type && (
                          <div className="w-6 h-6 bg-[#FFD300] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#111]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[#555]">
                          <span className="font-semibold">Cost:</span> {opt.cost} SAR
                        </p>
                        <p className="text-[#555] text-sm">
                          <span className="font-semibold">Estimated delivery:</span> {opt.estimated_days} days
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Payment Options */}
          {selectedShipping && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-[#FFD300] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#111] font-bold text-sm">2</span>
                </div>
                <h2 className="text-2xl font-bold text-[#111]">Payment Method</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentType("COD")}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] text-left ${
                    paymentType === "COD"
                      ? "border-[#FFD300] bg-[#FFD300] bg-opacity-10"
                      : "border-gray-200 hover:border-[#FFD300] hover:border-opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#111] text-lg">Cash on Delivery</h3>
                    {paymentType === "COD" && (
                      <div className="w-6 h-6 bg-[#FFD300] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#111]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-[#555] text-sm">Pay when your order arrives</p>
                </button>
                
                <button
                  onClick={() => setPaymentType("TAP")}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] text-left ${
                    paymentType === "TAP"
                      ? "border-[#FFD300] bg-[#FFD300] bg-opacity-10"
                      : "border-gray-200 hover:border-[#FFD300] hover:border-opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#111] text-lg">Tap Payment</h3>
                    {paymentType === "TAP" && (
                      <div className="w-6 h-6 bg-[#FFD300] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#111]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-[#555] text-sm">Pay securely with Tap</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Place Order Button - Mobile */}
      {selectedShipping && paymentType && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-[#FFD300] text-[#111] py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#E6BE00] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#111] mr-2"></div>
                Processing...
              </div>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      )}

      {/* Place Order Button - Desktop */}
      {selectedShipping && paymentType && (
        <div className="hidden md:block max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-[#FFD300] text-[#111] py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#E6BE00] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#111] mr-2"></div>
                Processing...
              </div>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
