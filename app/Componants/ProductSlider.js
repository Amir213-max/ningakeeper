"use client";

import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { useTranslation } from '../contexts/TranslationContext';

export default function ProductSlider({ images, productName }) {
  const { lang } = useTranslation();

  const showArrows = images?.length > 1;


  return (
    <div className="relative w-full flex items-center justify-center">
      <Splide
        options={{
          type: 'loop',
          perPage: 1,
          pagination: false,
          arrows: showArrows,
          gap: '1rem',
          autoplay: false,
          direction: lang === 'ar' ? 'rtl' : 'ltr',
        }}
        className="w-full h-full custom-splide"
      >
       {Array.isArray(images) && images.map((img, index) => (

          <SplideSlide
            key={index}
            className="flex items-center justify-center"
          >
            <img
              src={img}
              alt={`${productName} image ${index + 1}`}
              className="w-full h-48 object-contain rounded"
            />
          </SplideSlide>
        ))}
      </Splide>

      {/* تخصيص الأسهم بالـ CSS */}
      <style jsx>{`
        .custom-splide :global(.splide__arrow) {
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 9999px;
          width: 32px;
          height: 32px;
          display: ${showArrows ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }

        .custom-splide :global(.splide__arrow:hover) {
          background-color: rgba(0, 0, 0, 0.7);
        }

        .custom-splide :global(.splide__arrow svg) {
          fill: white;
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
}
