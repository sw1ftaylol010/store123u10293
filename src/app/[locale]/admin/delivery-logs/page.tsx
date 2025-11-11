import { createClient } from '@/lib/supabase/server';
import { Locale } from '@/lib/i18n/config';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

export default async function DeliveryLogsPage({ params }: { params: { locale: Locale } }) {
  const supabase = await createClient();

  // Get delivery logs with order info
  const { data: logs } = await supabase
    .from('delivery_logs')
    .select(`
      *,
      orders (
        id,
        status,
        total_amount,
        currency
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // Get stats
  const { count: totalDeliveries } = await supabase
    .from('delivery_logs')
    .select('*', { count: 'exact', head: true });

  const { count: deliveriesToday } = await supabase
    .from('delivery_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
          🔒 Delivery Logs (Proof of Delivery)
        </h1>
        <p className="text-text-secondary">
          Legal protection: All code deliveries with SHA-256 hash verification
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-sm text-text-secondary mb-1">Total Deliveries</div>
          <div className="text-3xl font-bold text-text-primary">{totalDeliveries}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-text-secondary mb-1">Delivered Today</div>
          <div className="text-3xl font-bold text-primary">{deliveriesToday}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-text-secondary mb-1">Success Rate</div>
          <div className="text-3xl font-bold text-success-dark">
            {logs && logs.length > 0 
              ? Math.round((logs.filter(l => l.delivery_status === 'sent').length / logs.length) * 100)
              : 0}%
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-text-secondary mb-1">Legal Protection</div>
          <div className="text-lg font-bold text-text-primary">✅ SHA-256 Hash</div>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Customer Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Customer IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Code Hash (SHA-256)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Provider
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-background-hover transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {format(new Date(log.delivery_timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <code className="text-xs bg-background-secondary px-2 py-1 rounded">
                      {log.transaction_id}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {log.customer_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <code className="text-xs text-text-secondary">
                      {log.customer_ip || 'N/A'}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <code className="text-xs bg-background-secondary px-2 py-1 rounded font-mono break-all">
                      {log.code_hash.substring(0, 16)}...
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={log.delivery_status === 'sent' ? 'success' : 'error'}>
                      {log.delivery_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {log.email_provider}
                  </td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                    No delivery logs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legal Notice */}
      <Card className="p-6 mt-8 bg-primary-50 border-primary/30">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          🔒 Legal Protection Information
        </h3>
        <div className="text-sm text-text-secondary space-y-2">
          <p>
            <strong>What we log:</strong> Every code delivery is logged with:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Timestamp:</strong> Exact delivery time (UTC)</li>
            <li><strong>Transaction ID:</strong> Payment gateway reference</li>
            <li><strong>Customer Email:</strong> Recipient email address</li>
            <li><strong>Customer IP:</strong> IP address at time of purchase</li>
            <li><strong>Code Hash (SHA-256):</strong> Cryptographic proof of delivered code</li>
            <li><strong>Email Message ID:</strong> Email service delivery confirmation</li>
          </ul>
          <p className="mt-4">
            <strong>Purpose:</strong> This data serves as proof that codes were delivered to the customer
            and can be used in case of disputes or chargebacks.
          </p>
          <p>
            <strong>Verification:</strong> Use the <code className="bg-white px-2 py-1 rounded text-xs">verify_code_delivery()</code>
            function to verify if a specific code was delivered for a transaction.
          </p>
        </div>
      </Card>
    </div>
  );
}

