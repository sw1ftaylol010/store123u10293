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

// Sample activities for demonstration
const sampleActivities: Activity[] = [
  {
    id: '1',
    type: 'purchase',
    userName: 'John',
    userLocation: 'US',
    title: 'Amazon $100',
    description: 'Just purchased',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    icon: 'shopping'
  },
  {
    id: '2',
    type: 'purchase',
    userName: 'Maria',
    userLocation: 'UK',
    title: 'PlayStation $50',
    description: 'Just purchased',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    icon: 'shopping'
  },
  {
    id: '3',
    type: 'review',
    userName: 'Alex',
    userLocation: 'CA',
    title: 'Left a 5⭐ review',
    description: '"Fast delivery!"',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    icon: 'star'
  },
];

export function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(sampleActivities);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Rotate through activities every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activities.length]);

  // Simulate new activities coming in
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would fetch from API
      // For now, we'll just rotate existing activities
    }, 30000); // Every 30 seconds

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
          <span>127 viewing</span>
        </div>
      </motion.div>
    </div>
  );
}

