import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface HealthMetric {
  metric_name: string;
  current_value: number;
  avg_24h: number;
  status: string;
}

export const revalidate = 60; // Refresh every minute

export default async function AdminHealthPage({ 
  params 
}: { 
  params: { locale: Locale };
}) {
  const supabase = await createClient();

  // Get system health metrics
  const { data: healthMetrics } = await supabase.rpc('get_system_health') as { data: HealthMetric[] | null };

  // Get recent webhook logs (last hour)
  const { data: recentWebhooks } = await supabase
    .from('webhook_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  // Calculate uptime (percentage of successful webhooks)
  const successfulWebhooks = recentWebhooks?.filter(w => w.processed && !w.error).length || 0;
  const totalWebhooks = recentWebhooks?.length || 0;
  const uptime = totalWebhooks > 0 ? (successfulWebhooks / totalWebhooks * 100) : 100;

  // Get failed emails (last 24h)
  const { data: failedEmails } = await supabase
    .from('orders')
    .select('id, email, email_status, created_at')
    .eq('email_status', 'failed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(10);

  // Overall system status
  const criticalIssues = (healthMetrics?.filter(m => m.status === 'critical').length || 0) +
                        (failedEmails?.length || 0 > 5 ? 1 : 0);
  const systemStatus = criticalIssues > 0 ? 'critical' : uptime >= 99 ? 'healthy' : 'warning';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          🏥 System Health Monitoring
        </h1>
        <Badge
          variant={
            systemStatus === 'healthy' ? 'success' :
            systemStatus === 'warning' ? 'warning' :
            'error'
          }
        >
          {systemStatus === 'healthy' ? '✓ All Systems Operational' :
           systemStatus === 'warning' ? '⚠ Degraded Performance' :
           '❌ Critical Issues'}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">System Uptime</p>
          <p className={`text-4xl font-bold ${
            uptime >= 99 ? 'text-success' :
            uptime >= 95 ? 'text-warning' :
            'text-error'
          }`}>
            {uptime.toFixed(2)}%
          </p>
          <p className="text-xs text-text-muted mt-1">Last hour</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Critical Issues</p>
          <p className={`text-4xl font-bold ${criticalIssues === 0 ? 'text-success' : 'text-error'}`}>
            {criticalIssues}
          </p>
          <p className="text-xs text-text-muted mt-1">Active now</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Webhooks (1h)</p>
          <p className="text-4xl font-bold text-white">
            {totalWebhooks}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {successfulWebhooks} successful
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Failed Emails (24h)</p>
          <p className={`text-4xl font-bold ${
            (failedEmails?.length || 0) === 0 ? 'text-success' :
            (failedEmails?.length || 0) < 5 ? 'text-warning' :
            'text-error'
          }`}>
            {failedEmails?.length || 0}
          </p>
          <p className="text-xs text-text-muted mt-1">Needs attention</p>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            ⚡ Performance Metrics
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Metric
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Current (1h avg)
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  24h avg
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {healthMetrics && healthMetrics.length > 0 ? (
                healthMetrics.map((metric, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm text-white font-medium">
                      {metric.metric_name.replace(/_/g, ' ').toUpperCase()}
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right font-mono">
                      {metric.current_value.toFixed(0)} ms
                    </td>
                    <td className="py-4 px-6 text-sm text-text-muted text-right font-mono">
                      {metric.avg_24h.toFixed(0)} ms
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge
                        variant={
                          metric.status === 'healthy' ? 'success' :
                          metric.status === 'warning' ? 'warning' :
                          'error'
                        }
                      >
                        {metric.status === 'healthy' ? '✓ Healthy' :
                         metric.status === 'warning' ? '⚠ Slow' :
                         '❌ Critical'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">
                    No performance data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Webhook Activity */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            Recent Webhook Activity (Last Hour)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Time
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Event
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Order ID
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentWebhooks && recentWebhooks.length > 0 ? (
                recentWebhooks.map((webhook) => (
                  <tr key={webhook.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm text-text-muted">
                      {new Date(webhook.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-white">
                      {webhook.event_type}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary font-mono">
                      {webhook.order_id?.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={webhook.processed && !webhook.error ? 'success' : 'error'}>
                        {webhook.processed && !webhook.error ? '✓ Success' : '❌ Failed'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-secondary">
                    No webhook activity in the last hour
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Failed Emails */}
      {failedEmails && failedEmails.length > 0 && (
        <Card className="bg-error/10 border-error/20">
          <div className="p-6 border-b border-error/20">
            <h2 className="text-xl font-semibold text-error">
              ❌ Failed Email Deliveries (Last 24h)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-card border-b border-error/20">
                <tr>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Order ID
                  </th>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Email
                  </th>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Time
                  </th>
                  <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {failedEmails.map((order) => (
                  <tr key={order.id} className="border-b border-error/20 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm text-white font-mono">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-6 text-sm text-white">
                      {order.email}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-muted">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-primary hover:text-primary-light text-sm font-medium">
                        Retry Send
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* System Status Summary */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">📋 System Status Summary</h2>
        <div className="space-y-3">
          <div className={`p-4 rounded-lg ${
            uptime >= 99 ? 'bg-success/10 border border-success/20' :
            uptime >= 95 ? 'bg-warning/10 border border-warning/20' :
            'bg-error/10 border border-error/20'
          }`}>
            <p className={`font-medium mb-1 ${
              uptime >= 99 ? 'text-success' :
              uptime >= 95 ? 'text-warning' :
              'text-error'
            }`}>
              {uptime >= 99 ? '✓ All Systems Operational' :
               uptime >= 95 ? '⚠ Degraded Performance' :
               '❌ Service Disruption'}
            </p>
            <p className="text-text-secondary text-sm">
              Current uptime: {uptime.toFixed(2)}% • Target: 99.9%
            </p>
          </div>

          <div className="p-4 bg-background-lighter rounded-lg">
            <p className="text-white font-medium mb-1">Monitoring Active</p>
            <p className="text-text-secondary text-sm">
              Real-time health checks every 60 seconds • Alerts configured for critical issues
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

