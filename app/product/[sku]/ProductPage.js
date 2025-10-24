'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/app/contexts/TranslationContext';
import Image from 'next/image';
import ImageGallery from './ImageGallery';
import ProductDetailsSidebar from './ProductDetailsSidebar';

export default function ProductPage({ product }) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ✅ Set first image as default current image
  useEffect(() => {
    if (product.images?.length > 0 && !selectedImage) {
      setSelectedImage(product.images[0]);
      setSelectedIndex(0);
    }
  }, [product.images, selectedImage]);

  // ✅ When user selects a new image from gallery
  const handleImageSelect = (img, index) => {
    setSelectedImage(img);
    setSelectedIndex(index);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="space-y-6">
            <div className="mb-4">
              <ImageGallery 
                images={product.images} 
                productName={product.name}
                selectedImage={selectedImage}
                selectedIndex={selectedIndex}
                onImageSelect={handleImageSelect}
                isVertical={false}
              />
            </div>

            {/* Main Image */}
            <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden group cursor-zoom-in border border-gray-100 rounded-lg shadow-sm">
              <AnimatePresence mode="wait">
                {selectedImage ? (
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-125"
                      sizes="(max-width: 768px) 100vw"
                      priority
                    />
                  </motion.div>
                ) : (
                  <span className="text-gray-400">No Image Available</span>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <ProductDetailsSidebar 
                product={product} 
                selectedImage={selectedImage}
                onImageSelect={handleImageSelect}
              />
            </motion.div>
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden md:block lg:hidden">
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <motion.div 
              className="col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ImageGallery 
                images={product.images} 
                productName={product.name}
                selectedImage={selectedImage}
                selectedIndex={selectedIndex}
                onImageSelect={handleImageSelect}
                isVertical={true}
              />
            </motion.div>

            <motion.div 
              className="col-span-6"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="relative w-full h-[500px] bg-gray-50 flex items-center justify-center overflow-hidden group cursor-zoom-in border border-gray-100 rounded-lg shadow-sm">
                <AnimatePresence mode="wait">
                  {selectedImage ? (
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={selectedImage}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                        sizes="(min-width: 768px) and (max-width: 1024px) 50vw"
                        priority
                      />
                    </motion.div>
                  ) : (
                    <span className="text-gray-400">No Image Available</span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div 
              className="col-span-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="sticky top-6 h-fit">
                <ProductDetailsSidebar 
                  product={product} 
                  selectedImage={selectedImage}
                  onImageSelect={handleImageSelect}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-6 gap-6 lg:gap-8">
            <div className="col-span-1">
              <ImageGallery 
                images={product.images} 
                productName={product.name}
                selectedImage={selectedImage}
                selectedIndex={selectedIndex}
                onImageSelect={handleImageSelect}
                isVertical={true}
              />
            </div>

            <div className="col-span-3">
              <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden group cursor-zoom-in border border-gray-100 rounded-lg shadow-sm">
                <AnimatePresence mode="wait">
                  {selectedImage ? (
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={selectedImage}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                        sizes="(min-width: 1024px) 50vw"
                        priority
                      />
                    </motion.div>
                  ) : (
                    <span className="text-gray-400">No Image Available</span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="sticky top-6"
              >
                <ProductDetailsSidebar 
                  product={product} 
                  selectedImage={selectedImage}
                  onImageSelect={handleImageSelect}
                />
              </motion.div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
