'use client';

import { useState, useEffect } from "react";
import { fetchUserCart, createOrderFromCurrentCart, removeItemFromCart } from "../lib/mutations";

export default function CheckoutClientPage() {
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [removing, setRemoving] = useState(null); // ✅ حالة للحذف

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoadingCart(true);
        const userCart = await fetchUserCart();
        setCart(userCart);
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء جلب الكارت");
      } finally {
        setLoadingCart(false);
      }
    };
    loadCart();
  }, []);

  const handleInputChange = (e) => {
    setCustomerInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setPlacingOrder(true);
      setError(null);
      const order = await createOrderFromCurrentCart({
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhoneNumber: customerInfo.phone,
        customerAddress: customerInfo.address
      });
      console.log("✅ Order Created:", order);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ✅ دالة حذف عنصر من الكارت
  const handleRemoveItem = async (itemId) => {
    try {
      setRemoving(itemId);
      await removeItemFromCart(itemId);
      const updatedCart = await fetchUserCart();
      setCart(updatedCart);
    } catch (err) {
      console.error("❌ Error removing item:", err);
      setError("تعذر حذف المنتج");
    } finally {
      setRemoving(null);
    }
  };

  if (loadingCart) return <p className="text-center mt-6 text-white">جارٍ تحميل الكارت...</p>;
  if (!cart || !cart.lineItems.length) return <p className="text-center mt-6 text-white">الكارت فارغ</p>;

  const subtotal = cart.lineItems.reduce((acc, item) => acc + item.product.price_range_exact_amount * item.quantity, 0);
  const shipping = 20;
  const total = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 min-h-screen bg-gray-100 text-gray-900">
    <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Checkout</h1>
  
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Products List */}
      <div className="lg:col-span-2 space-y-4">
        {cart.lineItems.map(item => (
          <div
            key={item.id}
            className="flex bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300"
          >
            <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
              {item.product.images?.length > 0 ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                  No Img
                </div>
              )}
            </div>
  
            <div className="ml-4 flex-1 flex flex-col justify-between">
              {/* الاسم + زرار الحذف */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">{item.product.name}</h2>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removing === item.id}
                  className="ml-2 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm transition disabled:opacity-50"
                >
                  {removing === item.id ? "..." : "✕"}
                </button>
              </div>
  
              {/* الكمية */}
              <p className="text-gray-600 mt-1">Quantity: {item.quantity}</p>
  
              {/* السعر */}
              <p className="text-right text-lg font-bold text-gray-900">
                ${item.product.price_range_exact_amount * item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
  
      {/* Order Summary & Customer Info */}
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Summary</h2>
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Shipping</span>
            <span>${shipping}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-300 pt-2">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
  
        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Customer Info</h2>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={customerInfo.name}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none bg-gray-50 text-gray-900 placeholder-gray-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={customerInfo.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none bg-gray-50 text-gray-900 placeholder-gray-400"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={customerInfo.phone}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none bg-gray-50 text-gray-900 placeholder-gray-400"
          />
          <textarea
            name="address"
            placeholder="Address"
            value={customerInfo.address}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none bg-gray-50 text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="w-full bg-amber-300 hover:bg-amber-400 cursor-pointer text-white font-bold py-3 rounded-xl transition duration-300 shadow-md hover:shadow-indigo-400/50"
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">Order placed successfully 🎉</p>}
        </div>
      </div>
    </div>
  </div>
  
  );
}
