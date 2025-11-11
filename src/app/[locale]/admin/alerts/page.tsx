import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

export default async function AdminAlertsPage({ params }: { params: { locale: Locale } }) {
  const supabase = await createClient();

  const { data: alerts } = await supabase
    .from('system_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const unresolvedAlerts = alerts?.filter(a => !a.is_resolved) || [];
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = unresolvedAlerts.filter(a => a.severity === 'warning');

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      default:
        return <Badge variant="default">Info</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return '📦';
      case 'pending_payment':
        return '⏳';
      case 'email_failed':
        return '✉️';
      case 'webhook_failed':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-8">
        System Alerts
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Unresolved Alerts</p>
          <p className="text-3xl font-bold text-white">{unresolvedAlerts.length}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Critical</p>
          <p className="text-3xl font-bold text-error">{criticalAlerts.length}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Warnings</p>
          <p className="text-3xl font-bold text-warning">{warningAlerts.length}</p>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="overflow-hidden">
        {alerts && alerts.length > 0 ? (
          <div className="divide-y divide-white/10">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 ${alert.is_resolved ? 'opacity-50' : ''} ${
                  alert.severity === 'critical' ? 'bg-error/5' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{getTypeIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getSeverityBadge(alert.severity)}
                        {alert.is_resolved && (
                          <Badge variant="success">Resolved</Badge>
                        )}
                        <span className="text-xs text-text-muted">
                          {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {alert.title}
                      </h3>
                      {alert.message && (
                        <p className="text-sm text-text-secondary">{alert.message}</p>
                      )}
                      {alert.related_entity_type && (
                        <p className="text-xs text-text-muted mt-2">
                          Related: {alert.related_entity_type} ({alert.related_entity_id?.slice(0, 8)})
                        </p>
                      )}
                    </div>
                  </div>

                  {!alert.is_resolved && (
                    <form
                      action={async () => {
                        'use server';
                        const supabase = await createClient();
                        await supabase
                          .from('system_notifications')
                          .update({
                            is_resolved: true,
                            resolved_at: new Date().toISOString(),
                          })
                          .eq('id', alert.id);
                      }}
                    >
                      <Button type="submit" size="sm" variant="outline">
                        Mark Resolved
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-text-secondary text-lg">No alerts</p>
            <p className="text-text-muted text-sm mt-2">All systems operational ✓</p>
          </div>
        )}
      </Card>
    </div>
  );
}

