import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 0; // Always fetch fresh data

export default async function AdminRealtimePage({ 
  params 
}: { 
  params: { locale: Locale };
}) {
  const supabase = await createClient();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Today's stats
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', today.toISOString());
  
  const todayRevenue = todayOrders
    ?.filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  
  const todayPaid = todayOrders?.filter(o => o.status === 'paid').length || 0;

  // Last 24 hours stats
  const { data: last24hOrders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', last24h.toISOString());
  
  const last24hRevenue = last24hOrders
    ?.filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

  // Last 7 days stats
  const { data: last7daysOrders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', last7days.toISOString());
  
  const last7daysRevenue = last7daysOrders
    ?.filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

  // Recent events (last 100)
  const { data: recentEvents } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  // Active sessions (last hour)
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  const activeSessions = new Set(
    recentEvents
      ?.filter(e => new Date(e.created_at) >= lastHour)
      .map(e => e.session_id)
  ).size;

  // Pending orders
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  // Recent paid orders
  const { data: recentPaidOrders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(10);

  // Event type distribution (last 24h)
  const eventDistribution = recentEvents
    ?.filter(e => new Date(e.created_at) >= last24h)
    .reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  const sortedEvents = Object.entries(eventDistribution)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          Real-time Dashboard
        </h1>
        <Badge variant="success">Live • {new Date().toLocaleTimeString()}</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Active Sessions (1h)</p>
          <p className="text-4xl font-bold text-primary">{activeSessions}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Today Revenue</p>
          <p className="text-4xl font-bold text-primary">
            {formatCurrency(todayRevenue, 'USD')}
          </p>
          <p className="text-xs text-text-muted mt-1">{todayPaid} paid orders</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Last 24h Revenue</p>
          <p className="text-4xl font-bold text-white">
            {formatCurrency(last24hRevenue, 'USD')}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Last 7d Revenue</p>
          <p className="text-4xl font-bold text-white">
            {formatCurrency(last7daysRevenue, 'USD')}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Event Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Events (Last 24h)
          </h2>
          <div className="space-y-3">
            {sortedEvents.map(([eventType, count]) => (
              <div key={eventType} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-white font-mono">{eventType}</span>
                  <div className="flex-1 h-2 bg-background-lighter rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${((count as number) / (sortedEvents[0][1] as number)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-text-secondary ml-3">{count as number}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Orders */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Pending Orders
            <Badge variant="warning" className="ml-3">{pendingOrders?.length || 0}</Badge>
          </h2>
          <div className="space-y-3">
            {pendingOrders?.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-background-lighter rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {formatCurrency(order.total_amount, order.currency)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {order.email} • {formatDistanceToNow(new Date(order.created_at))} ago
                  </p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            ))}
            {!pendingOrders || pendingOrders.length === 0 && (
              <p className="text-text-secondary text-center py-4">No pending orders</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Paid Orders */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Recent Paid Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Time
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Email
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Items
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Amount
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPaidOrders?.map((order) => (
                <tr key={order.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-6 text-sm text-text-secondary">
                    {formatDistanceToNow(new Date(order.created_at))} ago
                  </td>
                  <td className="py-4 px-6 text-sm text-white">
                    {order.email}
                  </td>
                  <td className="py-4 px-6 text-sm text-text-secondary">
                    {order.order_items?.length || 0} items
                  </td>
                  <td className="py-4 px-6 text-sm text-primary font-semibold text-right">
                    {formatCurrency(order.total_amount, order.currency)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Badge variant="success">Paid</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Auto-refresh notice */}
      <div className="text-center text-text-muted text-sm">
        <p>Page refreshes automatically. Reload to see latest data.</p>
      </div>
    </div>
  );
}

