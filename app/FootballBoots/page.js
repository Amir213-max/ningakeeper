import { graphqlClient } from "../lib/graphqlClient";
import { PRODUCTS_SHOES_QUERY } from "../lib/queries";
import FootballClientPage from "./FootballBootsClientpage";

export default async function Page() {
  const data = await graphqlClient.request(PRODUCTS_SHOES_QUERY);

  let products = (data.products || []).filter((p) => p.are_shoes === true);

  // ✅ ترتيب المنتجات من الأحدث للأقدم بناءً على created_at
  products = products.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const brands = [...new Set(products.map((p) => p.brand?.name).filter(Boolean))];

  const attributeValues = [];
  products.forEach((p) => {
    (p.productAttributeValues || []).forEach((av) => {
      const attr = av.attribute?.label;
      if (!attr) return;

      let existing = attributeValues.find((a) => a.attribute === attr);
      if (!existing) {
        existing = { attribute: attr, values: [] };
        attributeValues.push(existing);
      }

      if (!existing.values.includes(av.key)) {
        existing.values.push(av.key);
      }
    });
  });

  return (
    <FootballClientPage
      products={products}
      brands={brands}
      attributeValues={attributeValues}
    />
  );
}
