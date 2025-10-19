// app/product/[sku]/page.js
import { graphqlClient } from "@/app/lib/graphqlClient";
import { GET_PRODUCT_BY_SKU } from "@/app/lib/queries";
import ProductPage from "./ProductPage";
import ProductDescription from "./ProductDescription";
import RecommendedSlider from "./RecommendedProducts";

export default async function ProductPageSku({ params }) {
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
    <div className="min-h-screen">
      {/* Main Product Page */}
      <ProductPage product={product} />

      {/* Product Description */}
      <div className=" mx-auto bg-white px-2 sm:px-2 lg:px-3 py-3">
        <div className="">
          <ProductDescription product={product} />
        </div>
      </div>

      {/* Recommended Products */}
      <div className=" mx-auto bg-white px-2 sm:px-3 lg:px-3 pb-4">
        <RecommendedSlider productId={product.id} />
      </div>
    </div>
  );
}