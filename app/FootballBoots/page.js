import { graphqlClient } from "../lib/graphqlClient";
import { PRODUCTS_SHOES_QUERY } from "../lib/queries";
import FootballClientPage from "./FootballBootsClientpage";

export default async function Page() {
  const data = await graphqlClient.request(PRODUCTS_SHOES_QUERY);

  const products = (data.products || []).filter((p) => p.are_shoes === true);
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

  return <FootballClientPage products={products} brands={brands} attributeValues={attributeValues} />;
}
