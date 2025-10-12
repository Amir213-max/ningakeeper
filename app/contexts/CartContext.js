"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fetchUserCart, removeItemFromCart } from "../lib/mutations";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      setLoading(true);
      const userCart = await fetchUserCart();
      setCart(userCart);
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeItemFromCart(itemId);
      setCart((prevCart) => ({
        ...prevCart,
        lineItems: prevCart.lineItems.filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, loadCart, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
