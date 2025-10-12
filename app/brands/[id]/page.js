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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-2 sm:p-4">
            {currentProducts.map((product) => (
              <div
                key={product.sku}
                className="relative bg-gradient-to-br from-white to-neutral-200 rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* 🔺 Badge (Diagonal top-left corner) */}
                {product.productBadges?.length > 0 && (
                  <div className="absolute top-0 left-0 transform -rotate-45 origin-top-left bg-red-500 text-white text-xs font-bold px-8 py-1 shadow-md">
                    {product.productBadges[0].label}
                  </div>
                )}

                {/* ❤️ Wishlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist(product.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-white/20"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      wishlistIds.includes(String(product.id))
                        ? "stroke-red-500 fill-red-500"
                        : "stroke-gray-400 hover:stroke-red-500 hover:fill-red-500"
                    }`}
                  />
                </button>

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
                    {product.list_price_amount !== product.price_range_exact_amount && (
                      <div className="line-through text-gray-500 text-sm">
                        SAR {(product.list_price_amount * 4.6).toFixed(2)}
                      </div>
                    )}
                    <span className="text-lg font-bold text-neutral-900">
                      SAR {(product.price_range_exact_amount * 4.6).toFixed(2)}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* 🔹 Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === idx + 1
                      ? "bg-[#1f2323] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
