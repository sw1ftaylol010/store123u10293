import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface CohortUser {
  user_identifier: string;
  first_purchase_date: string;
  orders_count: number;
  total_revenue: number;
  days_between_purchases: number | null;
  is_repeat_customer: boolean;
}

export default async function AdminCohortsPage({ 
  params,
  searchParams 
}: { 
  params: { locale: Locale };
  searchParams: { days?: string };
}) {
  const supabase = await createClient();
  
  const days = parseInt(searchParams.days || '90');
  
  // Get cohort analysis
  const { data: cohortsData } = await supabase.rpc('get_cohort_analysis', {
    cohort_period: 30,
    min_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
  }) as { data: CohortUser[] | null };

  const cohorts = cohortsData || [];
  
  const repeatCustomers = cohorts.filter(c => c.is_repeat_customer);
  const repeatRate = (repeatCustomers.length / cohorts.length) * 100;
  const totalLTV = cohorts.reduce((sum, c) => sum + Number(c.total_revenue), 0);
  const avgLTV = totalLTV / cohorts.length;
  const avgDaysBetween = repeatCustomers.reduce((sum, c) => sum + (Number(c.days_between_purchases) || 0), 0) / repeatCustomers.length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          Customer Cohorts & LTV
        </h1>
        
        <select 
          className="px-4 py-2 bg-background-card border border-white/10 rounded-lg text-white"
          defaultValue={days}
        >
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="180">Last 180 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Total Customers</p>
          <p className="text-3xl font-bold text-white">
            {cohorts.length.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Repeat Customers</p>
          <p className="text-3xl font-bold text-primary">
            {repeatCustomers.length.toLocaleString()}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {repeatRate.toFixed(1)}% repeat rate
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Average LTV</p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(avgLTV, 'USD')}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Avg Days Between</p>
          <p className="text-3xl font-bold text-white">
            {avgDaysBetween.toFixed(0)}
          </p>
          <p className="text-xs text-text-muted mt-1">days</p>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Top Customers by LTV</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Customer
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  First Purchase
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Orders
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  LTV
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Days Between
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {cohorts.slice(0, 50).map((cohort, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-6 text-sm text-white font-mono">
                    {cohort.user_identifier.includes('@') 
                      ? cohort.user_identifier.substring(0, 20) + '...'
                      : cohort.user_identifier.substring(0, 8)}
                  </td>
                  <td className="py-4 px-6 text-sm text-text-secondary">
                    {format(new Date(cohort.first_purchase_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-4 px-6 text-sm text-white text-right">
                    {Number(cohort.orders_count)}
                  </td>
                  <td className="py-4 px-6 text-sm text-primary font-semibold text-right">
                    {formatCurrency(Number(cohort.total_revenue), 'USD')}
                  </td>
                  <td className="py-4 px-6 text-sm text-text-secondary text-right">
                    {cohort.days_between_purchases 
                      ? `${Number(cohort.days_between_purchases).toFixed(0)} days`
                      : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {cohort.is_repeat_customer ? (
                      <Badge variant="success">Repeat</Badge>
                    ) : (
                      <Badge variant="default">New</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Insights</h2>
        <div className="space-y-3">
          <div className="p-4 bg-background-lighter rounded-lg">
            <p className="text-white font-medium mb-1">Repeat Purchase Rate</p>
            <p className="text-text-secondary text-sm">
              {repeatRate.toFixed(1)}% of customers make more than one purchase. 
              Industry average is 20-30%.
            </p>
          </div>
          <div className="p-4 bg-background-lighter rounded-lg">
            <p className="text-white font-medium mb-1">Purchase Frequency</p>
            <p className="text-text-secondary text-sm">
              Repeat customers purchase every {avgDaysBetween.toFixed(0)} days on average.
            </p>
          </div>
          <div className="p-4 bg-background-lighter rounded-lg">
            <p className="text-white font-medium mb-1">Customer Value</p>
            <p className="text-text-secondary text-sm">
              Average customer lifetime value is {formatCurrency(avgLTV, 'USD')}.
              Repeat customers are worth {formatCurrency(totalLTV / repeatCustomers.length, 'USD')}.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

