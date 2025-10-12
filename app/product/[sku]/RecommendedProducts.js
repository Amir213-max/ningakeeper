'use client';

import { useTranslation } from '@/app/contexts/TranslationContext';
import { graphqlClient } from '@/app/lib/graphqlClient';
import { RECOMMENDED_PRODUCTS_QUERY } from '@/app/lib/queries';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Image from 'next/image';
import Link from 'next/link';

import { useEffect, useState } from 'react';




export default function RecommendedSlider({ productId }) {
  const { t, lang } = useTranslation();
  const [products, setProducts] = useState([]);

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

  const sliderOptions = {
    type: 'loop',
    perPage: 5,
    gap: '1rem',
    autoplay: true,
    interval: 3000,
    pauseOnHover: true,
    arrows: true,
    pagination: false,
    breakpoints: {
      1024: { perPage: 3 },
      640: { perPage: 2 },
    },
    direction: lang === 'ar' ? 'rtl' : 'ltr',
  };

  if (!products.length) return null;

  return (
    <div className="w-full max-w-9xl mx-auto px-4 space-y-5 py-10">
      <h2 className="text-white font-bold text-3xl text-center">
        {t('Recommended for you')}
      </h2>

      <Splide key={lang} className="h-fit" options={sliderOptions} aria-label="منتجات مقترحة">
        {products.map((item) => (
          <SplideSlide key={item.id}>
            <Link href={`/product/${item.sku}`} className="block">
              <div className="bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-md overflow-hidden flex flex-col h-96">
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
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg text-center font-semibold mb-2">
                    {item.name}
                  </h3>
                  <h2 className="font-bold text-2xl mt-8 flex justify-center line-clamp-1">
                  {`SAR ${(item.price_range_from ? item.price_range_from * 4.6 : 0).toFixed(2)}`}

                  </h2>
                </div>
              </div>
            </Link>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
}
