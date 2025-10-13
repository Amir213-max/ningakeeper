"use client";

import { useState } from "react";
import { addToCartTempUser } from "@/app/lib/mutations";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ProductDetailsSidebar({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const router = useRouter();

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
  const listPrice = (product.list_price_amount * 4.6).toFixed(2);
  const finalPrice = (product.price_range_exact_amount * 4.6).toFixed(2);
  const listCurrency = "SAR";
  const discountPercent =
    product.productBadges?.[0]?.label || null;
  const hasDiscount = listPrice && finalPrice && finalPrice < listPrice;

  // 🎨 دالة عرض الخيارات
  const renderDropdownOption = (val, label) => {
    const isSelected = selectedAttributes[label] === val;
    const isColor = label.toLowerCase().includes("color");

    return (
      <li
        key={val}
        onClick={() => {
          setSelectedAttributes((prev) => ({
            ...prev,
            [label]: val,
          }));
          setOpenDropdown(null);
        }}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
          isSelected ? "font-semibold text-amber-600" : "text-gray-700"
        }`}
      >
        {isColor && (
          <span
            className="w-5 h-5 rounded-full border border-gray-300"
            style={{ backgroundColor: val.toLowerCase() }}
          />
        )}
        <span>{val}</span>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-5 bg-gray-50 p-4 sm:p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto transition-all">
      {/* 🖼 صورة المنتج */}
      {product.images && product.images.length > 0 && (
        <div className="w-full h-56 sm:h-64 md:h-72 overflow-hidden rounded-xl">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-contain w-full h-full"
          />
        </div>
      )}

      {/* 🏷 بيانات المنتج */}
      <div className="flex flex-col gap-1 text-neutral-800 text-center sm:text-left">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
          {product.name}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">{product.sku}</p>

        {/* 💵 السعر */}
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 justify-center sm:justify-start">
          <div>
            {hasDiscount && (
              <div className="line-through text-gray-400 text-sm">
                {listCurrency} {listPrice}
              </div>
            )}
            <span className="text-xl sm:text-2xl font-bold text-amber-600">
              {listCurrency} {finalPrice}
            </span>
          </div>
          {discountPercent && (
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">
              {discountPercent}
            </span>
          )}
        </div>
      </div>

      {/* 🧩 الخصائص */}
      {Object.keys(attributesMap).length > 0 && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          {Object.entries(attributesMap).map(([label, values]) =>
            values.length > 1 ? (
              <div key={label} className="relative w-full sm:w-auto">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === label ? null : label)
                  }
                  className="w-full sm:min-w-[110px] flex justify-between items-center bg-white rounded-md px-3 py-2 shadow-sm hover:shadow-md transition text-sm font-medium"
                >
                  <span
                    className={`truncate ${
                      selectedAttributes[label]
                        ? "text-amber-600"
                        : "text-gray-400"
                    }`}
                  >
                    {label}:{" "}
                    {selectedAttributes[label] || (
                      <span className="text-gray-400">Select</span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
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
                      className="absolute z-20 w-full sm:w-40 mt-1 bg-white rounded-lg shadow-lg overflow-hidden text-sm"
                    >
                      {values.map((val) => renderDropdownOption(val, label))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* 🔢 الكمية */}
      <div className="relative w-full sm:w-auto">
        <button
          onClick={() => setOpenDropdown(openDropdown === "Qty" ? null : "Qty")}
          className="w-full sm:min-w-[100px] flex justify-between items-center bg-white rounded-md px-3 py-2 shadow-sm hover:shadow-md transition text-sm font-medium"
        >
          <span className="text-amber-600">Qty: {quantity}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
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
              className="absolute z-20 w-full sm:w-32 mt-1 bg-white rounded-lg shadow-lg overflow-hidden text-sm"
            >
              {[...Array(10)].map((_, i) => (
                <li
                  key={i + 1}
                  onClick={() => {
                    setQuantity(i + 1);
                    setOpenDropdown(null);
                  }}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    quantity === i + 1
                      ? "bg-gray-200 font-semibold text-amber-600"
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

      {/* 🛍 الأزرار */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={addToCart}
          disabled={adding}
          className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg text-sm transition"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>

        <button
          onClick={() => router.push("/checkout_1")}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg text-sm transition"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}