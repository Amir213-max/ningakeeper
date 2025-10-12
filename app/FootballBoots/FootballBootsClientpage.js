"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import BrandsSlider from "../Componants/brandsSplide_1";
import FilterDropdown from "../Componants/CheckboxDropdown ";
import ProductSlider from "../Componants/ProductSlider";
import { useTranslation } from "../contexts/TranslationContext";
import { graphqlClient } from "../lib/graphqlClient";
import { GET_CATEGORIES_QUERY, GET_WISHLIST_ITEMS } from "../lib/queries";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ADD_TO_WISHLIST } from "../lib/mutations";
import Sidebar from "../Componants/sidebar";

export default function FootballClientPage({ products, brands, attributeValues }) {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sidebarOpen, setSidebarOpen] = useState(false); // للتحكم في الـ Sidebar للـ mobile


  const [wishlistIds, setWishlistIds] = useState([]);
  const wishlistId = user?.defaultWishlist?.id || user?.wishlists?.[0]?.id; 

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const { t } = useTranslation();

  // Fetch Wishlist Items
  useEffect(() => {
    if (wishlistId) {
      const fetchWishlist = async () => {
        try {
          const res = await graphqlClient.request(GET_WISHLIST_ITEMS, { wishlistId });
          const ids = res?.wishlist?.items?.map((item) => String(item.product.id)) || [];
          setWishlistIds(ids);
        } catch (error) {
          console.error("Error fetching wishlist items:", error);
        }
      };
      fetchWishlist();
    }
  }, [wishlistId]);

  // Add to Wishlist
  async function handleAddToWishlist(productId) {
    if (!user) {
      toast.error("❌ You must be logged in to add to wishlist");
      return;
    }
    if (!wishlistId) {
      toast.error("❌ Your wishlist ID is missing. Please reload or contact support.");
      return;
    }
    if (wishlistIds.includes(String(productId))) {
      toast("⚠️ This product is already in your wishlist");
      return;
    }

    try {
      const variables = { input: { wishlist_id: wishlistId, product_id: productId } };
      const response = await graphqlClient.request(ADD_TO_WISHLIST, variables);

      if (response?.addToWishlist?.success) {
        toast.success("✅ Product added to wishlist!");
        setWishlistIds((prev) => [...prev, String(productId)]);
      } else {
        toast.error(response?.addToWishlist?.message || "❌ Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("❌ Something went wrong!");
    }
  }

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

  // Filter products based on brand, attributes, and category ID
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
        (product.rootCategories || []).some((cat) => cat.id === selectedCategoryId);

      return brandMatch && attributesMatch && categoryMatch;
    });

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedBrand, selectedAttributes, selectedCategoryId]);

  // Categories that have products
   const categoriesWithProducts = useMemo(() => {
    return categories.filter((cat) =>
      products.some((product) =>
        (product.rootCategories || []).some((pCat) => pCat.id === cat.id)
      )
    );
  }, [categories, products]);

  // Pagination
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle category selection from Sidebar
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
    <div className="bg-[#373e3e]">
      {/* Sidebar for mobile */}
      <div className="block lg:hidden bg-black px-2 py-2 sticky top-0 z-20">
      <Sidebar
 // إذا عندك Drawer
 isOpen={sidebarOpen}
  setIsOpen={setSidebarOpen}
  categories={categoriesWithProducts}
  onSelectCategory={handleCategorySelect}
/>
      </div>

      <div className="grid pt-1 grid-cols-1 lg:grid-cols-5">
        {/* Sidebar for desktop */}
        <div className="hidden lg:block lg:col-span-1 bg-black h-auto">
          <Sidebar
            categories={categoriesWithProducts}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* Products Area */}
        <div className="md:col-span-4 p-4 bg-white">
          <h1 className="text-4xl text-[#1f2323] p-2">
            {selectedCategoryName || t("Football Shoes")}
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
                className="bg-gradient-to-br from-white to-neutral-200 rounded-xl shadow-md overflow-hidden flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist(product.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full transition-all duration-300 hover:bg-white/20"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors duration-300 ${
                      wishlistIds.includes(String(product.id))
                        ? "stroke-red-500 fill-red-500"
                        : "stroke-gray-400 fill-transparent hover:stroke-red-500 hover:fill-red-500"
                    }`}
                  />
                </button>

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
                      SAR {(product.price_range_exact_amount * 4.6).toFixed(2)}
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
