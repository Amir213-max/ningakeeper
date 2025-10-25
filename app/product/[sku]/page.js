// app/product/[sku]/page.js
import { graphqlClient } from "@/app/lib/graphqlClient";
import { GET_PRODUCT_BY_SKU } from "@/app/lib/queries";
import ProductPage from "./ProductPage";

import RecommendedSlider from "./RecommendedProducts";
import ProductDescription from "./ProductDescription";


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
    <div>
   
      
      {/* Main Product Page */}
      <ProductPage product={product} />

      {/* Product Description - Responsive spacing */}
      <div className="mx-auto bg-white px-2 sm:px-2 md:px-4 lg:px-3 py-3">
        <div className="max-w-7xl mx-auto">
          <ProductDescription product={product} />
        </div>
      </div>

      {/* Recommended Products - Responsive spacing */}
      <div className="mx-auto bg-white px-2 sm:px-3 md:px-4 lg:px-3 pb-4">
        <div className="max-w-7xl mx-auto">
          <RecommendedSlider productId={product.id} />
        </div>
      </div>
    </div>
  );
}