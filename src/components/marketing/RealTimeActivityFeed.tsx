'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, TrendingUp, Users, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Activity {
  id: string;
  type: 'purchase' | 'review' | 'milestone';
  userName: string;
  userLocation: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

// Random data pools for generating activities
const names = [
  'John', 'Maria', 'Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Anna', 
  'Tom', 'Lisa', 'James', 'Sophie', 'Chris', 'Nina', 'Ben', 'Kate',
  'Lucas', 'Olivia', 'Max', 'Chloe', 'Ryan', 'Mia', 'Daniel', 'Zoe'
];

const locations = [
  'US', 'UK', 'CA', 'DE', 'FR', 'ES', 'IT', 'AU', 'BR', 'MX', 
  'NL', 'SE', 'NO', 'DK', 'PL', 'JP', 'KR', 'SG', 'IN', 'AE'
];

const products = [
  { brand: 'Amazon', amounts: ['$50', '$100', '$250'] },
  { brand: 'Steam', amounts: ['$50', '$100', '$250'] },
  { brand: 'PlayStation', amounts: ['$50', '$100'] },
  { brand: 'Xbox', amounts: ['$50', '$100'] },
  { brand: 'Apple', amounts: ['$50', '$100', '$200'] },
  { brand: 'Google Play', amounts: ['$50', '$100', '$250'] },
  { brand: 'Netflix', amounts: ['$50', '$100'] },
  { brand: 'Spotify', amounts: ['$50', '$100'] },
  { brand: 'Nintendo', amounts: ['$50', '$100'] },
];

const reviewComments = [
  'Fast delivery!',
  'Works perfectly!',
  'Great price!',
  'Instant code!',
  'Best service!',
  'Will buy again!',
  'Highly recommend!',
  'Super fast!',
  'Amazing deal!',
  'Love it!',
  'Excellent!',
  'Very satisfied!',
  'Quick & easy!',
  'Perfect!',
  '10/10 service!'
];

// Generate random activity
const generateRandomActivity = (): Activity => {
  const type = Math.random() > 0.3 ? 'purchase' : 'review';
  const name = names[Math.floor(Math.random() * names.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const minutesAgo = Math.floor(Math.random() * 15) + 1; // 1-15 minutes ago

  if (type === 'purchase') {
    const product = products[Math.floor(Math.random() * products.length)];
    const amount = product.amounts[Math.floor(Math.random() * product.amounts.length)];
    
    return {
      id: Date.now().toString() + Math.random(),
      type: 'purchase',
      userName: name,
      userLocation: location,
      title: `${product.brand} ${amount}`,
      description: 'Just purchased',
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
      icon: 'shopping'
    };
  } else {
    const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
    const stars = Math.random() > 0.2 ? '5⭐' : '4⭐'; // 80% 5-star, 20% 4-star
    
    return {
      id: Date.now().toString() + Math.random(),
      type: 'review',
      userName: name,
      userLocation: location,
      title: `Left a ${stars} review`,
      description: `"${comment}"`,
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
      icon: 'star'
    };
  }
};

// Generate initial activities
const generateInitialActivities = (): Activity[] => {
  return Array.from({ length: 5 }, () => generateRandomActivity());
};

export function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(generateInitialActivities());
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewersCount, setViewersCount] = useState(127);

  // Rotate through activities every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [activities.length]);

  // Generate NEW random activities every 8-12 seconds
  useEffect(() => {
    const generateNewActivity = () => {
      const newActivity = generateRandomActivity();
      setActivities((prev) => {
        const updated = [...prev.slice(1), newActivity]; // Remove first, add new at end
        return updated;
      });
      // Reset to show the newest activity
      setCurrentIndex((prev) => (prev === activities.length - 1 ? prev : prev));
    };

    // Random interval between 8-12 seconds
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 4000) + 8000; // 8-12 seconds
      return setTimeout(() => {
        generateNewActivity();
        scheduleNext();
      }, delay);
    };

    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, [activities.length]);

  // Randomize viewers count every 10-20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount((prev) => {
        const change = Math.floor(Math.random() * 10) - 5; // -5 to +4
        const newCount = Math.max(100, Math.min(200, prev + change));
        return newCount;
      });
    }, Math.floor(Math.random() * 10000) + 10000); // 10-20 seconds

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
      case 'milestone':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (!isVisible) return null;

  const currentActivity = activities[currentIndex];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentActivity.id}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 shadow-2xl border-primary/20 backdrop-blur-lg bg-white/95">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center">
                {getIcon(currentActivity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      <span className="font-semibold">{currentActivity.userName}</span>
                      {' from '}
                      <span className="font-semibold">{currentActivity.userLocation}</span>
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {currentActivity.description}{' '}
                      <span className="font-medium text-primary">{currentActivity.title}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-shrink-0 p-1 hover:bg-background-hover rounded transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {getTimeAgo(currentActivity.timestamp)}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex gap-1 mt-3">
              {activities.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -top-2 -right-2"
      >
        <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 bg-white rounded-full"
          />
          <Users className="w-3 h-3" />
          <motion.span
            key={viewersCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewersCount} viewing
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

