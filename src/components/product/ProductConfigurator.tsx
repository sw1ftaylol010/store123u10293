'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils';
import { Analytics } from '@/lib/analytics/tracking';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductConfiguratorProps {
  product: Product;
  locale: Locale;
}

export function ProductConfigurator({ product, locale }: ProductConfiguratorProps) {
  const t = getTranslations(locale);
  const router = useRouter();

  const [selectedNominal, setSelectedNominal] = useState(product.available_nominals[0]);
  const [deliveryType, setDeliveryType] = useState<'myself' | 'gift'>('myself');
  
  // Track configurator open on mount
  useEffect(() => {
    Analytics.configuratorOpen(product.id);
  }, [product.id]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');

  const discountedPrice = calculateDiscountedPrice(selectedNominal, product.discount_percentage);
  const savings = selectedNominal - discountedPrice;
  
  // Track configurator changes
  const handleNominalChange = (nominal: number) => {
    setSelectedNominal(nominal);
    Analytics.configuratorChange(product.id, nominal, deliveryType);
  };
  
  const handleDeliveryTypeChange = (type: 'myself' | 'gift') => {
    setDeliveryType(type);
    Analytics.configuratorChange(product.id, selectedNominal, type);
  };

  const handleCheckout = () => {
    // Track add to cart
    Analytics.addToCart(product.id, selectedNominal, discountedPrice);
    // Store configuration in sessionStorage
    const config = {
      productId: product.id,
      nominal: selectedNominal,
      price: discountedPrice,
      deliveryType,
      recipientEmail: deliveryType === 'gift' ? recipientEmail : undefined,
      recipientName: deliveryType === 'gift' ? recipientName : undefined,
      giftMessage: deliveryType === 'gift' ? giftMessage : undefined,
      deliveryDate: deliveryDate === 'schedule' ? scheduledDate : undefined,
    };

    sessionStorage.setItem('checkout_config', JSON.stringify(config));
    router.push(`/${locale}/checkout`);
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Nominal Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          {t.product.selectAmount}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {product.available_nominals.map((nominal) => {
            const price = calculateDiscountedPrice(nominal, product.discount_percentage);
            return (
              <button
                key={nominal}
                onClick={() => handleNominalChange(nominal)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedNominal === nominal
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-sm text-text-secondary mb-1">
                  {formatCurrency(nominal, product.currency as any)}
                </div>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(price, product.currency as any)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Type */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          {t.product.deliveryOptions}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDeliveryTypeChange('myself')}
            className={`p-4 rounded-lg border-2 transition-all ${
              deliveryType === 'myself'
                ? 'border-primary bg-primary/10'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-white">{t.product.forMyself}</div>
            </div>
          </button>
          <button
            onClick={() => handleDeliveryTypeChange('gift')}
            className={`p-4 rounded-lg border-2 transition-all ${
              deliveryType === 'gift'
                ? 'border-primary bg-primary/10'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎁</div>
              <div className="font-medium text-white">{t.product.asGift}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Gift Options */}
      {deliveryType === 'gift' && (
        <div className="space-y-4">
          <Input
            label={t.product.recipientEmail}
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="recipient@example.com"
            required
          />
          <Input
            label={t.product.recipientName}
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="John Doe"
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t.product.giftMessage}
            </label>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-background-lighter border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              placeholder="Happy birthday! 🎉"
            />
          </div>

          {/* Delivery Date */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">
              {t.product.deliveryDate}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => setDeliveryDate('now')}
                className={`p-3 rounded-lg border transition-all text-sm ${
                  deliveryDate === 'now'
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-white/10 text-text-secondary hover:border-white/30'
                }`}
              >
                {t.product.now}
              </button>
              <button
                onClick={() => setDeliveryDate('schedule')}
                className={`p-3 rounded-lg border transition-all text-sm ${
                  deliveryDate === 'schedule'
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-white/10 text-text-secondary hover:border-white/30'
                }`}
              >
                {t.product.schedule}
              </button>
            </div>
            {deliveryDate === 'schedule' && (
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{t.product.originalPrice}</span>
          <span className="line-through text-text-muted">
            {formatCurrency(selectedNominal, product.currency as any)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{t.catalog.discount}</span>
          <Badge variant="success">
            {product.discount_percentage}% · -{formatCurrency(savings, product.currency as any)}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xl font-bold pt-2">
          <span className="text-white">{t.product.yourPrice}</span>
          <span className="text-primary">
            {formatCurrency(discountedPrice, product.currency as any)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleCheckout}
        disabled={deliveryType === 'gift' && !recipientEmail}
      >
        {t.product.checkout}
      </Button>
    </Card>
  );
}

