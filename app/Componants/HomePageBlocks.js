"use client";

import { useEffect, useState } from "react";
import { graphqlClient } from "../lib/graphqlClient";
import { GET_ACTIVE_HOME_PAGE_BLOCKS, PRODUCTS_BY_IDS_QUERY } from "../lib/queries";
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "../contexts/CurrencyContext";
import PriceDisplay from "../components/PriceDisplay";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { useTranslation } from "../contexts/TranslationContext";
import { motion } from "framer-motion";
import MultiSlider_6 from "./Slider_6";

export default function HomePageBlocks() {
  const { lang } = useTranslation();
  const BASE_URL = "https://keeper.in-brackets.online/storage/";
  const { loading: currencyLoading } = useCurrency();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsMap, setProductsMap] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const data = await graphqlClient.request(GET_ACTIVE_HOME_PAGE_BLOCKS);
        const activeBlocks = data.activeHomepageBlocks || [];
        setBlocks(activeBlocks);

        for (let block of activeBlocks) {
          if (block.type === "products" && block.content?.product_ids?.length) {
            const productIds = block.content.product_ids.map((p) => p.product_id);
            const productPromises = productIds.map((id) =>
              graphqlClient
                .request(PRODUCTS_BY_IDS_QUERY, { id })
                .then((res) => res.product)
                .catch(() => null)
            );
            const products = (await Promise.all(productPromises)).filter(Boolean);
            setProductsMap((prev) => ({ ...prev, [block.id]: products }));
          }
        }
      } catch (error) {
        console.error("❌ Error fetching home page blocks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlocks();
  }, []);

  if (loading) return <p className="text-center py-8">Loading blocks...</p>;
  if (!blocks.length) return <p className="text-center py-8 text-gray-500">No blocks available.</p>;

  const getImageUrl = (img) => {
    if (!img) return "";
    let path = typeof img === "string" ? img : img.url || img.src || "";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const firstTextBlock = blocks.find((b) => b.type === "text");
  const otherBlocks = blocks.filter((b) => b !== firstTextBlock);
  const firstBannerBlockIndex = blocks.findIndex((b) => b.type === "banners");

  return (
    <div className="pt-3 space-y-3">
      {otherBlocks.map((block, blockIndex) => {
        const isFirstBannerBlock = block.type === "banners" && blockIndex === firstBannerBlockIndex;

        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: blockIndex * 0.2 }}
            className={`rounded-xl overflow-hidden shadow-lg w-full ${block.css_class || ""}`}
            style={{
              backgroundColor: block.background_color || (block.type === "banners" ? "#000" : "#f9f9f9"),
              color: block.text_color || "#fff",
            }}
          >
            {block.title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-center font-bold mb-6 pt-6 text-white">
                {block.title}
              </h2>
            )}

            <div className="px-1 pb-2 mt-4 space-y-3">
              {/* 🔹 Slider Block */}
              {block.type === "slider" && block.content?.slides?.length > 0 && (
                <Splide
                  options={{
                    type: "loop",
                    perPage: 3,
                    autoplay: true,
                    pauseOnHover: true,
                    arrows: true,
                    pagination: true,
                    direction: lang === "ar" ? "rtl" : "ltr",
                  }}
                >
                  {block.content.slides.map((slide, i) => (
                    <SplideSlide key={i}>
                      <div className="relative w-full overflow-hidden">
                        <Image
                          src={getImageUrl(slide.image)}
                          alt={slide.title || ""}
                          width={1920}
                          height={800}
                          className="w-full h-auto object-contain"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center text-white px-4">
                          <h3 className="text-2xl md:text-4xl font-bold mb-3">{slide.title}</h3>
                          <p className="max-w-2xl text-sm md:text-base mb-4">{slide.description}</p>
                          {slide.button_text && (
                            <Link
                              href={slide.button_link || "#"}
                              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2  font-semibold"
                            >
                              {slide.button_text}
                            </Link>
                          )}
                        </div>
                      </div>
                    </SplideSlide>
                  ))}
                </Splide>
              )}

              {/* 🔹 Banners Block */}
              {block.type === "banners" && block.content?.banners?.length > 0 && (
                <>
                  {block.content.banners.length <= 2 ? (
                    <div className="w-full ">
                      <div
                        className={`grid gap-3 ${
                          block.content.banners.length === 1 ? "grid-cols-1" : "grid-cols-2"
                        }`}
                      >
                        {block.content.banners.map((banner, idx) => {
                          const imageSrc =
                            isMobile && banner.mobile_image
                              ? getImageUrl(banner.mobile_image)
                              : getImageUrl(banner.image);

                          const isTwoBanners = block.content.banners.length === 2;

                          return (
                            <motion.a
                              key={banner.id || idx}
                              href={banner.link || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: idx * 0.1 }}
                              className={`relative overflow-hidden shadow-md group w-full 
                                ${isTwoBanners
                                  ? " md:h-[250px] lg:h-[400px] sm:h-[200px] h-[200px] " // ✅ لما يكون فيه بانرين فقط
                                  : "h-[45vh] sm:h-[50vh] md:h-[30vh] lg:h-[65vh]" // الافتراضي
                                }`}
                            >
                              <Image
                                src={imageSrc}
                                alt={banner.title || ""}
                                fill
                                className={`transition-transform duration-500 group-hover:scale-105 ${
                                  isFirstBannerBlock ? "object-fill" : "object-fill"
                                }`}
                                unoptimized
                                priority={isFirstBannerBlock}
                              />
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto no-scrollbar px-2 md:px-4">
                      <div className="flex gap-3 min-w-max">
                        {block.content.banners.map((banner, idx) => {
                          const imageSrc =
                            isMobile && banner.mobile_image
                              ? getImageUrl(banner.mobile_image)
                              : getImageUrl(banner.image);

                          return (
                            <motion.a
                              key={banner.id || idx}
                              href={banner.link || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: idx * 0.1 }}
                              className="relative flex-shrink-0 w-[60vw] sm:w-[40vw] md:w-[30vw] lg:w-[25vw] h-[25vh] overflow-hidden shadow-md group"
                            >
                              <Image
                                src={imageSrc}
                                alt={banner.title || ""}
                                fill
                                className={`transition-transform duration-500 group-hover:scale-105 ${
                                  isFirstBannerBlock ? "object-fill" : "object-contain"
                                }`}
                                unoptimized
                                priority={isFirstBannerBlock}
                              />
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 🔹 Products Block */}
              {block.type === "products" && productsMap[block.id]?.length > 0 && (
                <div className="px-4 md:px-8 overflow-hidden lg:px-12">
                  <Splide
                    key={lang}
                    options={{
                      type: "slide",
                      perPage: block.content?.per_row || 5,
                      perMove: 1,
                      gap: "1rem",
                      rewind: false,
                      trimSpace: true,
                      omitEnd: true,
                      pagination: false,
                      arrows: true,
                      direction: lang === "ar" ? "rtl" : "ltr",
                      updateOnMove: true,
                      breakpoints: {
                        1280: { perPage: 5 },
                        1024: { perPage: 4 },
                        768: { perPage: 3 },
                        640: { perPage: 2 },
                      },
                    }}
                  >
                    {productsMap[block.id].map((product, idx) => (
                      <SplideSlide key={`${product.id}-${idx}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="h-full overflow-hidden"
                        >
                          <Link
                            href={`/product/${encodeURIComponent(product.sku)}`}
                            className="block bg-[#111] hover:bg-[#2b2a2a] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full"
                          >
                            <div className="relative flex items-center justify-center overflow-hidden aspect-[1.3/1.5]">
                              {product.images?.[0] ? (
                                <Image
                                  src={
                                    typeof product.images[0] === "string"
                                      ? product.images[0]
                                      : product.images[0]?.url
                                  }
                                  alt={product.name}
                                  fill
                                  className="object-contain p-3"
                                  unoptimized
                                />
                              ) : (
                                <div className="text-gray-500 text-sm">No Image</div>
                              )}
                            </div>

                            <div className="p-4 text-center overflow-hidden flex flex-col justify-between">
                              {product.brand?.name && (
                                <p className="text-gray-300 text-sm mb-1">{product.brand.name}</p>
                              )}
                              <h3 className="text-white text-sm sm:text-base font-medium line-clamp-2 mb-2">
                                {product.name}
                              </h3>
                              <p className="text-white font-bold text-lg">
                                <PriceDisplay price={product.price_range_exact_amount} loading={currencyLoading} />
                              </p>
                            </div>
                          </Link>
                        </motion.div>
                      </SplideSlide>
                    ))}
                  </Splide>

                  {block.button_text && (
                    <div className="flex justify-center mt-4">
                      <Link
                        href={block.button_url || "#"}
                        className={`rounded-md font-semibold px-6 py-3 text-lg ${
                          block.button_style === "red"
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-yellow-500 text-black hover:bg-yellow-400"
                        }`}
                      >
                        {block.button_text}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      <MultiSlider_6 />
    </div>
  );
}
