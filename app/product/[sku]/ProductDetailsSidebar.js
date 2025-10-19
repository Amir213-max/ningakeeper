"use client";

import { useEffect, useState } from "react";
import { addToCartTempUser } from "@/app/lib/mutations";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/app/contexts/TranslationContext";

export default function ProductDetailsSidebar({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currencyRate, setCurrencyRate] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const { getCurrencyRate } = await import("../../lib/getCurrencyRate");
        const rate = await getCurrencyRate();
        setCurrencyRate(rate);
      } catch (err) {
        console.error("Error loading currency rate:", err);
      }
    };
    fetchRate();
  }, []);

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
      (label) => attributesMap[label].length > 1
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
  const listPrice = currencyRate
    ? (product.list_price_amount * currencyRate).toFixed(2)
    : "...";
  const finalPrice = currencyRate
    ? (product.price_range_exact_amount * currencyRate).toFixed(2)
    : "...";
  const listCurrency = "SAR";
  const discountPercent = product.productBadges?.[0]?.label || null;
  const hasDiscount = listPrice && finalPrice && finalPrice < listPrice;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Brand */}
      {product.brand?.name && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rotate-45" />
          <span className="text-sm font-medium text-gray-600 uppercase">
            {product.brand.name}
          </span>
        </div>
      )}

      {/* SKU */}
      <div className="text-xs text-gray-400 font-mono">SKU {product.sku}</div>

      {/* Title */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        {hasDiscount && (
          <span className="text-sm text-gray-400 line-through">
            {listCurrency} {listPrice}
          </span>
        )}
        <span className="text-3xl font-bold text-gray-900">
          {listCurrency} {finalPrice}
        </span>
        {discountPercent && (
          <span className="bg-yellow-400 text-gray-900 text-sm font-bold px-2 py-1 rounded">
            {discountPercent}
          </span>
        )}
      </div>

    {Object.keys(attributesMap).length > 0 && (
  <div className="space-y-6">
    {/* 🟨 مجموعة المقاسات والألوان تفضل كما هي */}
    {Object.entries(attributesMap)
      .filter(([label]) => 
        label.toLowerCase().includes("size") ||
        label.toLowerCase().includes("color")
      )
      .sort(([a], [b]) => (a.toLowerCase().includes("size") ? -1 : 1))
      .map(([label, values]) => {
        const isColor = label.toLowerCase().includes("color");
        return (
          <div key={label} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              {label}
            </h3>
            <div
              className={`flex flex-wrap gap-2 ${isColor ? "items-center" : ""}`}
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
                        ? "w-10 h-10 rounded-full border-2"
                        : "px-4 py-2 rounded-lg border-2 text-sm font-medium"
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

    {/* 🟦 باقي الخصائص تكون Dropdowns جنب بعض */}
    <div className="flex flex-wrap gap-4">
      {Object.entries(attributesMap)
        .filter(
          ([label]) =>
            !label.toLowerCase().includes("size") &&
            !label.toLowerCase().includes("color")
        )
        .map(([label, values]) => (
          <div key={label} className="relative min-w-[160px]">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-2">
              {label}
            </h3>
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === label ? null : label)
              }
              className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors"
            >
              <span className="text-gray-900 font-medium">
                {selectedAttributes[label] || `Select ${label}`}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  openDropdown === label ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openDropdown === label && (
                <motion.ul
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                >
                  {values.map((val) => (
                    <li
                      key={val}
                      onClick={() => {
                        setSelectedAttributes((prev) => ({
                          ...prev,
                          [label]: val,
                        }));
                        setOpenDropdown(null);
                      }}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                        selectedAttributes[label] === val
                          ? "bg-gray-100 font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {val}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
    </div>
  </div>
)}


      {/* Quantity Selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
          Quantity
        </h3>
        <div className="relative w-32">
          <button
            onClick={() => setOpenDropdown(openDropdown === "Qty" ? null : "Qty")}
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

         <div className="sticky bottom-0  bg-white pt-4 lg:relative lg:sticky lg:top-6 flex flex-col gap-3">
        {/* زر إضافة للسلة */}
        <button
          onClick={addToCart}
          disabled={adding}
          className="w-full cursor-pointer bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-gray-900 font-bold py-4 px-6 rounded-lg text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {adding ? (
            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full z-50 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              ADD TO BASKET
            </>
          )}
        </button>

        {/* زر Checkout */}
        <Link
          href="/checkout_1"
          className="w-full cursor-pointer text-black bg-yellow-400 hover:bg-yellow-600 z-50 font-bold py-4 px-6 rounded-lg text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
       
          Checkout
          
        </Link>
      </div>



     

    </div>
  );
}
