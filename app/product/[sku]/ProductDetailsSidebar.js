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

  // ✅ تجهيز الـ attributes بدون تكرار
  const attributesMap = {};
  product.productAttributeValues?.forEach((val) => {
    if (!attributesMap[val.attribute.label]) {
      attributesMap[val.attribute.label] = [];
    }
    if (!attributesMap[val.attribute.label].includes(val.key)) {
      attributesMap[val.attribute.label].push(val.key);
    }
  });

  // ➕ إضافة المنتج للكارت
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

  // 🟡 دالة تعرض الأوبشنز باللون + مربع صغير لو Color
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
          isSelected ? "font-bold text-amber-500" : "text-gray-700"
        }`}
      >
        {isColor && (
          <span
            className="w-5 h-5 rounded-full border"
            style={{ backgroundColor: val.toLowerCase() }}
          />
        )}
       <span>{val}</span>

      </li>
    );
  };

  // ✅ حساب السعر
  const listPrice = (product.list_price_amount *4.6);
  const finalPrice = (product.price_range_exact_amount *4.6) ;
  const listCurrency = "SAR" ;

  const hasDiscount =
    listPrice && finalPrice && finalPrice < listPrice;

  const discountPercent =
    hasDiscount && listPrice > 0
      ? Math.round(((listPrice - finalPrice) / listPrice) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-5 bg-gray-50 p-6 rounded-2xl shadow-lg w-full">
      {/* صورة المنتج */}
      {product.images && product.images.length > 0 && (
        <div className="w-full h-64 overflow-hidden rounded-xl">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* بيانات المنتج */}
      <div className="flex flex-col gap-2 text-neutral-800">
        <h2 className="text-xl font-bold">{product.name}</h2>
        <p className="text-sm text-gray-500">{product.sku}</p>

        {/* الأسعار */}
        <div className="mt-1 flex items-center gap-2">
          {hasDiscount ? (
            <div>
              <div className="line-through text-gray-500 text-sm">
                List Price : {listPrice}
              </div>
              <span className="text-lg font-bold text-amber-600">
                {listCurrency} {finalPrice}
              </span>
              <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">
                -{discountPercent}%
              </span>
            </div>
          ) : (
            <span className="text-lg font-semibold text-amber-600">
              {listCurrency} {finalPrice || listPrice || "N/A"}
            </span>
          )}
        </div>
      </div>

      {/* الخصائص */}
      {Object.keys(attributesMap).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(attributesMap).map(([label, values]) =>
            values.length > 1 ? (
              <div key={label} className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === label ? null : label)
                  }
                  className="min-w-[90px] flex justify-between items-center bg-white rounded-md px-2 py-1 shadow-sm hover:shadow-md transition text-sm"
                >
                  <span
                    className={`truncate ${
                      selectedAttributes[label]
                        ? "text-amber-600 font-semibold"
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
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 w-40 mt-1 bg-white rounded-lg shadow-lg overflow-hidden text-sm"
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

      {/* الكمية */}
      <div className="relative w-fit">
        <button
          onClick={() => setOpenDropdown(openDropdown === "Qty" ? null : "Qty")}
          className="min-w-[80px] flex justify-between items-center bg-white rounded-md px-2 py-1 shadow-sm hover:shadow-md transition text-sm"
        >
          <span className="text-amber-600 font-semibold">Qty: {quantity}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openDropdown === "Qty" ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {openDropdown === "Qty" && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-28 mt-1 bg-white rounded-lg shadow-lg overflow-hidden text-sm"
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
                      ? "bg-gray-200 font-bold text-amber-500"
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

      {/* الأزرار */}
      <div className="flex flex-col gap-2 mt-3">
        <button
          onClick={addToCart}
          disabled={adding}
          className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>

        <button
          onClick={() => router.push("/checkout_1")}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
