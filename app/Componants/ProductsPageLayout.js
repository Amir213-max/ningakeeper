"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Sidebar from "../Componants/sidebar";
import BrandsSlider from "../Componants/brandsSplide_1";
import FilterDropdown from "../Componants/CheckboxDropdown ";
import ProductSlider from "../Componants/ProductSlider";
import { useTranslation } from "../contexts/TranslationContext";
import { graphqlClient } from "../lib/graphqlClient";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ADD_TO_WISHLIST } from "../lib/mutations";
import PriceDisplay from "../components/PriceDisplay";

export default function ProductsPageLayout({
  products,
  brands,
  attributeValues,
  pageTitle,
}) {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const isRTL = language === "ar";

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);

  const wishlistId = user?.defaultWishlist?.id || user?.wishlists?.[0]?.id;
  const productsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
// Currency handling is now managed by CurrencyContext

  // Fetch wishlist items
  useEffect(() => {
    if (!wishlistId) return;
    const fetchWishlist = async () => {
      try {
        const res = await graphqlClient.request(ADD_TO_WISHLIST, { wishlistId });
        const ids = res?.wishlist?.items?.map((item) => String(item.product.id)) || [];
        setWishlistIds(ids);
      } catch (error) {
        console.error("Wishlist error:", error);
      }
    };
    fetchWishlist();
  }, [wishlistId]);

  const handleAddToWishlist = async (productId) => {
    if (!user) return toast.error("You must be logged in");
    if (wishlistIds.includes(String(productId))) return toast("Already added ❤️");
    try {
      const res = await graphqlClient.request(ADD_TO_WISHLIST, {
        input: { wishlist_id: wishlistId, product_id: productId },
      });
      if (res?.addToWishlist?.success) {
        toast.success("Added to wishlist");
        setWishlistIds((prev) => [...prev, String(productId)]);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Fetch categories (replace GET_CATEGORIES_QUERY if needed)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await graphqlClient.request(/* GET_CATEGORIES_QUERY */);
        setCategories(data.rootCategories || []);
      } catch (error) {
        console.error("Categories fetch error:", error);
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

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getBadgeColor = (label) => {
    if (!label) return "bg-gray-400";
    if (label.toLowerCase().includes("new")) return "bg-green-500";
    if (label.includes("%") || label.toLowerCase().includes("off")) return "bg-red-500";
    return "bg-yellow-500";
  };

  const handleCategorySelect = (catId) => {
    if (catId === selectedCategoryId) {
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
    } else {
      setSelectedCategoryId(catId);
      const cat = categories.find((c) => c.id === catId);
      setSelectedCategoryName(cat?.name || null);
    }
  };

  return (
    <div className={`bg-[#373e3e] min-h-screen ${isRTL ? "rtl" : "ltr"}`}>
      {/* Mobile Top bar */}
      <div className="block lg:hidden bg-[#1f2323] px-4 py-3 sticky top-0 z-30 flex justify-between items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white bg-yellow-500 px-3 py-1 rounded-lg font-semibold"
        >
          ☰ {t("Filters")}
        </button>
        <h2 className="text-white font-bold text-lg">
          {selectedCategoryName || pageTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Sidebar desktop */}
        <div className="hidden lg:block lg:col-span-1 bg-[#1f2323] h-auto p-2">
          <Sidebar
            categories={categoriesWithProducts}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* Main content */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-t-2xl lg:rounded-none">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1f2323] mb-4">
            {selectedCategoryName || pageTitle}
          </h1>

          {brands.length > 1 && (
            <BrandsSlider
              brands={brands}
              selectedBrand={selectedBrand}
              onBrandClick={(brand) =>
                setSelectedBrand(brand === selectedBrand ? null : brand)
              }
            />
          )}

          <div className="flex mb-4 gap-3 flex-wrap">
            <FilterDropdown
              attributeValues={attributeValues}
              onFilterChange={setSelectedAttributes}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentProducts.map((product) => (
              <div
                key={product.sku}
                className="bg-gradient-to-br from-white to-neutral-200 rounded-xl shadow-md overflow-hidden flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Product Badge */}
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
                    <PriceDisplay 
                      price={product.price_range_exact_amount}
                      originalPrice={product.list_price_amount !== product.price_range_exact_amount ? product.list_price_amount : null}
                      size="lg"
                    />
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

      {/* Sidebar drawer for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 flex">
          <div className="bg-[#1f2323] w-3/4 sm:w-2/4 p-4 overflow-y-auto">
            <Sidebar
              categories={categoriesWithProducts}
              onSelectCategory={handleCategorySelect}
              setIsOpen={setSidebarOpen}
            />
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}
    </div>
  );
}
