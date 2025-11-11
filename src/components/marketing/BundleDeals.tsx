'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Check, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface BundleItem {
  id: string;
  brand: string;
  nominal: number;
  price: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  totalNominal: number;
  totalPrice: number;
  savings: number;
  discountPercentage: number;
  icon: string;
  color: string;
  popular?: boolean;
}

const bundles: Bundle[] = [
  {
    id: 'gamer-bundle',
    name: 'Gamer Bundle',
    description: 'Everything a gamer needs',
    items: [
      { id: '1', brand: 'PlayStation', nominal: 50, price: 36 },
      { id: '2', brand: 'Xbox', nominal: 50, price: 36 },
      { id: '3', brand: 'Steam', nominal: 50, price: 36 },
    ],
    totalNominal: 150,
    totalPrice: 95,
    savings: 13,
    discountPercentage: 37,
    icon: '🎮',
    color: 'from-blue-500 to-purple-500',
  },
  {
    id: 'shopping-spree',
    name: 'Shopping Spree',
    description: 'Shop til you drop',
    items: [
      { id: '4', brand: 'Amazon', nominal: 100, price: 72 },
      { id: '5', brand: 'Walmart', nominal: 50, price: 37 },
      { id: '6', brand: 'Target', nominal: 50, price: 37 },
    ],
    totalNominal: 200,
    totalPrice: 135,
    savings: 11,
    discountPercentage: 33,
    icon: '🛍️',
    color: 'from-green-500 to-emerald-500',
    popular: true,
  },
  {
    id: 'entertainment-pack',
    name: 'Entertainment Pack',
    description: 'Stream all day',
    items: [
      { id: '7', brand: 'Netflix', nominal: 25, price: 19 },
      { id: '8', brand: 'Spotify', nominal: 25, price: 19 },
      { id: '9', brand: 'Apple Music', nominal: 25, price: 19 },
    ],
    totalNominal: 75,
    totalPrice: 52,
    savings: 5,
    discountPercentage: 31,
    icon: '🎬',
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'mega-saver',
    name: 'Mega Saver',
    description: 'Maximum savings',
    items: [
      { id: '10', brand: 'Amazon', nominal: 250, price: 170 },
      { id: '11', brand: 'PlayStation', nominal: 100, price: 72 },
      { id: '12', brand: 'Netflix', nominal: 50, price: 37 },
    ],
    totalNominal: 400,
    totalPrice: 260,
    savings: 19,
    discountPercentage: 35,
    icon: '💎',
    color: 'from-yellow-500 to-orange-500',
  },
];

export function BundleDeals() {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const handleSelectBundle = (bundleId: string) => {
    setSelectedBundle(bundleId);
    // Here you would add to cart or navigate to checkout
    console.log('Selected bundle:', bundleId);
  };

  return (
    <div className="py-20 bg-background-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary/20 rounded-full mb-4">
            <Package className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Save More with Bundles</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Bundle Deals
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Get multiple gift cards together and save even more!
          </p>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((bundle, index) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hover
                className={`relative overflow-hidden ${
                  selectedBundle === bundle.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Popular Badge */}
                {bundle.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="primary" className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Popular
                    </Badge>
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`relative h-32 bg-gradient-to-br ${bundle.color} p-6 flex items-center justify-center`}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl"
                  >
                    {bundle.icon}
                  </motion.div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {bundle.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {bundle.description}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {bundle.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-text-secondary">
                          {item.brand} ${item.nominal}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Total Value:</span>
                      <span className="text-text-muted line-through">
                        ${bundle.totalNominal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Bundle Price:</span>
                      <span className="text-2xl font-bold text-primary">
                        ${bundle.totalPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center p-2 bg-green-500/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-500">
                        Save ${bundle.savings} ({bundle.discountPercentage}% OFF)
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full group"
                    onClick={() => handleSelectBundle(bundle.id)}
                    variant={selectedBundle === bundle.id ? 'primary' : 'outline'}
                  >
                    {selectedBundle === bundle.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        Get Bundle
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  💡 Pro Tip: Custom Bundles
                </h3>
                <p className="text-sm text-text-secondary">
                  Want to create your own bundle? Contact us for custom bundle deals with even bigger savings!
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

