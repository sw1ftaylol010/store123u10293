import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';

interface UnitEconomic {
  metric_name: string;
  metric_value: number;
  period_comparison: number;
}

export const revalidate = 300; // Refresh every 5 minutes

export default async function AdminUnitEconomicsPage({ 
  params 
}: { 
  params: { locale: Locale };
}) {
  const supabase = await createClient();

  // Get unit economics
  const { data: economics } = await supabase.rpc('get_unit_economics', {
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
  }) as { data: UnitEconomic[] | null };

  const getMetric = (name: string) => {
    return economics?.find(m => m.metric_name === name)?.metric_value || 0;
  };

  const totalOrders = getMetric('Total Orders');
  const revenue = getMetric('Revenue');
  const cost = getMetric('Cost');
  const grossProfit = getMetric('Gross Profit');
  const fees = getMetric('Transaction Fees');
  const refunds = getMetric('Refunds');
  const adSpend = getMetric('Ad Spend');
  const trueProfit = getMetric('True Profit');
  const aov = getMetric('AOV');
  const ltv = getMetric('LTV');
  const cac = getMetric('CAC');
  const ltvCacRatio = getMetric('LTV/CAC Ratio');

  const grossMargin = revenue > 0 ? (grossProfit / revenue * 100) : 0;
  const trueMargin = revenue > 0 ? (trueProfit / revenue * 100) : 0;
  const roi = adSpend > 0 ? ((trueProfit / adSpend) * 100) : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          💎 Unit Economics
        </h1>
        <p className="text-text-secondary">
          True profitability analysis for the last 30 days
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Total Orders</p>
          <p className="text-4xl font-bold text-white">{totalOrders.toFixed(0)}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Revenue</p>
          <p className="text-4xl font-bold text-primary">${revenue.toFixed(0)}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">True Profit</p>
          <p className="text-4xl font-bold text-success">${trueProfit.toFixed(0)}</p>
          <p className="text-xs text-text-muted mt-1">{trueMargin.toFixed(1)}% margin</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">ROI</p>
          <p className={`text-4xl font-bold ${roi > 100 ? 'text-success' : roi > 0 ? 'text-warning' : 'text-error'}`}>
            {roi.toFixed(0)}%
          </p>
        </Card>
      </div>

      {/* Profit Waterfall */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">💰 Profit Waterfall</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-white font-medium">Revenue</span>
              <span className="text-primary font-bold text-xl">${revenue.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-background-lighter rounded-lg">
              <span className="text-text-secondary">− Cost of Goods</span>
              <span className="text-error">−${cost.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
              <span className="text-white font-medium">= Gross Profit</span>
              <span className="text-success font-bold text-lg">${grossProfit.toFixed(2)}</span>
              <span className="text-text-muted text-sm">({grossMargin.toFixed(1)}%)</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-background-lighter rounded-lg">
              <span className="text-text-secondary">− Transaction Fees</span>
              <span className="text-error">−${fees.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-background-lighter rounded-lg">
              <span className="text-text-secondary">− Refunds</span>
              <span className="text-error">−${refunds.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-background-lighter rounded-lg">
              <span className="text-text-secondary">− Ad Spend (allocated)</span>
              <span className="text-error">−${adSpend.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-success/20 border-2 border-success rounded-lg">
              <span className="text-white font-bold text-lg">= True Profit</span>
              <span className="text-success font-bold text-2xl">${trueProfit.toFixed(2)}</span>
              <span className="text-text-muted text-sm">({trueMargin.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Economics */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">👤 Customer Economics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-background-lighter rounded-lg">
              <p className="text-text-secondary text-sm mb-2">AOV (Average Order Value)</p>
              <p className="text-3xl font-bold text-white mb-2">${aov.toFixed(2)}</p>
              <p className="text-xs text-text-muted">Per transaction</p>
            </div>

            <div className="p-6 bg-background-lighter rounded-lg">
              <p className="text-text-secondary text-sm mb-2">CAC (Customer Acquisition Cost)</p>
              <p className="text-3xl font-bold text-warning mb-2">${cac.toFixed(2)}</p>
              <p className="text-xs text-text-muted">Ad spend / orders</p>
            </div>

            <div className="p-6 bg-background-lighter rounded-lg">
              <p className="text-text-secondary text-sm mb-2">LTV (Lifetime Value)</p>
              <p className="text-3xl font-bold text-primary mb-2">${ltv.toFixed(2)}</p>
              <p className="text-xs text-text-muted">≈ AOV for gift cards</p>
            </div>
          </div>

          <div className="mt-6 p-6 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold mb-1">LTV / CAC Ratio</p>
                <p className="text-sm text-text-secondary">
                  Target: 3:1 | Healthy: {'>'}2:1
                </p>
              </div>
              <div className="text-right">
                <p className={`text-5xl font-bold ${
                  ltvCacRatio >= 3 ? 'text-success' :
                  ltvCacRatio >= 2 ? 'text-primary' :
                  ltvCacRatio >= 1 ? 'text-warning' :
                  'text-error'
                }`}>
                  {ltvCacRatio.toFixed(2)}x
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {ltvCacRatio >= 3 ? '🔥 Excellent' :
                   ltvCacRatio >= 2 ? '✓ Healthy' :
                   ltvCacRatio >= 1 ? '⚠ Marginal' :
                   '❌ Unsustainable'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">💡 Insights & Recommendations</h2>
        <div className="space-y-3">
          {trueMargin < 10 && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error font-medium mb-1">⚠ Low Profit Margin</p>
              <p className="text-text-secondary text-sm">
                True profit margin is only {trueMargin.toFixed(1)}%. Consider reducing costs, increasing prices, or optimizing ad spend.
              </p>
            </div>
          )}

          {ltvCacRatio < 2 && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-warning font-medium mb-1">⚠ LTV/CAC Below Target</p>
              <p className="text-text-secondary text-sm">
                Current ratio is {ltvCacRatio.toFixed(2)}x. Target is 3:1. Reduce CAC by optimizing campaigns or increase LTV through repeat purchases.
              </p>
            </div>
          )}

          {fees / revenue > 0.05 && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-warning font-medium mb-1">Transaction Fees High</p>
              <p className="text-text-secondary text-sm">
                Fees are {(fees / revenue * 100).toFixed(1)}% of revenue. Consider negotiating lower rates or switching providers.
              </p>
            </div>
          )}

          {roi > 200 && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-success font-medium mb-1">🔥 Excellent ROI</p>
              <p className="text-text-secondary text-sm">
                Your marketing ROI is {roi.toFixed(0)}%! Consider scaling successful channels to maximize profit.
              </p>
            </div>
          )}

          {refunds > revenue * 0.02 && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error font-medium mb-1">⚠ High Refund Rate</p>
              <p className="text-text-secondary text-sm">
                Refunds are {(refunds / revenue * 100).toFixed(1)}% of revenue. Investigate quality issues or improve customer communication.
              </p>
            </div>
          )}

          {trueMargin >= 15 && roi > 100 && ltvCacRatio >= 2 && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-success font-medium mb-1">🎉 Healthy Unit Economics</p>
              <p className="text-text-secondary text-sm">
                All metrics are in healthy ranges. Focus on scaling profitable channels while maintaining quality.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

