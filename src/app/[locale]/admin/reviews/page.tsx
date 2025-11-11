import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, CheckCircle, X, MessageSquare, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function ReviewsPage() {
  const supabase = await createClient();

  // Fetch all reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      products (brand)
    `)
    .order('created_at', { ascending: false });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const pendingCount = reviews?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = reviews?.filter(r => r.status === 'approved').length || 0;
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Reviews Moderation
          </h1>
          <p className="text-text-secondary mt-1">
            Approve or reject customer reviews
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Reviews</p>
              <p className="text-2xl font-bold text-white mt-1">
                {reviews?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Pending</p>
              <p className="text-2xl font-bold text-white mt-1">
                {pendingCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Approved</p>
              <p className="text-2xl font-bold text-white mt-1">
                {approvedCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Avg Rating</p>
              <p className="text-2xl font-bold text-white mt-1">
                {avgRating} ★
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-lg">
                    {review.name ? review.name[0].toUpperCase() : 'U'}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-white">
                        {review.name || 'Anonymous'}
                      </span>
                      {renderStars(review.rating)}
                      {review.is_verified_purchase && (
                        <Badge variant="success" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3 text-sm text-text-secondary">
                      <span>{review.email}</span>
                      <span>•</span>
                      <span>{(review.products as any)?.brand}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                    </div>

                    {review.title && (
                      <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                    )}

                    <p className="text-text-secondary leading-relaxed">
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-text-secondary">
                        👍 {review.helpful_count} helpful
                      </span>
                      <span className="text-text-secondary">
                        👎 {review.unhelpful_count} not helpful
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(review.status)}

                  {review.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <form action={`/api/reviews/${review.id}/approve`} method="POST">
                        <Button size="sm" variant="primary" className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                      </form>
                      <form action={`/api/reviews/${review.id}/reject`} method="POST">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No reviews yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}

