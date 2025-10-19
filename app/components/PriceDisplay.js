'use client';

import { useCurrency } from '../contexts/CurrencyContext';

const PriceDisplay = ({ 
  price, 
  originalPrice = null, 
  showCurrency = true, 
  className = '',
  size = 'base' // 'sm', 'base', 'lg', 'xl'
}) => {
  const { formatPrice, convertPrice, currency } = useCurrency();

  if (!price && price !== 0) {
    return <span className="text-[#555]">Price not available</span>;
  }

  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const baseClasses = `font-semibold text-[#111] ${sizeClasses[size]}`;

  return (
    <div className={`${baseClasses} ${className}`}>
      {originalPrice && originalPrice > price ? (
        // Sale price display
        <div className="flex items-center space-x-2">
          <span className="text-[#FFD300] font-bold">
            {formatPrice(price, showCurrency)}
          </span>
          <span className="text-[#555] line-through text-sm">
            {formatPrice(originalPrice, showCurrency)}
          </span>
        </div>
      ) : (
        // Regular price display
        <span className="text-[#111]">
          {formatPrice(price, showCurrency)}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
