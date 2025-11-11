import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Tag,
  MessageSquare,
  Gift,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch stats
  const { data: orders, count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .limit(5)
    .order('created_at', { ascending: false });

  const { count: promoCodesCount } = await supabase
    .from('promo_codes')
    .select('*', { count: 'exact', head: true });

  const { count: reviewsCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  const { count: pendingReviewsCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { data: referrals } = await supabase
    .from('referrals')
    .select('*');

  const totalReferrals = referrals?.length || 0;
  const totalReferred = referrals?.reduce((sum, r) => sum + (r.total_referred || 0), 0) || 0;

  // Calculate revenue
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Dashboard Overview
        </h1>
        <p className="text-text-secondary mt-1">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">
                ${totalRevenue.toFixed(0)}
              </p>
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.5% from last month
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-white mt-2">
                {ordersCount || 0}
              </p>
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8.2% from last month
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Referrals</p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalReferred}
              </p>
              <p className="text-xs text-text-secondary mt-2">
                {totalReferrals} active referrers
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Promo Codes</p>
              <p className="text-3xl font-bold text-white mt-2">
                {promoCodesCount || 0}
              </p>
              <p className="text-xs text-text-secondary mt-2">
                Active discount codes
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Tag className="w-7 h-7 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Reviews</p>
              <p className="text-xl font-bold text-white">{reviewsCount || 0}</p>
            </div>
            {pendingReviewsCount && pendingReviewsCount > 0 && (
              <Badge variant="warning" className="ml-auto">
                {pendingReviewsCount} pending
              </Badge>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Avg Order Value</p>
              <p className="text-xl font-bold text-white">
                ${ordersCount && ordersCount > 0 ? (totalRevenue / ordersCount).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Conversion Rate</p>
              <p className="text-xl font-bold text-white">4.8%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-secondary">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Order ID</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Product</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-background-hover transition-colors">
                    <td className="p-4">
                      <code className="text-xs text-primary font-mono">
                        #{order.id.slice(0, 8)}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className="text-white">{order.customer_email}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-secondary">{order.product_name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">${order.total_amount}</span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-text-secondary">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
