// app/product/[sku]/page.js

import { graphqlClient } from "@/app/lib/graphqlClient";
import { GET_PRODUCT_BY_SKU } from "@/app/lib/queries";
import ImageGallery from "./ImageGallery";
import ProductDescription from "./ProductDescription";
import ProductDetailsSidebar from "./ProductDetailsSidebar";
import RecommendedSlider from "./RecommendedProducts";

export default async function ProductPage({ params }) {
  const sku = decodeURIComponent(params.sku);

  console.log("✅ SKU from params:", sku);

  let product = null;

  try {
    // استدعاء الكويري
    const res = await graphqlClient.request(GET_PRODUCT_BY_SKU, { sku });
    product = res?.productBySku; // 🔑 مهم: نفس اسم الحقل في كويري GraphQL
    console.log("✅ Product response:", product);
  } catch (error) {
    console.error("❌ GraphQL Error:", error);
  }

  if (!product) {
    return (
      <div className="p-6 text-red-500">
        Product not found for SKU: <b>{sku}</b>
      </div>
    );
  }

  return (
    <div className="bg-[#373e3e] min-h-screen p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* القسم الرئيسي: الصور والوصف */}
        <div className="lg:col-span-3 bg-white rounded-xl p-4 shadow-md">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1f2323] mb-4">
            {product.name}
          </h1>
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* الشريط الجانبي */}
        <div className="lg:col-span-1 bg-[#1f2323] rounded-xl shadow-md p-4">
          <ProductDetailsSidebar product={product} />
        </div>
      </div>

      {/* وصف المنتج */}
      <div className="w-full text-neutral-800 shadow-2xl mt-6">
        <ProductDescription product={product} />
      </div>
      <RecommendedSlider productId={product.id} />

    </div>
  );
}
