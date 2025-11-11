'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, Star, Globe } from 'lucide-react';

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

export function LiveStatsDisplay() {
  const [stats, setStats] = useState<Stat[]>([
    {
      icon: <Users className="w-5 h-5" />,
      value: '10,247',
      label: 'Happy Customers',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      value: '50,000+',
      label: 'Codes Delivered',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Star className="w-5 h-5" />,
      value: '4.9/5',
      label: 'Average Rating',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <Globe className="w-5 h-5" />,
      value: '150+',
      label: 'Countries',
      color: 'from-purple-500 to-pink-500',
    },
  ]);

  // Simulate live updates (in production, fetch from API)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prevStats) => {
        const newStats = [...prevStats];
        // Randomly update a stat
        const randomIndex = Math.floor(Math.random() * newStats.length);
        if (randomIndex === 0) {
          // Increment customers
          const current = parseInt(newStats[randomIndex].value.replace(/,/g, ''));
          newStats[randomIndex].value = (current + 1).toLocaleString();
        }
        return newStats;
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-background-card to-background-secondary border border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {stat.icon}
            </div>

            {/* Value */}
            <motion.div
              key={stat.value}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2"
            >
              {stat.value}
            </motion.div>

            {/* Label */}
            <p className="text-sm text-text-secondary">
              {stat.label}
            </p>

            {/* Pulse effect */}
            <div className="absolute top-2 right-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

