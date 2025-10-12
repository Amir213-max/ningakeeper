"use client";

import { useState, useEffect } from "react";
import { fetchUserCart, removeItemFromCart } from "../lib/mutations";

export default function CartSidebar({ isOpen, onClose }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const loadCart = async () => {
    try {
      setLoading(true);
      const userCart = await fetchUserCart(); // ✅ نفس اللي في checkout
      setCart(userCart);
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadCart();
  }, [isOpen]);

  const handleRemoveItem = async (itemId) => {
    try {
      setRemoving(itemId);
      await removeItemFromCart(itemId);
      await loadCart(); // ✅ نرجع نحدث الكارت
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b bg-white shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">🛒 Your Cart</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="p-4 text-gray-600">Loading...</p>
      ) : !cart || !cart.lineItems?.length ? (
        <p className="p-6 text-center text-gray-500 italic">
          Your cart is empty 🛍️
        </p>
      ) : (
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-70px)]">
          {cart.lineItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white rounded-xl shadow-sm p-3 hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={item.product.images?.[0] || "/no-img.png"}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: <span className="font-medium">{item.quantity}</span>
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    ${(item.product.list_price_amount * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                disabled={removing === item.id}
                className="text-sm px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50"
              >
                {removing === item.id ? "..." : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {cart?.lineItems?.length > 0 && (
        <div className="p-4 border-t bg-white shadow-sm">
          <button
            onClick={() => (window.location.href = "/checkout")}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Checkout →
          </button>
        </div>
      )}
    </div>
  );
}
