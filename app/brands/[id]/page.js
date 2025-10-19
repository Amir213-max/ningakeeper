'use client';

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { graphqlClient } from "../../lib/graphqlClient";
import { gql } from "graphql-request";
import { useTranslation } from "../../contexts/TranslationContext";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "../../Componants/sidebar";
import FilterDropdown from "../../Componants/CheckboxDropdown ";
import ProductSlider from "../../Componants/ProductSlider";

import toast from "react-hot-toast";
import { ADD_TO_WISHLIST } from "../../lib/mutations";
import { GET_WISHLIST_ITEMS } from "../../lib/queries";
import Link from "next/link";
import { Heart } from "lucide-react";

const GET_PRODUCTS_BY_BRAND = gql`
  query getProductsByBrand($brand_id: ID!) {
    productsWithFilters(filters: { brand_id: $brand_id }) {
      id
      name
      sku
      list_price_amount
      price_range_exact_amount
      brand {
        id
        name
      }
      rootCategories {
        id
        name
      }
      images
      productAttributeValues {
        key
        attribute {
          label
        }
      }
      productBadges {
        label
      }
    }
  }
`;

export default function BrandPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [wishlistIds, setWishlistIds] = useState([]);
  const wishlistId = user?.defaultWishlist?.id || user?.wishlists?.[0]?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
const [currencyRate, setCurrencyRate] = useState(null);

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

  // 🧩 Fetch Products by Brand
  useEffect(() => {
    if (!id) return;
    const fetchProducts = async () => {
      try {
        const data = await graphqlClient.request(GET_PRODUCTS_BY_BRAND, { brand_id: id });
        setProducts(data.productsWithFilters || []);
        setFilteredProducts(data.productsWithFilters || []);
      } catch (error) {
        console.error("Error fetching products by brand:", error);
      }
    };
    fetchProducts();
  }, [id]);

  // ❤️ Fetch Wishlist
  useEffect(() => {
    if (!wishlistId) return;
    const fetchWishlist = async () => {
      try {
        const res = await graphqlClient.request(GET_WISHLIST_ITEMS, { wishlistId });
        const ids = res?.wishlist?.items?.map((item) => String(item.product.id)) || [];
        setWishlistIds(ids);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
    fetchWishlist();
  }, [wishlistId]);

  // ➕ Add to Wishlist
  async function handleAddToWishlist(productId) {
    if (!user) {
      toast.error("❌ You must be logged in to add to wishlist");
      return;
    }
    if (wishlistIds.includes(String(productId))) {
      toast("⚠️ Product already in wishlist");
      return;
    }

    try {
      const variables = { input: { wishlist_id: wishlistId, product_id: productId } };
      const res = await graphqlClient.request(ADD_TO_WISHLIST, variables);
      if (res?.addToWishlist?.success) {
        toast.success("✅ Added to wishlist!");
        setWishlistIds((prev) => [...prev, String(productId)]);
      } else toast.error(res?.addToWishlist?.message || "❌ Failed");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("❌ Something went wrong!");
    }
  }

  // 🎛️ Prepare dynamic filter attributes
  const attributeValues = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      (p.productAttributeValues || []).forEach((attr) => {
        const label = attr.attribute?.label;
        const val = attr.key;
        if (label && val) {
          if (!map[label]) map[label] = new Set();
          map[label].add(val);
        }
      });
    });
    return Object.entries(map).map(([attribute, values]) => ({
      attribute,
      values: Array.from(values),
    }));
  }, [products]);

  // 🧮 Filter products by attributes
  useEffect(() => {
    const result = products.filter((product) => {
      const attrs = product.productAttributeValues || [];
      return Object.entries(selectedAttributes).every(([label, vals]) => {
        if (!vals.length) return true;
        const selectedLower = vals.map((v) => String(v).toLowerCase());
        return attrs.some(
          (pav) =>
            String(pav.attribute?.label || "").toLowerCase() ===
              String(label).toLowerCase() &&
            selectedLower.includes(String(pav.key ?? "").toLowerCase())
        );
      });
    });
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [selectedAttributes, products]);

  // 📄 Pagination
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const getBadgeColor = (label) => {
    if (!label) return "bg-gray-400";
    if (label.toLowerCase().includes("new")) return "bg-green-500";
    if (label.includes("%") || label.toLowerCase().includes("off")) return "bg-gray-500";
    return "bg-yellow-500";
  };
  return (
    <div className="bg-[#373e3e] min-h-screen">
      <div className="grid pt-1 grid-cols-1 lg:grid-cols-5">
        {/* 🧱 Sidebar */}
        <div className="hidden lg:block lg:col-span-1 bg-black h-auto">
          <Sidebar categories={[]} />
        </div>

        {/* 🛍️ Main Section */}
        <div className="md:col-span-4 p-4 bg-white">
          {/* 🔹 Page Title */}
          <h1 className="text-4xl font-bold text-[#1f2323] mb-6">
            {t("Brand Products")}
          </h1>

         

          {/* 🔹 Filters Dropdown */}
          <div className="flex mb-4 mt-4 gap-3 flex-wrap">
            <FilterDropdown
              attributeValues={attributeValues}
              onFilterChange={setSelectedAttributes}
            />
          </div>

          {/* 🔹 Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-2 sm:p-4">
            {currentProducts.map((product) => (
              <div
                key={product.sku}
                className="relative bg-gradient-to-br from-white to-neutral-200 rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
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


               

                {/* 🖼 Product Image */}
                <ProductSlider images={product.images} productName={product.name} />

                {/* 📦 Info */}
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
  <div className="flex justify-center items-center gap-4 mt-8">
    {/* ◀️ Previous Button */}
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        currentPage === 1
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-[#1f2323] text-white hover:bg-[#333]"
      }`}
    >
      <span>←</span> Previous
    </button>

    <span className="text-gray-700 font-medium">
      Page {currentPage} of {totalPages}
    </span>

    {/* ▶️ Next Button */}
    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        currentPage === totalPages
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-[#1f2323] text-white hover:bg-[#333]"
      }`}
    >
      Next <span>→</span>
    </button>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
