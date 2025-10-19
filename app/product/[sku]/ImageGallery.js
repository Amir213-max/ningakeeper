'use client';

import { useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

export default function ImageGallery({
  images,
  productName,
  selectedImage,
  onImageSelect,
  isVertical = true,
}) {
  const [fadeKey, setFadeKey] = useState(0);
  const [internalSelectedImage, setInternalSelectedImage] = useState(images[0]);
  const currentSelectedImage = selectedImage || internalSelectedImage;

  const handleImageClick = (url) => {
    if (url !== currentSelectedImage) {
      setFadeKey((prev) => prev + 1);
      if (onImageSelect) onImageSelect(url);
      else setInternalSelectedImage(url);
    }
  };

  if (isVertical) {
    // ✅ Vertical slider for sidebar
    return (
      <div className="h-full">
        <Splide
          options={{
            direction: 'ttb',
            height: '550px', // 👈 تقليل الارتفاع الكلي
            perPage: 4,
            gap: '15px', // 👈 زيادة المسافة بين الصور
            pagination: false,
            arrows: true,
            wheel: true,
            drag: true,
            breakpoints: {
              1024: { perPage: 4, height: '380px' },
              768: { perPage: 3, height: '320px' },
            },
          }}
          aria-label="Product side images"
          className="splide-vertical"
        >
          {images.map((img, index) => (
            <SplideSlide key={index}>
              <button
                onClick={() => handleImageClick(img)}
                className={`w-[80%] mx-auto aspect-square rounded-lg border-2 transition-all duration-300 overflow-hidden group 
                ${currentSelectedImage === img
                  ? 'border-yellow-400 shadow-lg ring-2 ring-yellow-200'
                  : 'border-gray-200 hover:border-yellow-300 hover:shadow-md'
                }`}
              >
                <img
                  src={img}
                  alt={`${productName} - Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                  style={{ maxWidth: '90%', maxHeight: '90%', margin: 'auto' }} // 👈 تصغير الصورة نفسها
                />
              </button>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    );
  }

  // ✅ Horizontal slider for mobile
  return (
    <div className="w-full">
      <Splide
        options={{
          direction: 'ltr',
          height: 'auto',
          perPage: 4, // 👈 يعرض 4 صور أصغر بدل 3
          pagination: false,
          arrows: true,
          gap: 16, // 👈 زيادة المسافة بين الصور
          wheel: true,
          breakpoints: {
            640: {
              perPage: 4,
            },
          },
        }}
        aria-label="Product images"
        className="w-full relative splide-custom-arrows"
      >
        {images.map((img, index) => (
          <SplideSlide key={index}>
            <button
              onClick={() => handleImageClick(img)}
              className={`w-[70%] mx-auto aspect-square rounded-lg border-2 transition-all duration-300 overflow-hidden group 
              ${currentSelectedImage === img
                ? 'border-yellow-400 shadow-lg ring-2 ring-yellow-200'
                : 'border-gray-200 hover:border-yellow-300 hover:shadow-md'
              }`}
            >
              <img
                src={img}
                alt={`${productName} - Image ${index + 1}`}
                className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                style={{ maxWidth: '85%', maxHeight: '85%', margin: 'auto' }} // 👈 تصغير الصورة نفسها
              />
            </button>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
}
