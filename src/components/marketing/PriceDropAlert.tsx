'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PriceDropAlertProps {
  productId: string;
  currentPrice: number;
  currentDiscount: number;
  productName: string;
}

export function PriceDropAlert({
  productId,
  currentPrice,
  currentDiscount,
  productName,
}: PriceDropAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [targetDiscount, setTargetDiscount] = useState(currentDiscount + 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (targetDiscount <= currentDiscount) {
      setError(`Target discount must be higher than current ${currentDiscount}%`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/price-alerts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          email,
          targetDiscountPercentage: targetDiscount,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setEmail('');
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create alert');
      }
    } catch (err) {
      setError('Failed to create alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden sm:inline">Notify Me</span>
      </Button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background-card border border-white/10 rounded-xl shadow-2xl z-50 p-6"
            >
              {success ? (
                /* Success State */
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4"
                  >
                    <Check className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Alert Created!
                  </h3>
                  <p className="text-text-secondary">
                    We'll notify you when the discount reaches {targetDiscount}%
                  </p>
                </div>
              ) : (
                /* Form */
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <BellRing className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Price Drop Alert
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Get notified when price drops
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-background-secondary rounded-lg">
                    <p className="text-sm text-text-secondary mb-1">Product:</p>
                    <p className="font-medium text-white">{productName}</p>
                    <p className="text-sm text-text-secondary mt-2">
                      Current discount: <span className="text-primary font-semibold">{currentDiscount}%</span>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <Input
                      label="Your Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />

                    {/* Target Discount */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Notify me when discount reaches
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={currentDiscount + 1}
                          max={50}
                          value={targetDiscount}
                          onChange={(e) => setTargetDiscount(parseInt(e.target.value))}
                          className="flex-1 h-2 bg-background-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex items-center justify-center w-16 h-10 bg-primary/10 rounded-lg">
                          <span className="text-lg font-bold text-primary">
                            {targetDiscount}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-text-muted mt-2">
                        You'll save ${Math.round(currentPrice * (targetDiscount - currentDiscount) / 100)} more
                      </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            Create Alert
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

