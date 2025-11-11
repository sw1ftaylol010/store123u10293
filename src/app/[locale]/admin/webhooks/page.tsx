import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

export default async function AdminWebhooksPage({ params }: { params: { locale: Locale } }) {
  const supabase = await createClient();

  const { data: webhookLogs } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const processed = webhookLogs?.filter(w => w.processed).length || 0;
  const failed = webhookLogs?.filter(w => w.error && !w.processed).length || 0;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-8">
        Webhook Logs
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Total Webhooks</p>
          <p className="text-3xl font-bold text-white">{webhookLogs?.length || 0}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Processed</p>
          <p className="text-3xl font-bold text-success">{processed}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Failed</p>
          <p className="text-3xl font-bold text-error">{failed}</p>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Time
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Provider
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Bill ID
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Order ID
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Status
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Processed
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Response
                </th>
              </tr>
            </thead>
            <tbody>
              {webhookLogs?.map((log) => (
                <tr key={log.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-6 text-sm text-text-secondary">
                    {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                  </td>
                  <td className="py-4 px-6 text-sm text-white">
                    {log.provider}
                  </td>
                  <td className="py-4 px-6 text-sm font-mono text-white">
                    {log.bill_id?.slice(0, 12)}
                  </td>
                  <td className="py-4 px-6 text-sm font-mono text-white">
                    {log.order_id?.slice(0, 8)}
                  </td>
                  <td className="py-4 px-6 text-sm text-white">
                    {log.status}
                  </td>
                  <td className="py-4 px-6">
                    {log.processed ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="warning">No</Badge>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {log.error ? (
                      <Badge variant="error">{log.response_status || 'Error'}</Badge>
                    ) : (
                      <Badge variant="success">{log.response_status || 200}</Badge>
                    )}
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

