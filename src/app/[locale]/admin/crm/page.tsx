import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AbandonedCheckout {
  session_id: string;
  email: string;
  last_event: string;
  minutes_elapsed: number;
  utm_source: string | null;
  utm_campaign: string | null;
}

interface WinbackCandidate {
  email: string;
  user_id: string | null;
  last_order_date: string;
  days_since: number;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  favorite_brand: string | null;
}

export default async function AdminCRMPage({ 
  params 
}: { 
  params: { locale: Locale };
}) {
  const supabase = await createClient();

  // Get abandoned checkouts (last 4 hours)
  const { data: abandoned } = await supabase.rpc('get_abandoned_checkouts', {
    minutes_ago: 240, // 4 hours
  }) as { data: AbandonedCheckout[] | null };

  // Get winback candidates (20-45 days)
  const { data: winback } = await supabase.rpc('get_winback_candidates', {
    days_since_last_order: 45,
    min_days: 20,
  }) as { data: WinbackCandidate[] | null };

  // Get recent triggers
  const { data: recentTriggers } = await supabase
    .from('marketing_triggers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  // Calculate stats
  const abandonedRevenuePotential = abandoned
    ?.reduce((sum, item) => sum + 50, 0) || 0; // Assume $50 avg order
  
  const winbackRevenuePotential = winback
    ?.reduce((sum, customer) => sum + Number(customer.avg_order_value), 0) || 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          📧 CRM & Marketing Automation
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Abandoned Checkouts</p>
          <p className="text-4xl font-bold text-warning">
            {abandoned?.length || 0}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Last 4 hours
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Recovery Potential</p>
          <p className="text-4xl font-bold text-primary">
            {formatCurrency(abandonedRevenuePotential, 'USD')}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Estimated value
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Winback Candidates</p>
          <p className="text-4xl font-bold text-white">
            {winback?.length || 0}
          </p>
          <p className="text-xs text-text-muted mt-1">
            20-45 days inactive
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Winback Potential</p>
          <p className="text-4xl font-bold text-success">
            {formatCurrency(winbackRevenuePotential, 'USD')}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Based on AOV
          </p>
        </Card>
      </div>

      {/* Abandoned Checkouts */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              🛒 Abandoned Checkouts
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Customers who started checkout but didn't complete payment
            </p>
          </div>
          <Badge variant="warning">{abandoned?.length || 0}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Email
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Time Ago
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Source
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {abandoned && abandoned.length > 0 ? (
                abandoned.map((item, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm text-white font-medium">
                      {item.email}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {item.minutes_elapsed} minutes ago
                    </td>
                    <td className="py-4 px-6 text-sm text-text-muted">
                      {item.utm_source || 'Direct'} {item.utm_campaign && `/ ${item.utm_campaign}`}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-primary hover:text-primary-light text-sm font-medium">
                        Send Recovery Email
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">
                    No abandoned checkouts in the last 4 hours
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Winback Candidates */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              ↩️ Winback Candidates
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Past customers ready for re-engagement (20-45 days inactive)
            </p>
          </div>
          <Badge variant="default">{winback?.length || 0}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Customer
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Last Order
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Total Orders
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  LTV
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  AOV
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Favorite Brand
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {winback && winback.length > 0 ? (
                winback.slice(0, 20).map((customer, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6">
                      <div className="text-sm text-white font-medium">
                        {customer.email}
                      </div>
                      <div className="text-xs text-text-muted">
                        {customer.days_since} days ago
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {formatDistanceToNow(new Date(customer.last_order_date))} ago
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {Number(customer.total_orders)}
                    </td>
                    <td className="py-4 px-6 text-sm text-success font-semibold text-right">
                      {formatCurrency(Number(customer.total_spent), 'USD')}
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {formatCurrency(Number(customer.avg_order_value), 'USD')}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-muted">
                      {customer.favorite_brand || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-primary hover:text-primary-light text-sm font-medium">
                        Send Winback Email
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-secondary">
                    No winback candidates at this time
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Triggers (if any) */}
      {recentTriggers && recentTriggers.length > 0 && (
        <Card>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Recent Automation Triggers
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-card border-b border-white/10">
                <tr>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Type
                  </th>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Email
                  </th>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Created
                  </th>
                  <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTriggers.slice(0, 10).map((trigger) => (
                  <tr key={trigger.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm text-white font-medium">
                      {trigger.trigger_type}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {trigger.email}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-muted">
                      {formatDistanceToNow(new Date(trigger.created_at))} ago
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge 
                        variant={
                          trigger.status === 'sent' ? 'success' : 
                          trigger.status === 'failed' ? 'error' : 
                          'default'
                        }
                      >
                        {trigger.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Export Section */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">📤 Export for Email Campaigns</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium">
            Export Abandoned Checkouts CSV
          </button>
          <button className="px-6 py-3 bg-success hover:bg-success/80 rounded-lg text-white font-medium">
            Export Winback Candidates CSV
          </button>
        </div>
        <p className="text-sm text-text-muted mt-3">
          Use these exports with your email service provider (Mailchimp, SendGrid, etc.)
        </p>
      </Card>
    </div>
  );
}

