'use client';

import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '../contexts/TranslationContext';
import { useEffect, useState } from 'react';
import { graphqlClient } from '../lib/graphqlClient';
import { PRODUCTS_QUERY } from '../lib/queries';

export default function MultiSlider() {
  const { t, lang } = useTranslation();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await graphqlClient.request(PRODUCTS_QUERY, { limit: 10, offset: 0 });
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

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

  return (
    <div className="w-full max-w-9xl mx-auto px-4 space-y-5 py-10">
      <h2 className='text-white font-bold text-3xl text-center'> {t("TOP BRANDS,LATEST MODELS")}</h2>

      <Splide key={lang} className='h-fit' options={sliderOptions} aria-label="عروض مميزة">
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
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg text-center font-semibold mb-2">{item.name}</h3>
                  <h2 className='font-bold text-2xl mt-8 flex justify-center line-clamp-1'>
                    ${item.list_price_amount || 0}
                  </h2>
                </div>
              </div>
            </Link>
          </SplideSlide>
        ))}
      </Splide>

      <Link
  href="/GoalkeeperGloves"
  className="block w-40 text-center font-bold py-2 px-4 rounded-sm bg-yellow-400 text-black text-lg mx-auto mt-3"
>
  {t("SHOP REHAB")}
</Link>

    </div>
  );
}
