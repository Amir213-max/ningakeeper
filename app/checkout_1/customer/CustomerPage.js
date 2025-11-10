"use client";

import { graphqlClient } from "../../lib/graphqlClient";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CREATE_ORDER_WITH_TAP_PAYMENT } from "@/app/lib/mutations";
import { useCurrency } from "@/app/contexts/CurrencyContext"; // ✅ تم إضافته

export default function CustomerPage() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId") ?? "";
  const shippingType = searchParams.get("shippingType") ?? "standard";
  const shippingCountryId = searchParams.get("countryCode") || "SA";

  const subtotalParam = parseFloat(searchParams.get("subtotal")) || 0;
  const shippingParam = parseFloat(searchParams.get("shipping")) || 0;
  const isSaudi = searchParams.get("isSaudi") === "true";

  const [paymentType, setPaymentType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country_code: shippingCountryId,
  });

  // ✅ استخدمنا سياق العملة
  const { currency, convertPrice } = useCurrency();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const taxRate = isSaudi ? 0.15 : 0;
  const taxAmount = subtotalParam * taxRate;
  const total = subtotalParam + shippingParam + taxAmount;
const handlePlaceOrder = async () => {
  if (!cartId || cartId === "guest") {
    alert("You must log in to place an order!");
    window.location.href = "/login";
    return;
  }

  if (paymentType !== "TAP") return alert("Please select Tap Payment first!");

  if (!customer.first_name || !customer.last_name || !customer.email || !customer.phone || !customer.address) {
    alert("Please fill all required fields!");
    return;
  }

  setLoading(true);

  try {
    const amountInSmallestUnit = Math.round(total * 100); // ✅ تحويل المبلغ للوحدة الصغيرة

    console.log("Preparing order, amount in smallest unit:", amountInSmallestUnit);
    console.log("Selected currency:", currency); // ✅ Log selected currency for debugging
    console.log("Order details:", {
      cartId,
      shippingType,
      shippingCountryId,
      total,
      currency, // ✅ Include currency in log
      customer: { email: customer.email, phone: customer.phone }
    });

    // ⚠️ NOTE: Currency is NOT sent to backend because TapPaymentInput doesn't support it
    // Backend must determine currency from shipping_country_id (SA = SAR) or user preference
    // See CURRENCY_ISSUE_BACKEND_FIX.md for backend fix instructions
    
    const res = await graphqlClient.request(CREATE_ORDER_WITH_TAP_PAYMENT, {
      input: {
        cart_id: parseInt(cartId),
        shipping_type: shippingType,
        shipping_country_id: parseInt(shippingCountryId),
        customer_email: customer.email,
        customer_phone: customer.phone,
        redirect_url: `${window.location.origin}/payment-success`,
        webhook_url: `${window.location.origin}/api/tap-webhook`,
        published: true,
        shipping_address: {
          first_name: customer.first_name,
          last_name: customer.last_name,
          address_line_1: customer.address,
          locality: customer.city || "Main",
          address_line_2: "",
          postal_code: customer.zip || "0000",
          country_code: String(shippingCountryId),
        },
        billing_address: {
          first_name: customer.first_name,
          last_name: customer.last_name,
          address_line_1: customer.address,
          locality: customer.city || "Main",
          address_line_2: "",
          postal_code: customer.zip || "0000",
          country_code: String(shippingCountryId),
        },
      },
    });

    console.log("GraphQL Response:", res);

    const tapResponse = res.createOrderWithTapPayment;

    console.log("Full Tap Response:", JSON.stringify(tapResponse, null, 2));

    if (tapResponse.success && tapResponse.payment_url) {
      window.location.href = tapResponse.payment_url;
    } else {
      console.error("TAP payment failed - Full Response:", tapResponse);
      console.error("TAP payment failed - Error:", tapResponse.error);
      console.error("TAP payment failed - Message:", tapResponse.message);
      console.error("TAP payment failed - Order ID:", tapResponse.order_id);
      
      // Show more detailed error message
      let errorMessage = "Payment processing failed";
      if (tapResponse.error) {
        errorMessage += ": " + tapResponse.error;
      } else if (tapResponse.message) {
        errorMessage += ": " + tapResponse.message;
      } else {
        errorMessage += ": Invalid response from Tap payment service";
      }
      
      if (tapResponse.order_id) {
        errorMessage += `\n\nOrder #${tapResponse.order_id} was created but payment failed.`;
        errorMessage += "\n\nPlease check backend logs for Tap API error details.";
      }
      
      alert(errorMessage);
    }
  } catch (error) {
    console.error("TAP ERROR - Full error object:", error);
    console.error("TAP ERROR - Response:", error.response);
    console.error("TAP ERROR - Message:", error.message);
    
    // Handle GraphQL errors
    let errorMessage = "Payment processing failed: Invalid response from Tap payment service";
    
    if (error.response?.errors && Array.isArray(error.response.errors)) {
      const graphqlError = error.response.errors[0];
      errorMessage = graphqlError.message || errorMessage;
      if (graphqlError.extensions) {
        console.error("GraphQL Error Extensions:", graphqlError.extensions);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 text-[#111]">
      <div className="bg-white border-b border-gray-200 md:border-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center">Complete Your Order</h1>
          <div className="w-24 h-1 bg-[#FFD300] mx-auto mt-4"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Customer Info */}
        <div className="bg-white shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="first_name" placeholder="First Name *" value={customer.first_name} onChange={handleChange} className="border border-gray-300 px-4 py-3 col-span-1 md:col-span-2 focus:outline-none focus:border-[#FFD300]" />
            <input type="text" name="last_name" placeholder="Last Name *" value={customer.last_name} onChange={handleChange} className="border border-gray-300 px-4 py-3 col-span-1 md:col-span-2 focus:outline-none focus:border-[#FFD300]" />
            <input type="email" name="email" placeholder="Email *" value={customer.email} onChange={handleChange} className="border border-gray-300 px-4 py-3 col-span-1 md:col-span-2 focus:outline-none focus:border-[#FFD300]" />
            <input type="tel" name="phone" placeholder="Phone *" value={customer.phone} onChange={handleChange} className="border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#FFD300]" />
            <input type="text" name="city" placeholder="City" value={customer.city} onChange={handleChange} className="border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#FFD300]" />
            <input type="text" name="address" placeholder="Street & House Number *" value={customer.address} onChange={handleChange} className="border border-gray-300 px-4 py-3 col-span-1 md:col-span-2 focus:outline-none focus:border-[#FFD300]" />
            <input type="text" name="zip" placeholder="ZIP / Postal Code" value={customer.zip} onChange={handleChange} className="border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#FFD300]" />
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
          <button
            onClick={() => setPaymentType("TAP")}
            className={`p-6 w-full border-2 text-left ${
              paymentType === "TAP"
                ? "border-[#FFD300] bg-[#FFD300]/10"
                : "border-gray-200 hover:border-[#FFD300]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Tap Payment</h3>
              {paymentType === "TAP" && (
                <div className="w-6 h-6 bg-[#FFD300] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#111]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-[#555] text-sm">Pay securely with Tap</p>
          </button>
        </div>

        {/* ✅ Order Summary */}
        <div className="bg-white shadow-lg p-6 md:p-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[#555]">
              <span>Subtotal:</span>
              <span>
                {convertPrice(subtotalParam).toFixed(2)} {currency}
              </span>
            </div>
            <div className="flex justify-between text-[#555]">
              <span>Shipping:</span>
              <span>
                {convertPrice(shippingParam).toFixed(2)} {currency}
              </span>
            </div>
            {isSaudi && (
              <div className="flex justify-between text-[#555]">
                <span>VAT (15%):</span>
                <span>
                  {convertPrice(taxAmount).toFixed(2)} {currency}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-[#FFD300]">
                {convertPrice(total).toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-[#FFD300] text-[#111] py-4 px-6 font-bold text-lg hover:bg-[#E6BE00] transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
