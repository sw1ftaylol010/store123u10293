'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/lib/i18n/config';
import { 
  Gift, MapPin, DollarSign, User, 
  ChevronDown, ArrowRight, Sparkles, Globe
} from 'lucide-react';

interface Product {
  id: string;
  brand: string;
  region: string;
  min_nominal: number;
  max_nominal: number;
  discount_percentage: number;
  currency: string;
}

interface HeroConfiguratorProps {
  locale: Locale;
  products: Product[];
}

export function HeroConfigurator({ locale, products }: HeroConfiguratorProps) {
  const router = useRouter();
  
  // Get unique brands and regions
  const brands = [...new Set(products.map(p => p.brand))].sort();
  const allRegions = [...new Set(products.map(p => p.region))].sort();
  
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [deliveryType, setDeliveryType] = useState<'myself' | 'gift'>('myself');
  
  // Filter available regions based on selected brand
  const availableRegions = selectedBrand 
    ? [...new Set(products.filter(p => p.brand === selectedBrand).map(p => p.region))].sort()
    : allRegions;
  
  // Get available amounts for selected brand and region
  const availableAmounts = selectedBrand && selectedRegion
    ? products
        .filter(p => p.brand === selectedBrand && p.region === selectedRegion)
        .map(p => ({
          min: p.min_nominal,
          max: p.max_nominal,
          discount: p.discount_percentage,
          currency: p.currency,
          productId: p.id
        }))
    : [];
  
  // Common amounts to show with progressive discounts
  const commonAmounts = [10, 25, 50, 100, 250, 500];
  
  // Progressive discount: bigger amount = bigger discount
  const getDiscountForAmount = (amount: number): number => {
    if (amount >= 500) return 35;
    if (amount >= 250) return 32;
    if (amount >= 100) return 28;
    if (amount >= 50) return 22;
    if (amount >= 25) return 20;
    return 15; // $10
  };
  
  // Get currency symbol based on selected region
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CNY': '¥',
      'INR': '₹',
      'BRL': 'R$',
      'MXN': '$',
      'NGN': '₦',
      'ZAR': 'R',
      'KES': 'KSh',
      'GHS': '₵',
    };
    return symbols[currency] || currency;
  };
  
  // Get current currency
  const currentCurrency = availableAmounts[0]?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currentCurrency);
  
  // Reset dependent fields when parent changes
  useEffect(() => {
    if (selectedBrand && !availableRegions.includes(selectedRegion)) {
      setSelectedRegion('');
      setSelectedAmount('');
    }
  }, [selectedBrand, availableRegions, selectedRegion]);
  
  useEffect(() => {
    if (selectedRegion) {
      setSelectedAmount('');
    }
  }, [selectedRegion]);

  const handleContinue = () => {
    if (!selectedBrand || !selectedRegion || !selectedAmount) return;
    
    // Find the product
    const product = products.find(
      p => p.brand === selectedBrand && p.region === selectedRegion
    );
    
    if (!product) return;
    
    // Navigate to product page with pre-selected configuration
    router.push(`/${locale}/product/${product.id}?nominal=${selectedAmount}&type=${deliveryType}`);
  };
  
  const isComplete = selectedBrand && selectedRegion && selectedAmount;
  const currentDiscount = selectedAmount ? getDiscountForAmount(parseInt(selectedAmount)) : 0;

  return (
    <Card className="p-8 md:p-10 max-w-4xl mx-auto backdrop-blur-sm bg-white/95 shadow-2xl">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center">
          Configure Your Gift Card
        </h2>
      </div>
      
      <p className="text-center text-text-secondary mb-8">
        Choose your brand, region, and amount in 3 simple steps
      </p>

      <div className="space-y-6">
        {/* Step 1: Brand */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Gift className="w-4 h-4 text-primary" />
            <span>1. Select Brand</span>
          </label>
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-4 pr-12 bg-background-secondary border-2 border-border rounded-xl text-text-primary font-medium appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none transition-all"
            >
              <option value="">Choose a brand...</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
          </div>
        </div>

        {/* Step 2: Region */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <MapPin className="w-4 h-4 text-primary" />
            <span>2. Select Region</span>
            {selectedRegion && (
              <span className="ml-auto text-xs font-medium text-text-secondary bg-background-tertiary px-3 py-1 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Currency: {currentCurrency} ({currencySymbol})
              </span>
            )}
          </label>
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              disabled={!selectedBrand}
              className={`w-full px-4 py-4 pr-12 bg-background-secondary border-2 border-border rounded-xl text-text-primary font-medium appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none transition-all ${
                !selectedBrand ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Choose a region...</option>
              {availableRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
          </div>
        </div>

        {/* Step 3: Amount */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <DollarSign className="w-4 h-4 text-primary" />
            <span>3. Select Amount</span>
            {currentDiscount > 0 && (
              <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Save {currentDiscount}%
              </span>
            )}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {commonAmounts.map(amount => {
              const isAvailable = availableAmounts.length > 0 && 
                amount >= availableAmounts[0].min && 
                amount <= availableAmounts[0].max;
              const amountDiscount = getDiscountForAmount(amount);
              
              return (
                <button
                  key={amount}
                  onClick={() => isAvailable && setSelectedAmount(amount.toString())}
                  disabled={!selectedRegion || !isAvailable}
                  className={`relative px-4 py-5 rounded-xl font-semibold text-lg transition-all ${
                    selectedAmount === amount.toString()
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : !selectedRegion || !isAvailable
                      ? 'bg-background-secondary text-text-muted cursor-not-allowed opacity-40'
                      : 'bg-background-secondary text-text-primary hover:bg-background-tertiary hover:border-primary/50 border-2 border-border hover:scale-105'
                  }`}
                >
                  {/* Discount badge */}
                  {isAvailable && (
                    <span className={`absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                      selectedAmount === amount.toString()
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      -{amountDiscount}%
                    </span>
                  )}
                  
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold">{currencySymbol}{amount}</span>
                    {isAvailable && (
                      <span className={`text-xs mt-1 ${
                        selectedAmount === amount.toString()
                          ? 'text-white/80'
                          : 'text-text-secondary'
                      }`}>
                        Pay {currencySymbol}{Math.round(amount * (1 - amountDiscount / 100))}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {selectedRegion && availableAmounts.length > 0 && (
            <p className="text-xs text-text-secondary text-center">
              Available range: {currencySymbol}{availableAmounts[0].min} - {currencySymbol}{availableAmounts[0].max}
            </p>
          )}
        </div>

        {/* Step 4: Delivery Type */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <User className="w-4 h-4 text-primary" />
            <span>4. This is for...</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setDeliveryType('myself')}
              className={`px-6 py-4 rounded-xl font-medium transition-all border-2 ${
                deliveryType === 'myself'
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : 'bg-background-secondary text-text-primary border-border hover:border-primary/50'
              }`}
            >
              Myself
            </button>
            <button
              onClick={() => setDeliveryType('gift')}
              className={`px-6 py-4 rounded-xl font-medium transition-all border-2 ${
                deliveryType === 'gift'
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : 'bg-background-secondary text-text-primary border-border hover:border-primary/50'
              }`}
            >
              <Gift className="inline-block w-4 h-4 mr-2" />
              Gift
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            size="lg"
            className="w-full group"
            onClick={handleContinue}
            disabled={!isComplete}
          >
            Continue to Checkout
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          {!isComplete && (
            <p className="text-center text-xs text-text-secondary mt-3">
              Please complete all fields to continue
            </p>
          )}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Instant Delivery</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>10,000+ Happy Customers</span>
        </div>
      </div>
    </Card>
  );
}

