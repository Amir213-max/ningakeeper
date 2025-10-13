// app/product/[sku]/page.js
import { graphqlClient } from "@/app/lib/graphqlClient";
import { GET_PRODUCT_BY_SKU } from "@/app/lib/queries";
import ImageGallery from "./ImageGallery";
import ProductDescription from "./ProductDescription";
import ProductDetailsSidebar from "./ProductDetailsSidebar";
import RecommendedSlider from "./RecommendedProducts";

export default async function ProductPage({ params }) {
  const sku = decodeURIComponent(params.sku);

  let product = null;

  try {
    const res = await graphqlClient.request(GET_PRODUCT_BY_SKU, { sku });
    product = res?.productBySku;
  } catch (error) {
    console.error("❌ GraphQL Error:", error);
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Product not found for SKU: <b>{sku}</b>
      </div>
    );
  }

  return (
    <div className="bg-[#373e3e] min-h-screen px-3 sm:px-6 py-6">
      {/* 🧱 القسم الرئيسي */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-2">
        {/* 📸 الصور والوصف */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1f2323] mb-4 text-center lg:text-left">
            {product.name}
          </h1>
          <div className="flex-1">
            <ImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>
        </div>

        {/* 🎯 الشريط الجانبي */}
        <div className="lg:col-span-2 bg-[#1f2323] rounded-2xl shadow-lg p-4 sm:p-5">
          <ProductDetailsSidebar product={product} />
        </div>
      </div>

      {/* 📄 وصف المنتج */}
      <div className="max-w-7xl mx-auto mt-8 bg-white rounded-2xl shadow-xl p-4 sm:p-6">
        <ProductDescription product={product} />
      </div>

      {/* 🛍 منتجات مقترحة */}
      <div className="max-w-7xl mx-auto mt-10">
        <RecommendedSlider productId={product.id} />
      </div>
    </div>
  );
}