'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurrencySelect = (currencyCode) => {
    switchCurrency(currencyCode);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFD300]"></div>
        <span className="text-sm text-[#555]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:border-[#FFD300] focus:border-[#FFD300] focus:ring-2 focus:ring-[#FFD300] focus:ring-opacity-20 transition-all duration-200 min-w-[120px]"
        aria-label="Select currency"
      >
        <span className="text-lg">{currentCurrency?.flag}</span>
        <span className="text-sm font-medium text-[#111]">{currentCurrency?.code}</span>
        <svg
          className={`w-4 h-4 text-[#555] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencySelect(curr.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                currency === curr.code ? 'bg-[#FFD300] bg-opacity-10' : ''
              }`}
            >
              <span className="text-lg">{curr.flag}</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-[#111]">{curr.code}</span>
                  {currency === curr.code && (
                    <svg className="w-4 h-4 text-[#FFD300]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-[#555]">{curr.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySwitcher;
