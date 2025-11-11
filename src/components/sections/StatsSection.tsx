'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, ShoppingBag, Star, TrendingUp } from 'lucide-react';

interface StatItem {
  Icon: any;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const stats: StatItem[] = [
  {
    Icon: Users,
    value: 10247,
    suffix: '+',
    label: 'Happy Customers',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    Icon: ShoppingBag,
    value: 25380,
    suffix: '+',
    label: 'Orders Delivered',
    color: 'from-green-500 to-emerald-500',
  },
  {
    Icon: Star,
    value: 4.9,
    suffix: '/5',
    label: 'Customer Rating',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    Icon: TrendingUp,
    value: 35,
    suffix: '%',
    label: 'Average Discount',
    color: 'from-purple-500 to-pink-500',
  },
];

function CountUp({ end, duration = 2000, suffix = '', decimals = 0 }: { 
  end: number; 
  duration?: number; 
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = easeOutQuart * end;
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-white">
      {count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary-dark to-primary-darker relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      
      <div className="container relative mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Join our growing community of satisfied customers worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const { Icon } = stat;
            return (
              <div 
                key={index} 
                className="text-center group cursor-default"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CountUp 
                  end={stat.value} 
                  suffix={stat.suffix}
                  decimals={stat.suffix === '/5' ? 1 : 0}
                />
                <p className="text-blue-100 mt-2">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

