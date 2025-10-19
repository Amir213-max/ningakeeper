'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/app/contexts/TranslationContext';
import ImageGallery from './ImageGallery';
import ProductDetailsSidebar from './ProductDetailsSidebar';

export default function ProductPage({ product }) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(product.images?.[0]);

  return (
    <div className="bg-white min-h-screen">
      {/* Main Product Layout - 3 Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-8">
          
          {/* Left Column - Image Gallery Thumbnails (1/6 width) */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="hidden lg:block">
              <ImageGallery 
                images={product.images} 
                productName={product.name}
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                isVertical={true}
              />
            </div>
            {/* Mobile horizontal gallery */}
            <div className="lg:hidden mb-4">
              <ImageGallery 
                images={product.images} 
                productName={product.name}
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                isVertical={false}
              />
            </div>
          </div>

      {/* Center Column - Main Product Image (3/6 width) */}
<div className="lg:col-span-3 order-2 lg:order-2">
  <motion.div 
    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div
      className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden group cursor-zoom-in"
    >
      {selectedImage ? (
        <div
          className="w-full h-full bg-center bg-no-repeat bg-contain transition-all duration-300 ease-in-out"
          style={{
            backgroundImage: `url(${selectedImage})`,
          }}
          onMouseMove={(e) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const x = ((e.pageX - left) / width) * 100;
            const y = ((e.pageY - top) / height) * 100;
            e.currentTarget.style.backgroundSize = "200%";
            e.currentTarget.style.backgroundPosition = `${x}% ${y}%`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundSize = "contain";
            e.currentTarget.style.backgroundPosition = "center";
          }}
        />
      ) : (
        <span className="text-gray-400">No Image Available</span>
      )}
    </div>
  </motion.div>
</div>


          {/* Right Column - Product Information Sidebar (2/6 width) */}
          <div className="lg:col-span-2 order-3 lg:order-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:sticky lg:top-6"
            >
              <ProductDetailsSidebar 
                product={product} 
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
