'use client';

import { useTranslation } from '@/app/contexts/TranslationContext';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { graphqlClient } from '@/app/lib/graphqlClient';
import { RECOMMENDED_PRODUCTS_QUERY } from '@/app/lib/queries';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecommendedSlider({ productId }) {
  const { t, lang } = useTranslation();
  const { formatPrice, loading: currencyLoading } = useCurrency();
  const [products, setProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('recommended');

  // ✅ جلب المنتجات المقترحة
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const data = await graphqlClient.request(RECOMMENDED_PRODUCTS_QUERY, {
          productId,
        });
        setProducts(
          data?.productsWithCategoryRecommendations?.recommended_products || []
        );
      } catch (err) {
        console.error('Error fetching recommended products:', err);
      }
    };
    if (productId) fetchRecommended();
  }, [productId]);

  // ✅ تحميل المنتجات المشاهَدة مؤخرًا من localStorage (بدون تكرار)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        const unique = Array.from(
          new Map(parsed.map((item) => [item.sku, item])).values()
        );
        setRecentProducts(unique);
      }
    } catch (err) {
      console.error('Failed to load recently viewed:', err);
    }
  }, []);

  // ✅ تحديد المنتجات المعروضة أولًا قبل أي استخدام
  const displayedProducts =
    activeTab === 'recommended' ? products : recentProducts;

  const sliderOptions = {
    type: 'loop',
    perPage: 5,
    gap: '1rem',
    autoplay: false,
    pauseOnHover: true,
    arrows: false, // 🔥 إخفاء الأسهم لو منتج واحد
    pagination: false,
    breakpoints: {
      1024: { perPage: 4 },
      640: { perPage: 2 },
    },
    direction: lang === 'ar' ? 'rtl' : 'ltr',
  };

  if (!products.length && !recentProducts.length) return null;

  return (
    <div className="w-full max-w-9xl mx-auto px-4 space-y-6 py-10">
      {/* ✅ التبويبات */}
      <div className="flex  gap-6 border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`pb-2 cursor-pointer font-semibold text-base transition-all duration-300 ${
            activeTab === 'recommended'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-gray-500 hover:text-amber-400'
          }`}
        >
          {t('Recommended for you')}
        </button>

        <button
          onClick={() => setActiveTab('recent')}
          className={`pb-2 font-semibold cursor-pointer text-base transition-all duration-300 ${
            activeTab === 'recent'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-gray-500 hover:text-amber-400'
          }`}
        >
          {t('Recently viewed')}
        </button>
      </div>

      {/* ✅ الأنيميشن + السلايدر */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {displayedProducts.length > 0 ? (
            displayedProducts.length === 1 ? (
              // 🔹 منتج واحد فقط (بدون أسهم أو سلايدر)
              <div className="flex py-6 justify-center">
                <Link
                  href={`/product/${displayedProducts[0].sku}`}
                  className="block w-72"
                >
                  <div className="bg-gray-100 hover:bg-gray-200 transition duration-500 text-neutral-700 rounded-lg shadow-md overflow-hidden flex flex-col">
                    <div className="relative w-full h-60 flex items-center justify-center">
                      {displayedProducts[0].images?.[0] ? (
                        <Image
                          src={displayedProducts[0].images[0]}
                          alt={displayedProducts[0].name}
                          fill
                          className="object-contain pt-6"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-5 text-center">
                      <h3 className="text-base font-semibold mb-2 line-clamp-2">
                        {displayedProducts[0].name}
                      </h3>
                      <h2 className="font-bold text-xl mt-4">
                        {currencyLoading
                          ? '...'
                          : formatPrice(
                              displayedProducts[0].price_range_from ||
                                displayedProducts[0].price ||
                                0
                            )}
                      </h2>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              // 🔹 سلايدر كامل
              <Splide
                key={activeTab + lang}
                options={sliderOptions}
                aria-label="Products Slider"
              >
                {displayedProducts.map((item, index) => (
                  <SplideSlide key={item.id || item.sku}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1, // ✨ تأثير stagger بسيط
                      }}
                    >
                      <Link href={`/product/${item.sku}`} className="block">
                        <div className="hover:bg-gray-200 transition duration-500 text-neutral-700 rounded-lg shadow-md overflow-hidden flex flex-col h-96">
                          <div className="relative w-full h-48 flex items-center justify-center">
                            {item.images?.[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.name}
                                fill
                                className="object-contain pt-6"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full  flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="p-5">
                            <h3 className="text-base text-center font-semibold mb-2 line-clamp-2">
                              {item.name}
                            </h3>
                            <h2 className="font-bold text-xl mt-8 flex justify-center">
                              {currencyLoading
                                ? '...'
                                : formatPrice(
                                    item.price_range_from || item.price || 0
                                  )}
                            </h2>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </SplideSlide>
                ))}
              </Splide>
            )
          ) : (
            <p className="text-center text-gray-500 py-6">
              {activeTab === 'recommended'
                ? t('No recommended products found.')
                : t('No recently viewed products yet.')}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
