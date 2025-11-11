'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface FlashSale {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  end_date: string;
  banner_text?: string;
  banner_color?: string;
}

interface FlashSaleBannerProps {
  flashSale: FlashSale;
  onClose?: () => void;
}

export function FlashSaleBanner({ flashSale, onClose }: FlashSaleBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(flashSale.end_date).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [flashSale.end_date]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
    // Store in localStorage to not show again for this session
    localStorage.setItem(`flash_sale_${flashSale.id}_dismissed`, 'true');
  };

  if (!isVisible) return null;

  const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="sticky top-0 z-50 w-full"
      >
        <div className={`relative overflow-hidden ${flashSale.banner_color || 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500'}`}>
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>

          <div className="container mx-auto px-4 py-4 relative">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Flash Sale Info */}
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <Zap className="w-6 h-6 text-white fill-white" />
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-lg uppercase tracking-wide">
                      {flashSale.banner_text || `${flashSale.discount_percentage}% OFF FLASH SALE`}
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <TrendingUp className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                  <p className="text-white/90 text-sm hidden sm:block">
                    {flashSale.description || 'Limited time offer on all gift cards!'}
                  </p>
                </div>
              </div>

              {/* Center: Countdown Timer */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white hidden sm:block" />
                <div className="flex gap-2">
                  {/* Hours */}
                  <div className="text-center">
                    <motion.div
                      key={timeLeft.hours}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]"
                    >
                      <div className="text-2xl font-bold text-white">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-white/80 uppercase">Hours</div>
                    </motion.div>
                  </div>

                  <div className="text-white text-2xl font-bold">:</div>

                  {/* Minutes */}
                  <div className="text-center">
                    <motion.div
                      key={timeLeft.minutes}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]"
                    >
                      <div className="text-2xl font-bold text-white">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-white/80 uppercase">Mins</div>
                    </motion.div>
                  </div>

                  <div className="text-white text-2xl font-bold hidden sm:block">:</div>

                  {/* Seconds */}
                  <div className="text-center hidden sm:block">
                    <motion.div
                      key={timeLeft.seconds}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]"
                    >
                      <div className="text-2xl font-bold text-white">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-white/80 uppercase">Secs</div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right: CTA + Close */}
              <div className="flex items-center gap-2">
                <Link href="/en/catalog">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-red-600 hover:bg-white/90 font-bold hidden sm:inline-flex"
                  >
                    Shop Now
                  </Button>
                </Link>

                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close banner"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white/40"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{
              duration: (timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds),
              ease: 'linear',
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

