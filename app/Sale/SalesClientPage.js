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

export default function SomeClientPage({ products, brands, attributeValues }) {
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(products);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const { t } = useTranslation();

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

  // Filter categories with products
  const categoriesWithProducts = useMemo(() => {
    return categories.filter((cat) =>
      products.some((product) =>
        (product.rootCategories || []).some((pCat) => pCat.id === cat.id)
      )
    );
  }, [categories, products]);

  // Update selected category name
  useEffect(() => {
    const cat = categoriesWithProducts.find((c) => c.id === selectedCategoryId);
    setSelectedCategoryName(cat?.name || null);
  }, [selectedCategoryId, categoriesWithProducts]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="bg-[#373e3e]">
      {/* ✅ Sidebar فوق المنتجات للشاشات الصغيرة والمتوسطة */}
      <div className="block lg:hidden bg-black px-2 py-2 sticky top-0 z-20">
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
        />
      </div>

      <div className="grid pt-1 grid-cols-1 lg:grid-cols-5">
        {/* ✅ Sidebar في الجنب للشاشات الكبيرة */}
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
          />
        </div>

        {/* Products Area */}
        <div className="lg:col-span-4 p-4 bg-white">
          <h1 className="text-4xl text-[#1f2323] p-2">
            {selectedCategoryName || t("All Products")}
          </h1>

          <BrandsSlider
            brands={brands}
            selectedBrand={selectedBrand}
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-2 sm:p-4">
            {currentProducts.map((product) => (
              <div
                key={product.sku}
                className="bg-gradient-to-br from-white to-neutral-200 rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <ProductSlider images={product.images} productName={product.name} />
                <Link
                  href={`/product/${encodeURIComponent(product.sku)}`}
                  className="p-4 flex flex-col flex-grow justify-between"
                >
                  <div className="bg-neutral-400 text-amber-100 text-xs font-semibold w-fit px-3 py-1 rounded-full mb-3">
                    {(product.rootCategories || []).map((cat) => cat.name).join(", ")}
                  </div>

                  <h3 className="text-base text-gray-700 text-center font-bold mb-1">
                    {product.brand?.name}
                  </h3>

                  <p className="text-center text-sm text-gray-500 line-clamp-2 mb-3">
                    {product.name}
                  </p>

                  <div className="text-center">
                    <div className="line-through text-gray-500 text-sm">
                       SAR {(product.list_price_amount * 4.6).toFixed(2)}
                    </div>
                    <span className="text-lg font-bold text-neutral-900">
                      SAR {(product.list_price_amount * 4.6).toFixed(2)}

                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 cursor-pointer rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 text-sm sm:text-base"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 sm:px-4 py-2 cursor-pointer rounded-lg text-sm sm:text-base ${
                    currentPage === idx + 1
                      ? "bg-[#1f2323] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 cursor-pointer rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 text-sm sm:text-base"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
