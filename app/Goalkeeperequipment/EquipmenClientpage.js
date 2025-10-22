"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import BrandsSlider from "../Componants/brandsSplide_1";
import FilterDropdown from "../Componants/CheckboxDropdown ";
import ProductSlider from "../Componants/ProductSlider";
import Sidebar from "../Componants/sidebar";
import { useTranslation } from "../contexts/TranslationContext";
import { graphqlClient } from "../lib/graphqlClient";
import { GET_CATEGORIES_QUERY } from "../lib/queries";
import { useCategory } from "../contexts/CategoryContext";

export default function EquipmentClientPage({ products, brands, attributeValues }) {
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const { selectedCategoryId, setSelectedCategoryId } = useCategory();
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const { t, language } = useTranslation();
  const isRTL = language === "ar"; // ✅ اتجاه الموقع
const [currencyRate, setCurrencyRate] = useState(null);

useEffect(() => {
  const fetchRate = async () => {
    try {
      const { getCurrencyRate } = await import("../lib/getCurrencyRate");
      const rate = await getCurrencyRate();
      setCurrencyRate(rate);
    } catch (err) {
      console.error("Error loading currency rate:", err);
    }
  };
  fetchRate();
}, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await graphqlClient.request(GET_CATEGORIES_QUERY);
        setCategories(data.rootCategories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Filter products
  useEffect(() => {
    const result = products.filter((product) => {
      const brandMatch = !selectedBrand || product.brand?.name === selectedBrand;

      const attrs = product.productAttributeValues || [];
      const attributesMatch = Object.entries(selectedAttributes).every(
        ([attrLabel, selectedVals]) => {
          if (!selectedVals || selectedVals.length === 0) return true;
          const selectedLower = selectedVals.map((v) => String(v).toLowerCase());
          return attrs.some(
            (pav) =>
              String(pav.attribute?.label || pav.attribute?.key || "")
                .toLowerCase() === String(attrLabel).toLowerCase() &&
              selectedLower.includes(String(pav.key ?? "").toLowerCase())
          );
        }
      );

      const categoryMatch =
        !selectedCategoryId ||
        (product.rootCategories || []).some(
          (cat) => String(cat.id) === String(selectedCategoryId)
        );

      return brandMatch && attributesMatch && categoryMatch;
    });

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedBrand, selectedAttributes, selectedCategoryId]);

  const categoriesWithProducts = useMemo(() => {
    return categories.filter((cat) =>
      products.some((product) =>
        (product.rootCategories || []).some((pCat) => pCat.id === cat.id)
      )
    );
  }, [categories, products]);

  useEffect(() => {
    const cat = categoriesWithProducts.find((c) => c.id === selectedCategoryId);
    setSelectedCategoryName(cat?.name || null);
  }, [selectedCategoryId, categoriesWithProducts]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getBadgeColor = (label) => {
    if (!label) return "bg-gray-400";
    if (label.toLowerCase().includes("new")) return "bg-green-500";
    if (label.includes("%") || label.toLowerCase().includes("off")) return "bg-gray-500";
    return "bg-yellow-500";
  };

  return (
    <div className={`bg-[#373e3e] ${isRTL ? "rtl" : "ltr"}`}>
      <div className="grid pt-1 grid-cols-1 lg:grid-cols-5">
        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-1 bg-black h-auto">
          <Sidebar
            categories={categoriesWithProducts}
            onSelectCategory={(catId) => {
              if (catId === selectedCategoryId) {
                setSelectedCategoryId(null);
                setSelectedCategoryName(null);
              } else {
                setSelectedCategoryId(catId);
              }
            }}
            isRTL={isRTL} // ✅ تمرير اتجاه اللغة
          />
        </div>

        {/* Products Section */}
        <div className="md:col-span-4 p-4 bg-white">
          <h1 className="text-4xl text-[#1f2323] p-2">
            {selectedCategoryName || t("Goalkeeper Equipmen")}
          </h1>

          <BrandsSlider
            brands={brands}
            selectedBrand={selectedBrand}
            direction={isRTL ? "rtl" : "ltr"}
            onBrandClick={(brand) =>
              setSelectedBrand(brand === selectedBrand ? null : brand)
            }
          />

          <div className="flex mb-4 gap-3 flex-wrap">
            <FilterDropdown
              attributeValues={attributeValues}
              onFilterChange={setSelectedAttributes}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 p-2 sm:p-4">
            {currentProducts.map((product) => (
              <div
                key={product.sku}
                className="relative bg-gradient-to-br from-white to-neutral-300 shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
              {product.productBadges?.length > 0 &&
  product.productBadges[0]?.label && (
    <div
      className="absolute top-3 left-[-20px] w-[90px] text-center text-white text-xs font-bold py-1 rotate-[-45deg] shadow-md z-10"
      style={{
        backgroundColor: product.productBadges[0]?.color || "#888", // fallback gray if no color
      }}
    >
      {product.productBadges[0].label}
    </div>
  )}


                <div className="flex justify-center items-center h-[220px]">
                  <ProductSlider images={product.images} productName={product.name} />
                </div>

                <Link
                  href={`/product/${encodeURIComponent(product.sku)}`}
                  className="p-4 flex flex-col flex-grow justify-between"
                >
                

                  <h3 className="text-base text-gray-700 text-center font-bold mb-1">
                    {product.brand?.name}
                  </h3>

                  <p className="text-center text-sm text-gray-500 line-clamp-2 mb-3">
                    {product.name}
                  </p>

                  <div className="text-center">
                 
                    {currencyRate && (
                      <>
                       {product.list_price_amount !== product.price_range_exact_amount && (
                      <div className="line-through text-gray-500 text-sm">
                        SAR {(product.list_price_amount * currencyRate).toFixed(2)}
                      </div>
                    )}
                    <span className="text-lg font-bold text-neutral-900">
                      SAR {(product.price_range_exact_amount * currencyRate).toFixed(2)}
                    </span>
                      </>
                   
                    )}
                 

                  </div>
                </Link>
              </div>
            ))}
          </div>

         {totalPages > 1 && (
  <div className="flex justify-center items-center gap-4 mt-6 select-none">
    {/* Previous Button */}
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="px-3 py-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition"
    >
      &#10094;
    </button>

    {/* Page numbers slider */}
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-2">
      {[...Array(totalPages)].map((_, idx) => {
        const pageNumber = idx + 1;
        // Show only few pages around current for slider effect
        if (
          pageNumber === 1 ||
          pageNumber === totalPages ||
          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
        ) {
          return (
            <button
              key={idx}
              onClick={() => setCurrentPage(pageNumber)}
              className={`px-3 py-2 rounded-full text-sm sm:text-base transition ${
                currentPage === pageNumber
                  ? "bg-[#1f2323] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {pageNumber}
            </button>
          );
        } else if (
          pageNumber === currentPage - 2 ||
          pageNumber === currentPage + 2
        ) {
          return <span key={idx} className="px-2 text-gray-500">...</span>;
        } else {
          return null;
        }
      })}
    </div>

    {/* Next Button */}
    <button
      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-3 py-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition"
    >
      &#10095;
    </button>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
