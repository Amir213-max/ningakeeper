"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { gql } from "graphql-request";
import { graphqlClient } from "../lib/graphqlClient";
import { fetchUserCart, REMOVE_ITEM_FROM_CART, UPDATE_CART_ITEM_QUANTITY } from "../lib/mutations";
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
  const [loadingItem, setLoadingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);

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

  const handleRemoveItem = async (itemId) => {
    try {
      setRemovingItem(itemId);
      await new Promise((resolve) => setTimeout(resolve, 300)); // Delay for animation
      await graphqlClient.request(REMOVE_ITEM_FROM_CART, { id: itemId });
      setCart((prev) => ({
        ...prev,
        lineItems: prev.lineItems.filter((i) => i.id !== itemId),
      }));
    } catch (err) {
      console.error("Error removing item:", err);
      alert("حدث خطأ أثناء حذف المنتج، حاول مرة أخرى.");
    } finally {
      setRemovingItem(null);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setLoadingItem(itemId);
      await graphqlClient.request(UPDATE_CART_ITEM_QUANTITY, {
        id: itemId,
        quantity: newQuantity,
      });

      setCart((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((i) =>
          i.id === itemId ? { ...i, quantity: newQuantity } : i
        ),
      }));
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("حدث خطأ أثناء تحديث الكمية");
    } finally {
      setLoadingItem(null);
    }
  };

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

  const totalAfterDiscount = cartSubtotal - discountAmount;
  const selectedCountryData = countries.find((c) => c.id === selectedCountry);

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

  if (!cart)
    return (
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
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-[#FFD300] rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#111] font-bold text-sm">1</span>
                </div>
                <h2 className="text-2xl font-bold text-[#111]">Your Cart</h2>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                 {cart.lineItems.map((item) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
    className="relative flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
  >
    {/* زر الإزالة */}
    <button
      onClick={() => handleRemoveItem(item.id)}
      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"
      title="Remove item"
    >
      ✕
    </button>

    <div className="flex gap-3 items-center w-full flex-col sm:flex-row sm:items-start">
      {/* صورة المنتج */}
      <div className="flex-shrink-0 w-24 h-24 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden">
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

      {/* معلومات المنتج */}
      <div className="flex flex-col sm:flex-1 sm:justify-between w-full sm:w-auto text-center sm:text-left">
        <h3 className="font-semibold text-[#111] text-sm md:text-base line-clamp-2 mb-2 sm:mb-1">
          {item.product.name}
        </h3>

        {/* التحكم في الكمية */}
        <div className="flex justify-center sm:justify-start items-center gap-3 mt-1 mb-3">
          <button
            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
            disabled={loadingItem === item.id}
            className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            -
          </button>
          <span className="w-6 text-center font-medium text-[#111]">
            {loadingItem === item.id ? "..." : item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
            disabled={loadingItem === item.id}
            className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            +
          </button>
        </div>

        {/* السعر */}
        <div className="flex justify-center sm:justify-end">
          <PriceDisplay
            price={item.product.price_range_exact_amount * item.quantity}
            size="base"
          />
        </div>
      </div>
    </div>
  </motion.div>
))}

                </AnimatePresence>
              </div>

              {/* Coupon Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-[#111] mb-4">
                  Discount Code
                </h3>
                <div className="flex flex-wrap gap-3">
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

          {/* Right Column */}
          <div className="space-y-6">
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
                    <span>
                      -{" "}
                      <PriceDisplay price={discountAmount} showCurrency={true} />
                    </span>
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
                      <span>
                        +{" "}
                        <PriceDisplay price={taxAmount} showCurrency={true} />
                      </span>
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
