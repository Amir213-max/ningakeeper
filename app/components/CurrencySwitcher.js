'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { ChevronDown } from 'lucide-react';

const CurrencySwitcher = () => {
  const { currency, switchCurrency, loading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
  ];

  const currentCurrency = currencies.find(c => c.code === currency);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencySelect = (currencyCode) => {
    console.log('🔄 Switching currency to:', currencyCode);
    switchCurrency(currencyCode);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-1 px-2 py-1 text-xs">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#FFD300]"></div>
        <span className="text-[#666]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center  bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#FFD300] transition-all duration-200 text-sm sm:text-base"
        aria-label="Select currency"
      >
        <span className="text-base sm:text-lg">{currentCurrency?.flag}</span>
        <span className="font-medium text-[#111]">{currentCurrency?.code}</span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 sm:w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden text-sm">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencySelect(curr.code)}
              className={`w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 transition ${
                currency === curr.code ? 'bg-[#FFD300]/10' : ''
              }`}
            >
              <span className="text-lg">{curr.flag}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#111]">{curr.code}</span>
                  {currency === curr.code && (
                    <svg
                      className="w-4 h-4 text-[#FFD300]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-[11px] text-[#777]">{curr.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySwitcher;
