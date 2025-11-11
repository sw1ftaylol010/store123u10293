import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export default async function AdminOrdersPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (brand)
      ),
      payments (*)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="default">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-8">
        {t.admin.orders}
      </h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Order ID
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Date
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Email
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Product
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Amount
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Status
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order: any) => (
                <tr key={order.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-6 text-sm text-white font-mono">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="py-4 px-6 text-sm text-text-secondary">
                    {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                  </td>
                  <td className="py-4 px-6 text-sm text-white">
                    {order.email}
                  </td>
                  <td className="py-4 px-6 text-sm text-white">
                    {order.order_items?.[0]?.products?.brand || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-sm text-primary font-semibold">
                    {formatCurrency(order.total_amount, order.currency)}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-6">
                    {order.payments?.[0] && getStatusBadge(order.payments[0].status)}
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

