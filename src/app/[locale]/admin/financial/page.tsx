import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface FinancialChannel {
  utm_source: string;
  utm_campaign: string;
  utm_content: string;
  sessions: number;
  orders_count: number;
  paid_orders: number;
  revenue: number;
  cost: number;
  profit: number;
  margin_percentage: number;
  ad_spend: number;
  roi_percentage: number | null;
  mer: number | null;
  conversion_rate: number;
  avg_order_value: number;
}

interface ProductProfit {
  product_id: string;
  brand: string;
  region: string;
  orders_count: number;
  units_sold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin_percentage: number;
}

export default async function AdminFinancialPage({ 
  params,
  searchParams 
}: { 
  params: { locale: Locale };
  searchParams: { days?: string };
}) {
  const supabase = await createClient();
  
  const days = parseInt(searchParams.days || '30');
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date().toISOString();

  // Get financial channel stats
  const { data: channels } = await supabase.rpc('get_channel_stats_financial', {
    start_date: startDate,
    end_date: endDate,
    filter_tenant_id: null,
  }) as { data: FinancialChannel[] | null };

  // Get product profitability
  const { data: products } = await supabase.rpc('get_product_profitability', {
    start_date: startDate,
    end_date: endDate,
  }) as { data: ProductProfit[] | null };

  // Calculate totals
  const totalRevenue = channels?.reduce((sum, ch) => sum + Number(ch.revenue), 0) || 0;
  const totalCost = channels?.reduce((sum, ch) => sum + Number(ch.cost), 0) || 0;
  const totalProfit = channels?.reduce((sum, ch) => sum + Number(ch.profit), 0) || 0;
  const totalSpend = channels?.reduce((sum, ch) => sum + Number(ch.ad_spend || 0), 0) || 0;
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
  const overallROI = totalSpend > 0 ? ((totalProfit - totalSpend) / totalSpend * 100) : null;
  const overallMER = totalSpend > 0 ? (totalRevenue / totalSpend) : null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          💰 Financial Analytics
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Revenue</p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(totalRevenue, 'USD')}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Cost</p>
          <p className="text-3xl font-bold text-error">
            {formatCurrency(totalCost, 'USD')}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Gross Profit</p>
          <p className="text-3xl font-bold text-success">
            {formatCurrency(totalProfit, 'USD')}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {overallMargin.toFixed(1)}% margin
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Ad Spend</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(totalSpend, 'USD')}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">ROI</p>
          {overallROI !== null ? (
            <>
              <p className={`text-3xl font-bold ${overallROI > 0 ? 'text-success' : 'text-error'}`}>
                {overallROI > 0 ? '+' : ''}{overallROI.toFixed(0)}%
              </p>
              <p className="text-xs text-text-muted mt-1">
                MER: {overallMER?.toFixed(2)}x
              </p>
            </>
          ) : (
            <p className="text-2xl text-text-muted">No data</p>
          )}
        </Card>
      </div>

      {/* Channel Profitability */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            Channel Profitability & ROI
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Channel
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Orders
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Revenue
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Cost
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Profit
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Margin%
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Ad Spend
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  ROI%
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  MER
                </th>
              </tr>
            </thead>
            <tbody>
              {channels?.map((channel, index) => {
                const roi = channel.roi_percentage;
                const isPositiveROI = roi !== null && roi > 0;
                
                return (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6">
                      <div className="text-sm text-white font-medium">
                        {channel.utm_source} / {channel.utm_campaign}
                      </div>
                      {channel.utm_content !== '(none)' && (
                        <div className="text-xs text-text-muted">
                          {channel.utm_content}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {Number(channel.paid_orders)}
                    </td>
                    <td className="py-4 px-6 text-sm text-primary font-semibold text-right">
                      {formatCurrency(Number(channel.revenue), 'USD')}
                    </td>
                    <td className="py-4 px-6 text-sm text-error text-right">
                      {formatCurrency(Number(channel.cost), 'USD')}
                    </td>
                    <td className="py-4 px-6 text-sm text-success font-semibold text-right">
                      {formatCurrency(Number(channel.profit), 'USD')}
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {Number(channel.margin_percentage).toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary text-right">
                      {formatCurrency(Number(channel.ad_spend || 0), 'USD')}
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      {roi !== null ? (
                        <span className={isPositiveROI ? 'text-success font-semibold' : 'text-error font-semibold'}>
                          {isPositiveROI ? '+' : ''}{roi.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {channel.mer !== null ? `${Number(channel.mer).toFixed(2)}x` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product Profitability */}
      <Card>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            Product Profitability
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Product
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Units Sold
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Revenue
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Cost
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Profit
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Margin%
                </th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-6">
                    <div className="text-sm text-white font-medium">
                      {product.brand}
                    </div>
                    <div className="text-xs text-text-muted">
                      {product.region}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-white text-right">
                    {Number(product.units_sold)}
                  </td>
                  <td className="py-4 px-6 text-sm text-primary font-semibold text-right">
                    {formatCurrency(Number(product.revenue), 'USD')}
                  </td>
                  <td className="py-4 px-6 text-sm text-error text-right">
                    {formatCurrency(Number(product.cost || 0), 'USD')}
                  </td>
                  <td className="py-4 px-6 text-sm text-success font-semibold text-right">
                    {formatCurrency(Number(product.profit || 0), 'USD')}
                  </td>
                  <td className="py-4 px-6 text-sm text-white text-right">
                    {Number(product.margin_percentage || 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">💡 Key Insights</h2>
        <div className="space-y-3">
          <div className="p-4 bg-background-lighter rounded-lg">
            <p className="text-white font-medium mb-1">Overall Performance</p>
            <p className="text-text-secondary text-sm">
              Gross profit: {formatCurrency(totalProfit, 'USD')} ({overallMargin.toFixed(1)}% margin)
              {overallROI !== null && (
                <> • ROI: <span className={overallROI > 0 ? 'text-success' : 'text-error'}>
                  {overallROI > 0 ? '+' : ''}{overallROI.toFixed(0)}%
                </span></>
              )}
            </p>
          </div>
          
          {channels && channels.length > 0 && (
            <>
              <div className="p-4 bg-background-lighter rounded-lg">
                <p className="text-white font-medium mb-1">Best Channel by Profit</p>
                <p className="text-text-secondary text-sm">
                  {channels[0].utm_source} / {channels[0].utm_campaign}: {formatCurrency(Number(channels[0].profit), 'USD')} profit
                </p>
              </div>
              
              {channels[0].roi_percentage !== null && channels[0].roi_percentage > 100 && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-success font-medium mb-1">🎯 High ROI Channel</p>
                  <p className="text-text-secondary text-sm">
                    {channels[0].utm_source} / {channels[0].utm_campaign} delivers +{channels[0].roi_percentage.toFixed(0)}% ROI - scale this!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

