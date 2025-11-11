'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  created_at: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  unhelpful_count: number;
}

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function ReviewsList({ reviews, averageRating, totalReviews }: ReviewsListProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

  const ratingDistribution = getRatingDistribution();

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return b.helpful_count - a.helpful_count;
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div>
                <div className="text-5xl font-bold text-white mb-2">
                  {averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(averageRating), 'lg')}
                <p className="text-sm text-text-secondary mt-2">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating, index) => {
              const count = ratingDistribution[index];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary w-12">
                    {rating} star
                  </span>
                  <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                  <span className="text-sm text-text-secondary w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          Customer Reviews ({totalReviews})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
                  {review.user_name ? review.user_name[0].toUpperCase() : <User className="w-6 h-6" />}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {review.user_name || 'Anonymous'}
                        </span>
                        {review.is_verified_purchase && (
                          <div className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified Purchase</span>
                          </div>
                        )}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-text-secondary">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                  )}

                  <p className="text-text-secondary leading-relaxed mb-4">
                    {review.comment}
                  </p>

                  {/* Helpful Buttons */}
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpful_count})</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-error transition-colors">
                      <ThumbsDown className="w-4 h-4" />
                      <span>Not Helpful ({review.unhelpful_count})</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Star className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No reviews yet</p>
            <p className="text-text-muted text-sm mt-2">Be the first to review this product!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

