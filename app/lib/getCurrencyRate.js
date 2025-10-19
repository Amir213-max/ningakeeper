import { graphqlClient } from "./graphqlClient";

export async function getCurrencyRate() {
  const query = `
    query {
      publicSettings {
        key
        value
      }
    }
  `;

  const res = await graphqlClient.request(query);
  console.log("🔹 API Result:", res); // ✅ هتظهر في الـ Terminal أو Console

  const eurToSarSetting = res?.publicSettings?.find(
    (setting) => setting.key === "eur_to_sar"
  );

  console.log("🔹 eur_to_sar found:", eurToSarSetting); // ✅ تحقق من وجوده

  if (!eurToSarSetting) {
    throw new Error("eur_to_sar setting not found in publicSettings");
  }

  return parseFloat(eurToSarSetting.value);
}
