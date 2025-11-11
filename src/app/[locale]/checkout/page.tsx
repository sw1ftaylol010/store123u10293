'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { 
  Mail, Gift, Shield, Lock, CheckCircle, 
  CreditCard, Zap, ShoppingCart, AlertCircle
} from 'lucide-react';
import { PromoCodeInput } from '@/components/marketing/PromoCodeInput';

interface CheckoutConfig {
  productId: string;
  productName?: string;
  nominal: number;
  price: number;
  deliveryType: 'myself' | 'gift';
  recipientEmail?: string;
  recipientName?: string;
  giftMessage?: string;
  deliveryDate?: string;
}

export default function CheckoutPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const router = useRouter();
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState<{ amount: number; finalAmount: number; code: string } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('checkout_config');
    if (!stored) {
      router.push(`/${params.locale}/catalog`);
      return;
    }
    setConfig(JSON.parse(stored));
    
    // Track checkout start
    const { Analytics } = require('@/lib/analytics/tracking');
    Analytics.checkoutStart();
  }, [params.locale, router]);

  const handleCheckout = async () => {
    if (!config || !email) return;

    setIsLoading(true);
    setError('');
    
    // Track checkout submit
    const { Analytics } = require('@/lib/analytics/tracking');
    Analytics.checkoutSubmit(config.productId, config.price);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          productId: config.productId,
          nominal: config.nominal,
          price: config.price,
          recipientEmail: config.recipientEmail,
          recipientName: config.recipientName,
          recipientMessage: config.giftMessage,
          deliveryDate: config.deliveryDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      
      // Redirect to Cardlink payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-white">Cart</span>
              </div>
              <div className="w-12 h-1 bg-primary" />
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-white">Checkout</span>
              </div>
              <div className="w-12 h-1 bg-border" />
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-border text-text-secondary">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-text-secondary">Payment</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            {t.checkout.title}
          </h1>
          <p className="text-text-secondary mb-8 flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-500" />
            Secure checkout - SSL encrypted
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Contact Info */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-white">
                    Contact Information
                  </h2>
                </div>
                <Input
                  label={t.checkout.yourEmail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.checkout.emailPlaceholder}
                  required
                />
                <div className="flex items-center gap-2 text-xs text-text-secondary mt-2 p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>{t.product.deliveryTime}</span>
                </div>
              </Card>

              {config.deliveryType === 'gift' && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-white">
                      Gift Details
                    </h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-background-lighter rounded-lg">
                      <span className="text-text-secondary">{t.product.recipientEmail}: </span>
                      <span className="text-white">{config.recipientEmail}</span>
                    </div>
                    {config.recipientName && (
                      <div className="p-3 bg-background-lighter rounded-lg">
                        <span className="text-text-secondary">{t.product.recipientName}: </span>
                        <span className="text-white">{config.recipientName}</span>
                      </div>
                    )}
                    {config.giftMessage && (
                      <div className="p-3 bg-background-lighter rounded-lg">
                        <span className="text-text-secondary">{t.product.giftMessage}: </span>
                        <p className="text-white mt-1">{config.giftMessage}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Trust Badges */}
              <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-white">Safe & Secure</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>10K+ Customers</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Order Summary */}
            <div>
              <Card className="p-6 space-y-6 lg:sticky lg:top-24">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-white">
                    {t.checkout.orderSummary}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">{t.checkout.product}</span>
                      <span className="text-white font-medium">Gift Card</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">{t.checkout.amount}</span>
                      <span className="text-white font-medium">
                        {formatCurrency(config.nominal, 'USD')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Nominal</span>
                      <span className="text-white">
                        {formatCurrency(config.nominal, 'USD')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{t.checkout.discount}</span>
                      <Badge variant="success">
                        -{formatCurrency(config.nominal - config.price, 'USD')}
                      </Badge>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="pt-4 border-t border-white/10">
                    <PromoCodeInput
                      productId={config.productId}
                      amount={config.price}
                      onApply={(discount) => setPromoDiscount(discount)}
                      onRemove={() => setPromoDiscount(null)}
                    />
                  </div>

                  {/* Promo Discount */}
                  {promoDiscount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Promo Code ({promoDiscount.code})</span>
                      <Badge variant="success">
                        -{formatCurrency(promoDiscount.amount, 'USD')}
                      </Badge>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span className="text-white">{t.checkout.total}</span>
                      <span className="text-primary">
                        {formatCurrency(promoDiscount ? promoDiscount.finalAmount : config.price, 'USD')}
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <span className="text-error text-sm">{error}</span>
                  </div>
                )}

                {/* Terms Agreement Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-background-lighter rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    id="terms-agreement"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-background text-primary focus:ring-primary focus:ring-offset-background"
                  />
                  <label htmlFor="terms-agreement" className="text-sm text-text-secondary cursor-pointer">
                    I have read and agree to the{' '}
                    <a
                      href={`/${params.locale}/terms`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-light underline"
                    >
                      Terms of Service
                    </a>
                    {', '}
                    <a
                      href={`/${params.locale}/privacy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-light underline"
                    >
                      Privacy Policy
                    </a>
                    {', and '}
                    <a
                      href={`/${params.locale}/refund`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-light underline"
                    >
                      Refund Policy
                    </a>
                    . I understand that all sales are final and no refunds will be provided after delivery.
                  </label>
                </div>

                <Button
                  size="lg"
                  className="w-full group"
                  onClick={handleCheckout}
                  isLoading={isLoading}
                  disabled={!email || !agreedToTerms || isLoading}
                >
                  <Lock className="mr-2 w-5 h-5" />
                  {t.checkout.payNow}
                  <CreditCard className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure payment powered by Cardlink</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

