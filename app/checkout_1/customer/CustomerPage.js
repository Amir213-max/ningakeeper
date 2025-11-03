"use client";
import { CREATE_ORDER_FROM_CART } from "../../lib/mutations";
import { graphqlClient } from "../../lib/graphqlClient";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CustomerPage() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId") ?? "";

  const [paymentType, setPaymentType] = useState(null);
  const [loading, setLoading] = useState(false);

  // Customer Info
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    notes: "",
  });

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const isFormValid =
    customer.name &&
    customer.email &&
    customer.phone &&
    customer.address &&
    customer.city &&
    customer.zip &&
    paymentType;

  const handlePlaceOrder = async () => {
    if (!cartId) {
      alert("لا يوجد Cart ID");
      return;
    }
    if (!isFormValid) {
      alert("من فضلك أكمل كل البيانات المطلوبة واختر وسيلة الدفع");
      return;
    }

    setLoading(true);
    try {
      const res = await graphqlClient.request(CREATE_ORDER_FROM_CART, {
        cart_id: cartId,
        input: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          customer_address: customer.address,
          customer_city: customer.city,
          customer_zip: customer.zip,
          notes: customer.notes,
          payment_status: paymentType === "COD" ? "PENDING" : "PROCESSING",
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
      <div className="bg-white border-b border-gray-200 md:border-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111] text-center">
            Complete Your Order
          </h1>
          <div className="w-24 h-1 bg-[#FFD300] mx-auto mt-4  "></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8">
        {/* Customer Info */}
        <div className="bg-white  shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-[#FFD300]   flex items-center justify-center mr-3">
              <span className="text-[#111] font-bold text-sm">1</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111]">Customer Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="First Name *"
              value={customer.name}
              onChange={handleChange}
              className="border border-gray-300   px-4 py-3 focus:outline-none focus:border-[#FFD300] col-span-1 md:col-span-2"
            />
              <input
              type="text"
              name="name"
              placeholder="Last Name *"
             
              onChange={handleChange}
              className="border border-gray-300   px-4 py-3 focus:outline-none focus:border-[#FFD300] col-span-1 md:col-span-2"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={customer.email}
              onChange={handleChange}
              className="border border-gray-300   px-4 py-3 focus:outline-none focus:border-[#FFD300] col-span-1 md:col-span-2"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={customer.phone}
              onChange={handleChange}
              className="border border-gray-300   px-4 py-3 focus:outline-none focus:border-[#FFD300]"
            />
            <input
              type="text"
              name="city"
              placeholder="City *"
              value={customer.city}
              onChange={handleChange}
              className="border border-gray-300   px-4 py-3 focus:outline-none focus:border-[#FFD300]"
            />
            <input
              type="text"
              name="address"
              placeholder="Address *"
              value={customer.address}
              onChange={handleChange}
              className="border border-gray-300   px-4 py-3 focus:outline-none focus:border-[#FFD300] col-span-1 md:col-span-2"
            />
            <input
              type="text"
              name="zip"
              placeholder="ZIP / Postal Code *"
              value={customer.zip}
              onChange={handleChange}
              className="border border-gray-300   px-4 py-3 focus:outline-none focus:border-[#FFD300]"
            />
            <textarea
              name="notes"
              placeholder="Order Notes (optional)"
              value={customer.notes}
              onChange={handleChange}
              rows={3}
              className="border border-gray-300   px-4 py-3 focus:outline-none focus:border-[#FFD300] col-span-1 md:col-span-2"
            ></textarea>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white  shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-[#FFD300]   flex items-center justify-center mr-3">
              <span className="text-[#111] font-bold text-sm">2</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111]">Payment Method</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentType("COD")}
              className={`p-6   border-2 transition-all duration-200 hover:scale-[1.02] text-left ${
                paymentType === "COD"
                  ? "border-[#FFD300] bg-[#FFD300] bg-opacity-10"
                  : "border-gray-200 hover:border-[#FFD300] hover:border-opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#111] text-lg">Cash on Delivery</h3>
                {paymentType === "COD" && (
                  <div className="w-6 h-6 bg-[#FFD300]   flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#111]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-[#555] text-sm">Pay when your order arrives</p>
            </button>

            <button
              onClick={() => setPaymentType("TAP")}
              className={`p-6   border-2 transition-all duration-200 hover:scale-[1.02] text-left ${
                paymentType === "TAP"
                  ? "border-[#FFD300] bg-[#FFD300] bg-opacity-10"
                  : "border-gray-200 hover:border-[#FFD300] hover:border-opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#111] text-lg">Tap Payment</h3>
                {paymentType === "TAP" && (
                  <div className="w-6 h-6 bg-[#FFD300]   flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#111]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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
        </div>
      </div>

      {/* Place Order Button */}
   
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-[#FFD300] text-[#111] py-4 px-6   font-bold text-lg hover:bg-[#E6BE00] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Place Order
          </button>
        </div>
    

      
        <div className="hidden md:block max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-[#FFD300] text-[#111] py-4 px-6   font-bold text-lg hover:bg-[#E6BE00] transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Order
          </button>
        </div>
   
    </div>
  );
}
