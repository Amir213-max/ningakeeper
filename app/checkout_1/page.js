"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gql } from "graphql-request";
import { graphqlClient } from "../lib/graphqlClient";
import { fetchUserCart } from "../lib/mutations";
import PriceDisplay from "../components/PriceDisplay";

const GET_COUNTRIES = gql`
  query {
    countries {
      id
      name
      code
      normal_shipping_cost
      fast_shipping_cost
    }
  }
`;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [cartId, setCartId] = useState("1");
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    const loadCart = async () => {
      const userCart = await fetchUserCart();
      setCart(userCart);
    };
    loadCart();
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      const res = await graphqlClient.request(GET_COUNTRIES);
      setCountries(res.countries);
    };
    loadCountries();
  }, []);

  const applyCoupon = () => {
    if (!couponCode) {
      alert("من فضلك أدخل كود الخصم");
      return;
    }
    setAppliedCoupon(couponCode);
    setDiscountAmount(50);
    alert(`تم تطبيق الكوبون: ${couponCode}`);
  };

  const cartSubtotal = cart
    ? cart.lineItems.reduce(
        (sum, i) => sum + i.product.price_range_exact_amount * i.quantity,
        0
      )
    : 0;

  // المجموع بعد الخصم
  const totalAfterDiscount = cartSubtotal - discountAmount;

  // تحديد الدولة المختارة
  const selectedCountryData = countries.find((c) => c.id === selectedCountry);

  // حساب الضريبة لو الدولة هي السعودية
  const isSaudi =
    selectedCountryData &&
    (selectedCountryData.name.toLowerCase().includes("saudi") ||
      selectedCountryData.code === "SA");

  const taxRate = isSaudi ? 0.15 : 0;
  const taxAmount = totalAfterDiscount * taxRate;
  const totalWithTax = totalAfterDiscount + taxAmount;

  const handleContinue = () => {
    if (!selectedCountry) {
      alert("من فضلك اختر الدولة");
      return;
    }
    const params = new URLSearchParams({
      cartId,
      countryId: selectedCountry,
      appliedCoupon: appliedCoupon || "",
    });
    router.push(`/checkout_1/customer?${params.toString()}`);
  };

  if (!cart) return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD300] mx-auto mb-4"></div>
        <p className="text-[#111] text-lg">Loading your cart...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 text-[#111]">
      {/* Header */}
      <div className="bg-white md:bg-gray-50 border-b border-gray-200 md:border-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111] text-center">
            Checkout
          </h1>
          <div className="w-24 h-1 bg-[#FFD300] mx-auto mt-4 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Cart Summary */}
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-[#FFD300] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#111] font-bold text-sm">1</span>
                </div>
                <h2 className="text-2xl font-bold text-[#111]">Your Cart</h2>
              </div>
              
              <div className="space-y-4">
                {cart.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg overflow-hidden">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-[#111] text-sm md:text-base line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-[#555] text-sm">Quantity: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <PriceDisplay 
                        price={item.product.price_range_exact_amount * item.quantity}
                        size="base"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-[#111] mb-4">Discount Code</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#FFD300] focus:ring-2 focus:ring-[#FFD300] focus:ring-opacity-20 outline-none transition-all duration-200 text-[#111] placeholder-[#555]"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-[#FFD300] text-[#111] px-6 py-3 rounded-xl font-semibold hover:bg-[#E6BE00] transition-colors duration-200 whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Country Selection & Continue */}
          <div className="space-y-6">
            {/* Country Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-[#FFD300] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#111] font-bold text-sm">2</span>
                </div>
                <h2 className="text-2xl font-bold text-[#111]">Shipping Destination</h2>
              </div>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[#111] font-medium mb-2 block">Select Country</span>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#FFD300] focus:ring-2 focus:ring-[#FFD300] focus:ring-opacity-20 outline-none transition-all duration-200 text-[#111] bg-white"
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-[#111] mb-6">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[#555]">
                  <span>Subtotal:</span>
                  <PriceDisplay price={cartSubtotal} showCurrency={true} />
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>- <PriceDisplay price={discountAmount} showCurrency={true} /></span>
                  </div>
                )}

                {isSaudi && (
                  <>
                    <div className="flex justify-between text-[#555]">
                      <span>Subtotal (excl. tax):</span>
                      <PriceDisplay price={totalAfterDiscount} showCurrency={true} />
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>VAT (15%):</span>
                      <span>+ <PriceDisplay price={taxAmount} showCurrency={true} /></span>
                    </div>
                  </>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-[#111]">
                    <span>Total:</span>
                    <span className="text-[#FFD300]">
                      <PriceDisplay 
                        price={isSaudi ? totalWithTax : totalAfterDiscount} 
                        showCurrency={true} 
                        size="lg"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-[#FFD300] text-[#111] py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#E6BE00] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Continue to Shipping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
