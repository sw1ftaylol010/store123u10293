import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, maskCode } from '@/lib/utils';
import { format } from 'date-fns';
import { ReferralWidget } from '@/components/marketing/ReferralWidget';

export default async function AccountPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${params.locale}/auth/signin?redirect=/account`);
  }

  // Fetch user orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*),
        gift_codes:assigned_code_id (code)
      ),
      payments (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">{t.account.statuses.paid}</Badge>;
      case 'pending':
        return <Badge variant="warning">{t.account.statuses.pending}</Badge>;
      case 'failed':
        return <Badge variant="error">{t.account.statuses.failed}</Badge>;
      case 'cancelled':
        return <Badge variant="default">{t.account.statuses.cancelled}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            {t.account.title}
          </h1>
          <p className="text-text-secondary mb-8">{user.email}</p>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              {t.account.orderHistory}
            </h2>

            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-text-secondary">
                            {t.account.orderNumber}
                          </span>
                          <span className="font-mono text-sm text-white">
                            {order.id.slice(0, 8)}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-text-secondary">
                          {format(new Date(order.created_at), 'PPpp')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(order.total_amount, order.currency as any)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-white/10 pt-4 space-y-3">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-white">
                              {item.products?.brand} Gift Card
                            </h3>
                            <p className="text-sm text-text-secondary">
                              {formatCurrency(item.nominal, order.currency as any)}
                            </p>
                            
                            {/* Show code if order is paid */}
                            {order.status === 'paid' && item.assigned_code_id && item.gift_codes && (
                              <div className="mt-2 p-3 bg-background-lighter rounded-lg">
                                <p className="text-xs text-text-secondary mb-1">Your code:</p>
                                <code className="text-sm font-mono text-primary">
                                  {maskCode(item.gift_codes.code)}
                                </code>
                                <p className="text-xs text-text-muted mt-1">
                                  Check your email for the full code
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    {order.status === 'paid' && (
                      <div className="border-t border-white/10 pt-4 mt-4">
                        <button
                          className="text-sm text-primary hover:text-primary-light transition-colors"
                          onClick={async () => {
                            // Resend email
                            await fetch('/api/orders/resend-email', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ orderId: order.id }),
                            });
                            alert('Email resent!');
                          }}
                        >
                          {t.account.resendEmail}
                        </button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-text-secondary text-lg">{t.account.noOrders}</p>
              </Card>
            )}
          </div>

          {/* Referral Program Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Refer Friends & Earn
            </h2>
            <ReferralWidget userEmail={user.email || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}

