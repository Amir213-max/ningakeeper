"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { graphqlClient } from "../lib/graphqlClient";
import {
  fetchUserCart,
  removeItemFromCart,
  UPDATE_CART_ITEM_QUANTITY,
  ADD_ITEM_TO_CART,
} from "../lib/mutations";

import { ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import PriceDisplay from "../components/PriceDisplay";
import { useCurrency } from "../contexts/CurrencyContext";
import { gql } from "graphql-request";
import { RECOMMENDED_PRODUCTS_QUERY } from "../lib/queries";

// استعلام جديد حسب طلبك
const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: String!) {
    product(id: $id) {
      id
      name
      sku
      description_ar
      description_en
      images
      variants {
        id
        name
        price
      }
      productAttributeValues {
        id
        key
        attribute {
          id
          label
        }
      }
      brand {
        id
        name
        logo
      }
      productBadges {
        label
        color
      }
      list_price_amount
      list_price_currency
      relative_list_price_difference
      price_range_from
      price_range_to
      price_range_currency
      price_range_exact_amount
      price_range_maximum_amount
      price_range_minimum_amount
    }
  }
`;

export default function CartSidebar({ isOpen, onClose }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [adding, setAdding] = useState(null);
  const { loading: currencyLoading } = useCurrency();

  const loadCart = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      let userCart = null;
// ✅ داخل دالة loadCart()
if (user) {
  userCart = await fetchUserCart();

  // 🧩 دمج كارت الزائر في كارت المستخدم بعد تسجيل الدخول
  const guestCart = JSON.parse(localStorage.getItem("guest_cart"))?.lineItems || [];
  if (guestCart.length > 0 && userCart?.id) {
    for (const item of guestCart) {
      try {
        await graphqlClient.request(ADD_ITEM_TO_CART, {
          input: {
            cart_id: userCart.id,
            product_id: item.productId, // ✅ تصحيح هنا
            quantity: item.quantity,
          },
        });
      } catch (err) {
        console.warn("⚠️ Failed to merge guest item:", item.productId, err);
      }
    }
    localStorage.removeItem("guest_cart"); // ✅ بعد الدمج
    userCart = await fetchUserCart(); // ✅ إعادة تحميل الكارت
  }
}
  else {
  const guestCart = JSON.parse(localStorage.getItem("guest_cart")) || { lineItems: [] };
  if (guestCart.lineItems.length > 0) {
   // === استبدل هذا الجزء داخل loadCart() ===
const fullGuestCart = await Promise.all(
  guestCart.lineItems.map(async (item, index) => {
    try {
      // 1) لو الـ item بالفعل فيه object product كامل، استخدمه مباشرة
      if (item.product && item.product.id) {
        return {
          id: index,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
            list_price_amount: item.product.list_price_amount ?? 0,
            price_range_exact_amount: item.product.price_range_exact_amount ?? 0,
            images: Array.isArray(item.product.images) && item.product.images.length
              ? item.product.images
              : ["/no-img.png"],
            productBadges: item.product.productBadges || [],
          },
        };
      }

      // 2) حاول نجيب الـ productId من الحقول المتنوعة
      const productId = item.product?.id || item.productId || item.product_id || item.id_product || item.id || null;

      if (!productId) {
        console.warn("⚠️ Missing productId for guest item, using minimal fallback:", item);
        // مهم: لا نضع id = "unknown" — نتركه بدون id صالح ليتم تجاهله لاحقًا من طلب التوصيات
        return {
          id: index,
          quantity: item.quantity,
          product: {
            // لا تقم بوضع id هنا
            name: item.name || "Unknown Product",
            list_price_amount: item.price || 0,
            price_range_exact_amount: item.price || 0,
            images: item.image ? [item.image] : ["/no-img.png"],
            productBadges: [],
          },
        };
      }

      // 3) لو عندنا productId جرب نجيب الداتا من الـ API
      const data = await graphqlClient.request(GET_PRODUCT_BY_ID, { id: productId });
      const product = data?.product;

      if (!product) {
        console.warn("⚠️ Product API returned no product for id:", productId);
        return {
          id: index,
          quantity: item.quantity,
          product: {
            name: item.name || "Unknown Product",
            list_price_amount: item.price || 0,
            price_range_exact_amount: item.price || 0,
            images: ["/no-img.png"],
            productBadges: [],
          },
        };
      }

      return {
        id: index,
        quantity: item.quantity,
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          list_price_amount: product.list_price_amount ?? 0,
          price_range_exact_amount: product.price_range_exact_amount ?? 0,
          images: Array.isArray(product.images) && product.images.length ? product.images : ["/no-img.png"],
          productBadges: product.productBadges || [],
        },
      };
    } catch (err) {
      console.error("Failed to fetch product for guest cart", err, item);
      return {
        id: index,
        quantity: item.quantity,
        product: {
          name: item.name || "Unknown Product",
          list_price_amount: item.price || 0,
          price_range_exact_amount: item.price || 0,
          images: ["/no-img.png"],
          productBadges: [],
        },
      };
    }
  })
);

    userCart = { id: "guest", lineItems: fullGuestCart };
  } else {
    userCart = { id: "guest", lineItems: [] };
  }
}


      setCart(userCart);
      console.log("🧺 Loaded Cart:", userCart);

      // توصيات المنتجات
      if (userCart?.lineItems?.length > 0) {
const productIds = userCart.lineItems
  .map((item) => item.product?.id)
  .filter((id) => typeof id === "string" && id.trim().length > 0 && id !== "unknown");

        if (productIds.length === 0) return setRecommended([]);

        const results = await Promise.all(
          productIds.map(async (productId) => {
            try {
              const data = await graphqlClient.request(RECOMMENDED_PRODUCTS_QUERY, { productId });
              return data?.productsWithCategoryRecommendations?.recommended_products || [];
            } catch (err) {
              console.error("⚠️ Error fetching recommendations for:", productId, err);
              return [];
            }
          })
        );

        const allRecommendations = results.flat();
        const uniqueRecommendations = Array.from(
          new Map(allRecommendations.map((p) => [p.id, p])).values()
        );
        setRecommended(uniqueRecommendations.slice(-10));
      } else setRecommended([]);

    } catch (err) {
      console.error("❌ Error loading cart:", err);
      toast.error("Failed to load cart");
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
      if (cart.id === "guest") {
        const updatedCart = { ...cart, lineItems: cart.lineItems.filter((i) => i.id !== itemId) };
        setCart(updatedCart);
        localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
      } else {
        await removeItemFromCart(itemId);
        setCart((prev) => ({
          ...prev,
          lineItems: prev.lineItems.filter((i) => i.id !== itemId),
        }));
      }
      toast.success("🗑️ Item removed");
    } catch (err) {
      console.error("❌ Error removing item:", err);
      toast.error("Error removing item");
    } finally {
      setRemoving(null);
    }
  };

  const handleQuantityChange = async (itemId, currentQty, type) => {
    const newQty = type === "increase" ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return;

    try {
      setUpdating(itemId);
      if (cart.id === "guest") {
        const updatedCart = {
          ...cart,
          lineItems: cart.lineItems.map((item) =>
            item.id === itemId ? { ...item, quantity: newQty } : item
          ),
        };
        setCart(updatedCart);
        localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
      } else {
        setCart((prev) => ({
          ...prev,
          lineItems: prev.lineItems.map((item) =>
            item.id === itemId ? { ...item, quantity: newQty } : item
          ),
        }));
        await graphqlClient.request(UPDATE_CART_ITEM_QUANTITY, { id: itemId, quantity: newQty });
      }
      toast.success("✅ Quantity updated");
    } catch (err) {
      console.error("❌ Error updating quantity:", err);
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };
// ✅ داخل handleAddToCart()
const handleAddToCart = async (productId) => {
  try {
    setAdding(productId);
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      const userCart = await fetchUserCart();
      const cartId = userCart?.id;
      if (!cartId) {
        toast.error("Cart not found, please refresh.");
        return;
      }

      await graphqlClient.request(ADD_ITEM_TO_CART, {
        input: { cart_id: cartId, product_id: productId, quantity: 1 },
      });
    } else {
      // 🧍‍♂️ الزائر
      const cartKey = "guest_cart";
      const existingCart = JSON.parse(localStorage.getItem(cartKey)) || { lineItems: [] };
      const existingItemIndex = existingCart.lineItems.findIndex(
        (item) => item.productId === productId
      );

   if (existingItemIndex >= 0) {
  existingCart.lineItems[existingItemIndex].quantity += 1;
} else {
  // 🧩 جلب بيانات المنتج وتخزينها كاملة في الكارت
  const { product } = await graphqlClient.request(GET_PRODUCT_BY_ID, { id: productId });

  existingCart.lineItems.push({
    productId,
    quantity: 1,
    product: {
      id: product.id,
      name: product.name,
      sku: product.sku,
      list_price_amount: product.list_price_amount,
      price_range_exact_amount: product.price_range_exact_amount,
      images: product.images,
      productBadges: product.productBadges || [],
    },
  });
}


      localStorage.setItem(cartKey, JSON.stringify(existingCart));
    }

    await loadCart();
    toast.success("Added to cart!");
  } catch (err) {
    console.error("❌ Error adding product:", err);
    toast.error("Error adding product");
  } finally {
    setAdding(null);
  }
};


  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b bg-white shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">🛒 Your Cart</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">✕</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : !cart || !cart.lineItems?.length ? (
          <p className="text-center text-gray-500 italic">Your cart is empty 🛍️</p>
        ) : (
          <>
            <div className="space-y-4">
              {cart.lineItems.map((item) => {
                const product = item.product || {};
                const finalPrice = product.price_range_exact_amount || product.list_price_amount || 0;
                return (
                  <motion.div key={item.id} layout transition={{ duration: 0.25, ease: "easeInOut" }} className="flex items-center justify-between bg-white shadow-sm p-3 hover:shadow-md transition">
                    <div className="flex items-center space-x-3">
                      <img src={product.images?.[0] || "/no-img.png"} alt={product.name || "Product"} className="w-16 h-16 object-fill-fit border" />
                      <div>
                        <p className="font-semibold text-gray-800">{product.name || item.name || "Product"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => handleQuantityChange(item.id, item.quantity, "decrease")} disabled={updating === item.id || item.quantity === 1} className="w-7 h-7 flex items-center justify-center border border-gray-300 bg-gray-100 hover:bg-red-100 text-red-600 font-bold transition">
                            {updating === item.id ? <Loader2 size={14} className="animate-spin" /> : "−"}
                          </button>
                          <span className="w-6 text-center font-medium text-gray-800">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, item.quantity, "increase")} disabled={updating === item.id} className="w-7 h-7 flex items-center justify-center border border-gray-300 bg-gray-100 hover:bg-green-100 text-green-600 font-bold transition">
                            {updating === item.id ? <Loader2 size={14} className="animate-spin" /> : "+"}
                          </button>
                        </div>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          <PriceDisplay price={finalPrice * item.quantity} loading={currencyLoading} />
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveItem(item.id)} disabled={removing === item.id} className="text-sm px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50">
                      {removing === item.id ? "..." : "Remove"}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Recommended Products */}
            {recommended.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Recommended for you</h3>
                <div className="grid grid-cols-2 gap-3">
                  {recommended.map((prod) => {
                    const discountPercent = prod.relative_list_price_difference ? Math.round(prod.relative_list_price_difference * 100) : 0;
                    const hasDiscount = prod.price_range_exact_amount < prod.list_price_amount;

                    return (
                      <motion.div key={prod.id} whileHover={{ scale: 1.03 }} className="bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <Link href={`/product/${prod.sku}`} className="block p-2">
                          <img src={prod.images?.[0] || "/no-img.png"} alt={prod.name} className="w-full h-24 object-contain mb-1" />
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{prod.name}</p>
                          <div className="flex items-center gap-1 mb-2">
                            {hasDiscount ? (
                              <>
                                <span className="text-sm text-gray-400 line-through">
                                  <PriceDisplay price={prod.list_price_amount} loading={currencyLoading} />
                                </span>
                                <span className="text-sm text-green-600 font-bold">
                                  <PriceDisplay price={prod.price_range_exact_amount} loading={currencyLoading} />
                                </span>
                                <span className="text-xs text-red-500 font-bold">-{discountPercent}%</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-800 font-semibold">
                                <PriceDisplay price={prod.list_price_amount} loading={currencyLoading} />
                              </span>
                            )}
                          </div>
                        </Link>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(prod.id)} disabled={adding === prod.id} className={`flex items-center justify-center gap-1 w-full py-1.5 font-medium text-sm transition ${adding === prod.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                          {adding === prod.id ? <Loader2 size={16} className="animate-spin" /> : <><ShoppingCart size={16} /><span className="text-lg font-bold">+</span></>}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-md p-4">
        {cart?.lineItems?.length > 0 && (
          <button onClick={() => (window.location.href = "/checkout_1")} className="w-full bg-black cursor-pointer text-white py-3 font-semibold hover:bg-gray-800 transition">
            Checkout →
          </button>
        )}
      </div>
    </div>
  );
}
