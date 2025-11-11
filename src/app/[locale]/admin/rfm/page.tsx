import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RFMSegment {
  customer_email: string;
  recency_days: number;
  frequency: number;
  monetary: number;
  rfm_score: string;
  segment: string;
  segment_description: string;
}

export const revalidate = 600; // Refresh every 10 minutes

export default async function AdminRFMPage({ 
  params 
}: { 
  params: { locale: Locale };
}) {
  const supabase = await createClient();

  // Get RFM segments
  const { data: segments } = await supabase.rpc('get_rfm_segments') as { data: RFMSegment[] | null };

  // Count by segment
  const segmentCounts = segments?.reduce((acc: any, s) => {
    acc[s.segment] = (acc[s.segment] || 0) + 1;
    return acc;
  }, {}) || {};

  // Calculate segment values
  const segmentValues = segments?.reduce((acc: any, s) => {
    acc[s.segment] = (acc[s.segment] || 0) + Number(s.monetary);
    return acc;
  }, {}) || {};

  const totalCustomers = segments?.length || 0;
  const totalValue = segments?.reduce((sum, s) => sum + Number(s.monetary), 0) || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          📊 RFM Customer Segmentation
        </h1>
        <p className="text-text-secondary">
          Recency, Frequency, Monetary analysis for targeted marketing
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Total Customers</p>
          <p className="text-4xl font-bold text-white">{totalCustomers}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">VIP Champions</p>
          <p className="text-4xl font-bold text-primary">{segmentCounts['VIP Champions'] || 0}</p>
          <p className="text-xs text-text-muted mt-1">
            ${(segmentValues['VIP Champions'] || 0).toFixed(0)} value
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">At Risk</p>
          <p className="text-4xl font-bold text-warning">{segmentCounts['At Risk'] || 0}</p>
          <p className="text-xs text-text-muted mt-1">Need attention</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Lost</p>
          <p className="text-4xl font-bold text-error">{segmentCounts['Lost'] || 0}</p>
          <p className="text-xs text-text-muted mt-1">Winback campaign</p>
        </Card>
      </div>

      {/* Segment Distribution */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Segment Distribution</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(segmentCounts).map(([segment, count]) => (
              <div key={segment} className="p-4 bg-background-lighter rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{segment}</span>
                  <Badge variant={getSegmentBadge(segment)}>{count as number}</Badge>
                </div>
                <p className="text-sm text-text-secondary">
                  ${(segmentValues[segment] || 0).toFixed(0)} total value
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {((count as number) / totalCustomers * 100).toFixed(1)}% of customers
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Customer List */}
      <Card>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Customer Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Customer
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Last Purchase
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Orders
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Total Spent
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  RFM Score
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Segment
                </th>
              </tr>
            </thead>
            <tbody>
              {segments && segments.length > 0 ? (
                segments.map((customer, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm text-white font-medium">
                      {customer.customer_email}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-muted text-right">
                      {customer.recency_days} days ago
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {customer.frequency}
                    </td>
                    <td className="py-4 px-6 text-sm text-primary font-semibold text-right">
                      ${Number(customer.monetary).toFixed(0)}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary text-center font-mono">
                      {customer.rfm_score}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={getSegmentBadge(customer.segment)}>
                        {customer.segment}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    No customer data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">📌 Marketing Recommendations</h2>
        <div className="space-y-3">
          {segmentCounts['VIP Champions'] > 0 && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-success font-medium mb-1">VIP Champions</p>
              <p className="text-text-secondary text-sm">
                Your best {segmentCounts['VIP Champions']} customers worth $
                {(segmentValues['VIP Champions'] || 0).toFixed(0)}. Send exclusive offers and maintain high touch.
              </p>
            </div>
          )}

          {segmentCounts['At Risk'] > 0 && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-warning font-medium mb-1">At Risk - Action Required</p>
              <p className="text-text-secondary text-sm">
                {segmentCounts['At Risk']} valuable customers haven't purchased recently. Launch winback campaign immediately.
              </p>
            </div>
          )}

          {segmentCounts['Promising'] > 0 && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-primary font-medium mb-1">Promising New Customers</p>
              <p className="text-text-secondary text-sm">
                {segmentCounts['Promising']} recent buyers. Convert them to loyal customers with targeted follow-up offers.
              </p>
            </div>
          )}

          {segmentCounts['Lost'] > 0 && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error font-medium mb-1">Lost Customers</p>
              <p className="text-text-secondary text-sm">
                {segmentCounts['Lost']} inactive customers. Consider aggressive discount campaign or let them go.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function getSegmentBadge(segment: string): 'success' | 'warning' | 'error' | 'primary' {
  if (segment === 'VIP Champions' || segment === 'Loyal Customers' || segment === 'Big Spenders') {
    return 'success';
  }
  if (segment === 'At Risk' || segment === 'Need Attention') {
    return 'warning';
  }
  if (segment === 'Lost') {
    return 'error';
  }
  return 'primary';
}

