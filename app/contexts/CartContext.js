"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fetchUserCart, removeItemFromCart } from "../lib/mutations";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Helper function to get the correct cart key
  const getCartKey = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? `cart_${user.id}` : "guest_cart";
  };

  // 🔹 Load cart
  const loadCart = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        // ✅ Logged-in user → fetch from backend
        const userCart = await fetchUserCart();
        setCart(userCart);
      } else {
        // 🧍 Guest user → load from localStorage
        const savedCart = localStorage.getItem(getCartKey());
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        } else {
          setCart({ lineItems: [] });
        }
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Save guest cart to localStorage whenever it changes
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user && cart) {
      localStorage.setItem(getCartKey(), JSON.stringify(cart));
    }
  }, [cart]);

  // 🔹 Remove item
  const removeItem = async (itemId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        // ✅ Logged-in user → remove via API
        await removeItemFromCart(itemId);
        setCart((prevCart) => ({
          ...prevCart,
          lineItems: prevCart.lineItems.filter((item) => item.id !== itemId),
        }));
      } else {
        // 🧍 Guest user → update localStorage only
        setCart((prevCart) => {
          const updated = {
            ...prevCart,
            lineItems: prevCart.lineItems.filter((item) => item.id !== itemId),
          };
          localStorage.setItem(getCartKey(), JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, loadCart, removeItem, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
