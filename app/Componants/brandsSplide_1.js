'use client';

import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { useTranslation } from '../contexts/TranslationContext';

export default function BrandsSlider({ brands, onBrandClick, selectedBrand }) {
  const { lang } = useTranslation();


  // 🔹 فلترة القيم الفارغة
  const validBrands = brands.filter(
    (brand) => brand && brand.trim() !== ''
  );

  // 🔹 لو فيه براند واحد بس أو مفيش خالص → متعرضش الكومبوننت
  if (validBrands.length <= 1) return null;

  return (
    <div className="relative my-6 px-0">
      <Splide
        options={{
          type: 'loop',
          perPage: 5,
          perMove: 1,
          breakpoints: {
            1024: { perPage: 5 },
            768: { perPage: 4 },
            640: { perPage: 3 },
            480: { perPage: 2 },
          },
          gap: '0',
          pagination: false,
          arrows: true,
          direction: lang === 'ar' ? 'rtl' : 'ltr',
        }}
        aria-label="Brand names"
        className="w-full"
      >


        {validBrands.map((brand, index) => (

          <SplideSlide
            key={index}
            className="p-0 m-0 flex justify-center items-center"
          >
            <div
              onClick={() => onBrandClick(brand)}
              className={`inline-flex items-center justify-center 
                text-sm sm:text-base font-medium
                px-4 py-2 rounded-lg cursor-pointer
                transition-all duration-300 ease-in-out
                whitespace-nowrap w-fit mx-0.5 
                border
                ${
                  selectedBrand === brand
                    ? 'bg-gray-100 text-gray-800 border-yellow-500 shadow-md'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                }`}
            >
              {brand}
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
}
