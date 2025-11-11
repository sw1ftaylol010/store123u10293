import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Anomaly {
  insight_type: string;
  severity: string;
  title: string;
  description: string;
  metric_value: number;
  baseline_value: number;
  change_percentage: number;
  recommendation: string;
}

interface CohortLTV {
  cohort_month: string;
  customers_count: number;
  total_ltv: number;
  avg_ltv: number;
  repeat_customers: number;
  repeat_rate: number;
  avg_orders_per_customer: number;
}

export const revalidate = 300; // Refresh every 5 minutes

export default async function AdminInsightsPage({ 
  params 
}: { 
  params: { locale: Locale };
}) {
  const supabase = await createClient();

  // Get automated insights
  const { data: anomalies } = await supabase.rpc('detect_anomalies') as { data: Anomaly[] | null };

  // Get LTV by cohort
  const { data: cohorts } = await supabase.rpc('get_ltv_by_cohort', {
    cohort_period_days: 30,
  }) as { data: CohortLTV[] | null };

  // Get daily metrics for trend
  const { data: dailyMetrics } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('date', { ascending: false })
    .limit(30);

  // Calculate trends
  const recentRevenue = dailyMetrics?.slice(0, 7).reduce((sum, d) => sum + Number(d.revenue || 0), 0) || 0;
  const previousRevenue = dailyMetrics?.slice(7, 14).reduce((sum, d) => sum + Number(d.revenue || 0), 0) || 0;
  const revenueTrend = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue * 100) : 0;

  const recentProfit = dailyMetrics?.slice(0, 7).reduce((sum, d) => sum + Number(d.profit || 0), 0) || 0;
  const previousProfit = dailyMetrics?.slice(7, 14).reduce((sum, d) => sum + Number(d.profit || 0), 0) || 0;
  const profitTrend = previousProfit > 0 ? ((recentProfit - previousProfit) / previousProfit * 100) : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          🧠 Business Intelligence & Insights
        </h1>
        <Badge variant="success">Auto-updated</Badge>
      </div>

      {/* Automated Insights */}
      {anomalies && anomalies.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            ⚡ Automated Insights & Anomalies
          </h2>
          <div className="space-y-4">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  anomaly.severity === 'critical'
                    ? 'bg-error/10 border-error/20'
                    : anomaly.severity === 'warning'
                    ? 'bg-warning/10 border-warning/20'
                    : 'bg-success/10 border-success/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{anomaly.title}</h3>
                    <p className="text-text-secondary text-sm mt-1">
                      {anomaly.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      anomaly.severity === 'critical'
                        ? 'error'
                        : anomaly.severity === 'warning'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {anomaly.severity}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm mt-3">
                  <div>
                    <span className="text-text-muted">Current:</span>
                    <span className="text-white font-semibold ml-2">
                      {anomaly.metric_value.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Baseline:</span>
                    <span className="text-white font-semibold ml-2">
                      {anomaly.baseline_value.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Change:</span>
                    <span
                      className={`font-semibold ml-2 ${
                        anomaly.change_percentage > 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      {anomaly.change_percentage > 0 ? '+' : ''}
                      {anomaly.change_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {anomaly.recommendation && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-primary text-sm">
                      💡 <strong>Recommendation:</strong> {anomaly.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Revenue Trend</h3>
          <div className="text-3xl font-bold text-primary mb-2">
            ${recentRevenue.toFixed(0)}
          </div>
          <div className="text-sm text-text-secondary">Last 7 days</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-text-muted text-sm">vs previous week:</span>
            <span
              className={`font-semibold ${
                revenueTrend > 0 ? 'text-success' : 'text-error'
              }`}
            >
              {revenueTrend > 0 ? '+' : ''}
              {revenueTrend.toFixed(1)}%
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">💰 Profit Trend</h3>
          <div className="text-3xl font-bold text-success mb-2">
            ${recentProfit.toFixed(0)}
          </div>
          <div className="text-sm text-text-secondary">Last 7 days</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-text-muted text-sm">vs previous week:</span>
            <span
              className={`font-semibold ${
                profitTrend > 0 ? 'text-success' : 'text-error'
              }`}
            >
              {profitTrend > 0 ? '+' : ''}
              {profitTrend.toFixed(1)}%
            </span>
          </div>
        </Card>
      </div>

      {/* LTV by Cohort */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            📊 LTV by Cohort (Monthly)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Cohort Month
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Customers
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Total LTV
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Avg LTV
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Repeat Rate
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Avg Orders
                </th>
              </tr>
            </thead>
            <tbody>
              {cohorts && cohorts.length > 0 ? (
                cohorts.map((cohort, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm text-white font-medium">
                      {cohort.cohort_month}
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {Number(cohort.customers_count)}
                    </td>
                    <td className="py-4 px-6 text-sm text-primary font-semibold text-right">
                      ${Number(cohort.total_ltv).toFixed(0)}
                    </td>
                    <td className="py-4 px-6 text-sm text-success font-semibold text-right">
                      ${Number(cohort.avg_ltv).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {Number(cohort.repeat_rate).toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary text-right">
                      {Number(cohort.avg_orders_per_customer).toFixed(1)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    No cohort data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📌 Key Insights</h2>
        <div className="space-y-3">
          {cohorts && cohorts.length > 0 && (
            <>
              <div className="p-4 bg-background-lighter rounded-lg">
                <p className="text-white font-medium mb-1">Latest Cohort Performance</p>
                <p className="text-text-secondary text-sm">
                  {cohorts[0].cohort_month}: ${Number(cohorts[0].avg_ltv).toFixed(2)} avg LTV,{' '}
                  {Number(cohorts[0].repeat_rate).toFixed(1)}% repeat rate
                </p>
              </div>
              
              {Number(cohorts[0].repeat_rate) < 20 && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-warning font-medium mb-1">⚠️ Low Repeat Rate</p>
                  <p className="text-text-secondary text-sm">
                    Latest cohort repeat rate is {Number(cohorts[0].repeat_rate).toFixed(1)}%. 
                    Consider implementing retention campaigns.
                  </p>
                </div>
              )}
            </>
          )}
          
          <div className="p-4 bg-background-lighter rounded-lg">
            <p className="text-white font-medium mb-1">Predictive Insights</p>
            <p className="text-text-secondary text-sm">
              Based on current trends, projected revenue for next 7 days: 
              ${(recentRevenue * (1 + revenueTrend / 100)).toFixed(0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

