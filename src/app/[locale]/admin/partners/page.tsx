import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 300; // Refresh every 5 minutes

export default async function AdminPartnersPage({ 
  params 
}: { 
  params: { locale: Locale };
}) {
  const supabase = await createClient();

  // Get partner accounts
  const { data: partners } = await supabase
    .from('partner_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  // Get stats for each partner
  const partnerStats = await Promise.all(
    (partners || []).map(async (partner) => {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, partner_commission')
        .eq('partner_id', partner.id)
        .eq('status', 'paid');

      const { data: links } = await supabase
        .from('affiliate_links')
        .select('clicks, conversions')
        .eq('partner_id', partner.id);

      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
      const totalCommission = orders?.reduce((sum, o) => sum + Number(o.partner_commission || 0), 0) || 0;
      const totalClicks = links?.reduce((sum, l) => sum + Number(l.clicks || 0), 0) || 0;
      const totalConversions = links?.reduce((sum, l) => sum + Number(l.conversions || 0), 0) || 0;

      return {
        ...partner,
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalCommission,
        totalClicks,
        totalConversions,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0,
      };
    })
  );

  const totalPartnersRevenue = partnerStats.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalCommissions = partnerStats.reduce((sum, p) => sum + p.totalCommission, 0);
  const activePartners = partnerStats.filter(p => p.status === 'active').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            🤝 Partner & Affiliate Program
          </h1>
          <p className="text-text-secondary">
            Manage partners, track performance, process payouts
          </p>
        </div>
        <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors">
          + Add Partner
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Active Partners</p>
          <p className="text-4xl font-bold text-white">{activePartners}</p>
          <p className="text-xs text-text-muted mt-1">of {partners?.length || 0} total</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Partner Revenue</p>
          <p className="text-4xl font-bold text-primary">${totalPartnersRevenue.toFixed(0)}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Total Commissions</p>
          <p className="text-4xl font-bold text-success">${totalCommissions.toFixed(0)}</p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Avg Commission</p>
          <p className="text-4xl font-bold text-white">
            {totalPartnersRevenue > 0 ? ((totalCommissions / totalPartnersRevenue) * 100).toFixed(1) : 0}%
          </p>
        </Card>
      </div>

      {/* Partners List */}
      <Card>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Partner Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Partner
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Commission Rate
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Orders
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Revenue
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Commission Earned
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Clicks
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  CR
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Status
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {partnerStats && partnerStats.length > 0 ? (
                partnerStats.map((partner) => (
                  <tr key={partner.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-white font-medium">{partner.partner_name}</p>
                        <p className="text-xs text-text-muted">{partner.partner_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {partner.commission_rate}%
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {partner.totalOrders}
                    </td>
                    <td className="py-4 px-6 text-sm text-primary font-semibold text-right">
                      ${partner.totalRevenue.toFixed(0)}
                    </td>
                    <td className="py-4 px-6 text-sm text-success font-semibold text-right">
                      ${partner.totalCommission.toFixed(0)}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary text-right">
                      {partner.totalClicks}
                    </td>
                    <td className="py-4 px-6 text-sm text-white text-right">
                      {partner.conversionRate.toFixed(1)}%
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={
                        partner.status === 'active' ? 'success' :
                        partner.status === 'pending' ? 'warning' :
                        'error'
                      }>
                        {partner.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="text-primary hover:text-primary-light text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="text-6xl mb-4">🤝</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No Partners Yet
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Start building your affiliate network by adding partners
                    </p>
                    <button className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg">
                      Add First Partner
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* API Documentation */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">📚 Partner API Documentation</h2>
        <div className="space-y-4">
          <div className="p-4 bg-background-lighter rounded-lg">
            <p className="text-white font-medium mb-2">GET /api/partners/stats</p>
            <p className="text-sm text-text-secondary mb-3">
              Get partner performance statistics
            </p>
            <div className="bg-background-card p-3 rounded font-mono text-xs text-text-muted">
              curl -X GET https://yoursite.com/api/partners/stats \<br />
              &nbsp;&nbsp;-H "X-API-Key: YOUR_API_KEY"
            </div>
          </div>

          <div className="p-4 bg-background-lighter rounded-lg">
            <p className="text-white font-medium mb-2">Affiliate Link Format</p>
            <p className="text-sm text-text-secondary mb-3">
              Partners can use tracking links to earn commissions
            </p>
            <div className="bg-background-card p-3 rounded font-mono text-xs text-text-muted">
              https://yoursite.com/product/ID?ref=PARTNER_CODE
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

