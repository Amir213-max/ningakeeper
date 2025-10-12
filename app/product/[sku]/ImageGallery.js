'use client';

import { useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

export default function ImageGallery({ images, productName }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [fadeKey, setFadeKey] = useState(0);

  const stopClickPropagation = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleImageClick = (url) => {
    if (url !== selectedImage) {
      setFadeKey(prev => prev + 1);
      setSelectedImage(url);
    }
  };

  // Hover zoom (desktop)
  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    e.currentTarget.style.backgroundSize = '200%';
    e.currentTarget.style.backgroundPosition = `${x}% ${y}%`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundSize = 'contain';
    e.currentTarget.style.backgroundPosition = 'center';
  };

  // Touch zoom (mobile)
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((touch.pageX - left) / width) * 100;
    const y = ((touch.pageY - top) / height) * 100;

    e.currentTarget.style.backgroundSize = '200%';
    e.currentTarget.style.backgroundPosition = `${x}% ${y}%`;
  };

  const handleTouchEnd = (e) => {
    e.currentTarget.style.backgroundSize = 'contain';
    e.currentTarget.style.backgroundPosition = 'center';
  };

  const fadeAnimation = `
    @keyframes fadeIn {
      0% { opacity: 0; transform: scale(0.98); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }

    /* الأسهم أسفل الصور المصغرة Desktop */
    .splide-custom-arrows .splide__arrow {
      background-color: rgba(255,255,255,0.9);
      color: #000;
      border-radius: 4px;
      width: 28px;
      height: 28px;
      font-size: 18px;
      display: inline-block;
    }

    .splide-custom-arrows .splide__arrows {
      display: flex;
      justify-content: center;
      margin-top: 8px;
      gap: 4px;
    }

    /* الأسهم في الريسبونسيف (Mobile) */
    @media (max-width: 768px) {
      .splide-custom-arrows .splide__arrows {
        position: absolute;
        top: 50%;
        width: 100%;
        justify-content: space-between;
        margin: 0;
        transform: translateY(-50%);
      }
    }
  `;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
      {/* الصور المصغرة */}
      <div
        className="flex md:flex-col items-center justify-center md:justify-start"
        onClick={stopClickPropagation}
        onPointerDown={stopClickPropagation}
      >
        <Splide
          options={{
            direction: 'ttb',
            height: 400,
            perPage: 5,
            pagination: false,
            arrows: true,
            gap: 8,
            wheel: true,
            breakpoints: {
              768: {
                direction: 'ltr',
                height: 'auto',
                width: '100%',
              },
            },
          }}
          aria-label="صور المنتج"
          className="w-full md:w-24 h-auto md:h-[400px] relative splide-custom-arrows"
        >
          {images.map((img, index) => (
            <SplideSlide key={index}>
              <img
                onPointerDown={stopClickPropagation}
                src={img}
                alt={`صورة ${index + 1}`}
                onClick={() => handleImageClick(img)}
                className={`w-20 h-20 object-contain rounded-md border-2 mb-2 transition-all duration-300 cursor-pointer 
                  ${selectedImage === img
                    ? 'border-amber-500 scale-105 shadow-lg'
                    : 'border-gray-300 hover:border-amber-300 hover:scale-105'
                  }`}
              />
            </SplideSlide>
          ))}
        </Splide>
      </div>

      {/* الصورة الكبيرة */}
      <div
        key={fadeKey}
        className="flex-1 flex items-center justify-center p-2 rounded-lg shadow-lg animate-fadeIn"
        style={{
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '100%',
          maxHeight: '80vh',
          minHeight: '300px',
          cursor: 'zoom-in',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <span className="sr-only">{productName}</span>
      </div>

      <style jsx>{fadeAnimation}</style>
    </div>
  );
}
