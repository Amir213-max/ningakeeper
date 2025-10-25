'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrencyRate } from '../lib/getCurrencyRate';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('EUR');
  const [conversionRate, setConversionRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && (savedCurrency === 'EUR' || savedCurrency === 'SAR')) {
      console.log('🔄 Loading saved currency from localStorage:', savedCurrency);
      setCurrency(savedCurrency);
    }
  }, []);

  // Fetch conversion rate when component mounts
  useEffect(() => {
    const fetchRate = async () => {
      try {
        console.log('🔄 Fetching currency conversion rate...');
        setLoading(true);
        setError(null);
        const rate = await getCurrencyRate();
        console.log('✅ Currency rate fetched successfully:', rate);
        setConversionRate(rate);
      } catch (err) {
        console.error('❌ Error loading currency rate:', err);
        setError('Failed to load currency rate');
        // Fallback to default rate
        const fallbackRate = 4.6;
        console.log('⚠️ Using fallback rate:', fallbackRate);
        setConversionRate(fallbackRate);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  // Save currency to localStorage when it changes
  useEffect(() => {
    if (currency) {
      console.log('💾 Saving currency to localStorage:', currency);
      localStorage.setItem('selectedCurrency', currency);
    }
  }, [currency]);

  const switchCurrency = (newCurrency) => {
    if (newCurrency === 'EUR' || newCurrency === 'SAR') {
      console.log('🔄 Switching currency from', currency, 'to', newCurrency);
      console.log('📊 Current conversion rate:', conversionRate);
      setCurrency(newCurrency);
    } else {
      console.warn('⚠️ Invalid currency code:', newCurrency);
    }
  };

  const convertPrice = (eurPrice) => {
    if (!eurPrice || isNaN(eurPrice)) {
      console.warn('⚠️ Invalid price for conversion:', eurPrice);
      return 0;
    }

    if (currency === 'EUR') {
      console.log(`💰 Converting ${eurPrice} EUR → ${eurPrice} EUR (no conversion needed)`);
      return eurPrice;
    }
    
    const convertedPrice = eurPrice * conversionRate;
    console.log(`💰 Converting ${eurPrice} EUR → ${convertedPrice} SAR (rate: ${conversionRate})`);
    return convertedPrice;
  };

  const formatPrice = (eurPrice, showCurrency = true) => {
    const convertedPrice = convertPrice(eurPrice);
    const formattedPrice = convertedPrice.toFixed(2);
    
    if (!showCurrency) {
      return formattedPrice;
    }
    
    const currencySymbol = currency === 'EUR' ? '€' : 'SAR';
    return `${formattedPrice} ${currencySymbol}`;
  };

  const getCurrencySymbol = () => {
    return currency === 'EUR' ? '€' : 'SAR';
  };

  const value = {
    currency,
    conversionRate,
    loading,
    error,
    switchCurrency,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
