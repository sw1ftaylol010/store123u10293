import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface ChannelStat {
  utm_source: string;
  utm_campaign: string;
  sessions: number;
  orders_count: number;
  paid_orders: number;
  revenue: number;
  conversion_rate: number;
  avg_order_value: number;
}

export default async function AdminChannelsPage({ 
  params,
  searchParams 
}: { 
  params: { locale: Locale };
  searchParams: { days?: string };
}) {
  const supabase = await createClient();
  
  const days = parseInt(searchParams.days || '30');
  
  // Get channel stats
  const { data: channelsData } = await supabase.rpc('get_channel_stats', {
    start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
  }) as { data: ChannelStat[] | null };

  const channels = channelsData || [];
  
  const totalRevenue = channels.reduce((sum, ch) => sum + Number(ch.revenue), 0);
  const totalSessions = channels.reduce((sum, ch) => sum + Number(ch.sessions), 0);
  const totalPaidOrders = channels.reduce((sum, ch) => sum + Number(ch.paid_orders), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          Marketing Channels
        </h1>
        
        <select 
          className="px-4 py-2 bg-background-card border border-white/10 rounded-lg text-white"
          defaultValue={days}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(totalRevenue, 'USD')}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Total Sessions</p>
          <p className="text-3xl font-bold text-white">
            {totalSessions.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Paid Orders</p>
          <p className="text-3xl font-bold text-white">
            {totalPaidOrders.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Overall CR</p>
          <p className="text-3xl font-bold text-primary">
            {((totalPaidOrders / totalSessions) * 100).toFixed(2)}%
          </p>
        </Card>
      </div>

      {/* Channels Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Source
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Campaign
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Sessions
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Orders
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Paid
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Revenue
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  CR%
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  AOV
                </th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-6 text-sm text-white font-medium">
                    {channel.utm_source}
                  </td>
                  <td className="py-4 px-6 text-sm text-text-secondary">
                    {channel.utm_campaign}
                  </td>
                  <td className="py-4 px-6 text-sm text-white text-right">
                    {Number(channel.sessions).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-white text-right">
                    {Number(channel.orders_count).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-white text-right">
                    {Number(channel.paid_orders).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-primary font-semibold text-right">
                    {formatCurrency(Number(channel.revenue), 'USD')}
                  </td>
                  <td className="py-4 px-6 text-sm text-white text-right">
                    {Number(channel.conversion_rate).toFixed(2)}%
                  </td>
                  <td className="py-4 px-6 text-sm text-text-secondary text-right">
                    {formatCurrency(Number(channel.avg_order_value), 'USD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

