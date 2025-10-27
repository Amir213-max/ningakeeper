"use client";

import { useEffect, useState } from "react";
import { addToCartTempUser } from "@/app/lib/mutations";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/app/contexts/TranslationContext";
import { useCurrency } from "@/app/contexts/CurrencyContext";

export default function ProductDetailsSidebar({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currency,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
    loading: currencyLoading,
  } = useCurrency();

  // 🧩 تجهيز الخصائص
  const attributesMap = {};
  product.productAttributeValues?.forEach((val) => {
    if (!attributesMap[val.attribute.label]) {
      attributesMap[val.attribute.label] = [];
    }
    if (!attributesMap[val.attribute.label].includes(val.key)) {
      attributesMap[val.attribute.label].push(val.key);
    }
  });

  // 🛒 إضافة المنتج للسلة
  const addToCart = async () => {
    const requiredAttributes = Object.keys(attributesMap).filter(
      (label) =>
        label.toLowerCase().includes("size") ||
        label.toLowerCase().includes("color")
    );

    const missing = requiredAttributes.filter(
      (attr) => !selectedAttributes[attr]
    );

    if (missing.length > 0) {
      alert(`Please select: ${missing.join(", ")}`);
      return;
    }

    setAdding(true);
    try {
      await addToCartTempUser(
        product.id,
        quantity,
        product.list_price_amount || 0
      );
      alert(`${product.name} added to cart!`);
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      alert("Failed to add to cart. Check console for details.");
    } finally {
      setAdding(false);
    }
  };

  // 💰 الأسعار
  const listPrice = currencyLoading
    ? "..."
    : convertPrice(product.list_price_amount || 0);
  const finalPrice = currencyLoading
    ? "..."
    : convertPrice(product.price_range_exact_amount || 0);
  const listPriceFormatted = currencyLoading
    ? "..."
    : formatPrice(product.list_price_amount || 0);
  const finalPriceFormatted = currencyLoading
    ? "..."
    : formatPrice(product.price_range_exact_amount || 0);
  const currencySymbol = getCurrencySymbol();
  const discountPercent = product.productBadges?.[0]?.label || null;
  const hasDiscount = listPrice && finalPrice && finalPrice < listPrice;

  return (
    <div
      className="
        flex flex-col gap-3 w-full 
        sm:px-2 md:px-3 
        lg:px-0
        max-md:mt-6
      "
    >
      {/* ✅ Brand Section */}
      {product.brand?.name && (
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-gray-400 rotate-45" />
          <div className="relative w-16 h-8 sm:w-20 sm:h-10 flex items-center justify-center">
            <img
              src={product.brand.logo}
              alt={product.brand.name}
              className="w-full h-full object-contain bg-gray-100 rounded-md"
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 uppercase">
            {product.brand.name}
          </span>
        </div>
      )}

      {/* SKU */}
      <div className="text-xs text-gray-400 font-mono">SKU {product.sku}</div>

      {/* Title */}
      <h1 className="text-xl sm:text-xl lg:text-xl font-bold text-gray-900 leading-tight break-words">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex flex-wrap items-center gap-3">
        {hasDiscount && (
          <span className="text-sm text-gray-400 line-through">
            {listPriceFormatted}
          </span>
        )}
        <span className="text-xl sm:text-xl font-bold text-gray-900">
          {finalPriceFormatted}
        </span>
        {discountPercent && (
          <span className="bg-yellow-400 text-gray-900 text-sm font-bold px-2 py-1 rounded">
            {discountPercent}
          </span>
        )}
      </div>

      {/* Attributes */}
      {Object.keys(attributesMap).length > 0 && (
        <div className="space-y-6">
          {Object.entries(attributesMap)
            .filter(
              ([label]) =>
                label.toLowerCase().includes("size") ||
                label.toLowerCase().includes("color")
            )
            .sort(([a], [b]) =>
              a.toLowerCase().includes("size") ? -1 : 1
            )
            .map(([label, values]) => {
              const isColor = label.toLowerCase().includes("color");
              return (
                <div key={label} className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    {label}
                  </h3>
                  <div
                    className={`flex flex-wrap gap-2 ${
                      isColor ? "items-center" : ""
                    }`}
                  >
                    {values.map((val) => {
                      const selected = selectedAttributes[label] === val;
                      return (
                        <button
                          key={val}
                          onClick={() =>
                            setSelectedAttributes((prev) => ({
                              ...prev,
                              [label]: val,
                            }))
                          }
                          className={`${
                            isColor
                              ? "w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2"
                              : "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 text-sm font-medium"
                          } transition-all duration-200 ${
                            selected
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                          style={
                            isColor
                              ? { backgroundColor: val.toLowerCase() }
                              : undefined
                          }
                        >
                          {!isColor && val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
          Quantity
        </h3>
        <div className="relative w-28 sm:w-32">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "Qty" ? null : "Qty")
            }
            className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors"
          >
            <span className="text-gray-900 font-medium">{quantity}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                openDropdown === "Qty" ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {openDropdown === "Qty" && (
              <motion.ul
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
              >
                {[...Array(10)].map((_, i) => (
                  <li
                    key={i + 1}
                    onClick={() => {
                      setQuantity(i + 1);
                      setOpenDropdown(null);
                    }}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                      quantity === i + 1
                        ? "bg-gray-100 font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ✅ Buttons Section */}
      <div className="sticky bottom-0 bg-white  pt-2 pb-2 
                      flex flex-col gap-2 
                      lg:relative lg:top-6 lg:pb-0">
        <button
          onClick={addToCart}
          disabled={adding}
          className="w-full cursor-pointer bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-gray-900 font-bold py-2 sm:py-3 px-4 rounded-lg text-base sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {adding ? (
            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              ADD TO BASKET
            </>
          )}
        </button>

        <Link
          href="/checkout_1"
          className="w-full cursor-pointer bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-gray-900 font-bold py-2 sm:py-3 px-4 rounded-lg text-base sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
