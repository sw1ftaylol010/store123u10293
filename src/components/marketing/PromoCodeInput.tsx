'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PromoCodeInputProps {
  productId: string;
  amount: number;
  onApply: (discount: { amount: number; finalAmount: number; code: string }) => void;
  onRemove: () => void;
}

export function PromoCodeInput({ productId, amount, onApply, onRemove }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<{ amount: number; finalAmount: number } | null>(null);

  const validatePromoCode = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          productId,
          amount,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCode(code.toUpperCase());
        setDiscount({
          amount: data.discount.amount,
          finalAmount: data.discount.finalAmount,
        });
        onApply({
          amount: data.discount.amount,
          finalAmount: data.discount.finalAmount,
          code: code.toUpperCase(),
        });
        setCode('');
      } else {
        setError(data.error || 'Invalid promo code');
      }
    } catch (err) {
      setError('Failed to validate promo code');
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedCode(null);
    setDiscount(null);
    setError('');
    onRemove();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validatePromoCode();
    }
  };

  return (
    <div className="space-y-3">
      {/* Applied promo code */}
      <AnimatePresence>
        {appliedCode && discount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Promo code applied!
                  </p>
                  <p className="text-xs text-green-700">
                    <span className="font-mono font-bold">{appliedCode}</span>
                    {' • '}
                    Save ${discount.amount.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={removePromoCode}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                aria-label="Remove promo code"
              >
                <X className="w-4 h-4 text-green-700" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input field */}
      {!appliedCode && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter promo code"
                className="pl-10 uppercase"
                disabled={loading}
              />
            </div>
            <Button
              onClick={validatePromoCode}
              disabled={!code.trim() || loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Apply'
              )}
            </Button>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-sm text-error"
              >
                <X className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Popular codes hint */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-text-secondary">Popular:</span>
            {['WELCOME10', 'SAVE15', 'NEWYEAR2025'].map((popularCode) => (
              <button
                key={popularCode}
                onClick={() => setCode(popularCode)}
                className="text-xs px-2 py-1 bg-background-secondary hover:bg-background-tertiary text-text-secondary hover:text-primary rounded transition-colors font-mono"
              >
                {popularCode}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

