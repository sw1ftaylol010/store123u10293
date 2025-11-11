'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    location: 'United States',
    rating: 5,
    text: 'Amazing service! Got my Amazon gift card within 2 minutes. The discount was incredible - saved $35 on a $100 card. Will definitely use again!',
    product: 'Amazon Gift Card',
    verified: true,
  },
  {
    name: 'Marco Rodriguez',
    location: 'Spain',
    rating: 5,
    text: 'Fantastic experience! I was skeptical at first, but the codes work perfectly. The whole process was smooth and professional. Highly recommended!',
    product: 'PlayStation Store',
    verified: true,
  },
  {
    name: 'Emma Schmidt',
    location: 'Germany',
    rating: 5,
    text: 'Best gift card marketplace I\'ve found. Great prices, instant delivery, and excellent customer support. Bought 5 cards already!',
    product: 'Steam Wallet',
    verified: true,
  },
  {
    name: 'David Chen',
    location: 'United Kingdom',
    rating: 5,
    text: 'Quick, reliable, and affordable. Used it for buying gifts for my family. Everyone loved it! The discounts are real and substantial.',
    product: 'Apple Gift Card',
    verified: true,
  },
  {
    name: 'Maria Silva',
    location: 'Brazil',
    rating: 5,
    text: 'Excellent platform! I\'ve purchased multiple cards and never had any issues. The codes arrive instantly and always work. Five stars!',
    product: 'Google Play',
    verified: true,
  },
  {
    name: 'James Wilson',
    location: 'Canada',
    rating: 5,
    text: 'Impressed with the service! Fast delivery, genuine codes, and great savings. This is now my go-to place for digital gift cards.',
    product: 'Netflix Gift Card',
    verified: true,
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlay(false);
    setCurrentIndex(index);
  };

  return (
    <section className="py-20 bg-background-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary/20 rounded-full mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">Customer Reviews</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
            What Our Customers Say
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Carousel */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 md:p-10 relative">
                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 opacity-10">
                      <Quote className="w-20 h-20 text-primary" />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-lg text-text-secondary mb-6 leading-relaxed relative z-10">
                      "{testimonial.text}"
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center justify-between border-t border-border pt-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-text-primary">{testimonial.name}</h4>
                          {testimonial.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-tertiary">{testimonial.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-text-secondary">{testimonial.product}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 rounded-full bg-white border border-border shadow-lg hover:shadow-xl hover:border-primary/50 transition-all flex items-center justify-center text-text-secondary hover:text-primary"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 rounded-full bg-white border border-border shadow-lg hover:shadow-xl hover:border-primary/50 transition-all flex items-center justify-center text-text-secondary hover:text-primary"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-border hover:bg-border-hover'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

