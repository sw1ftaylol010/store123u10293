import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, TrendingUp, DollarSign, Target, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function ReferralsPage() {
  const supabase = await createClient();

  // Fetch all referrals with stats
  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .order('total_referred', { ascending: false });

  const totalReferrals = referrals?.length || 0;
  const totalReferred = referrals?.reduce((sum, r) => sum + (r.total_referred || 0), 0) || 0;
  const totalEarned = referrals?.reduce((sum, r) => sum + (r.total_earned || 0), 0) || 0;
  const totalPaid = referrals?.reduce((sum, r) => sum + (r.total_paid || 0), 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'suspended':
        return <Badge variant="error">Suspended</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Referral Program Stats
          </h1>
          <p className="text-text-secondary mt-1">
            Track referral performance and manage payouts
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Referrers</p>
              <p className="text-2xl font-bold text-white mt-1">
                {totalReferrals}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">People Referred</p>
              <p className="text-2xl font-bold text-white mt-1">
                {totalReferred}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Earned</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${totalEarned.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Paid Out</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${totalPaid.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top Referrers
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-secondary">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">#</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">User</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Referral Code</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Referred</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Clicks</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Conversion</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Earned</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Pending</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Paid Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {referrals && referrals.length > 0 ? (
                referrals.map((referral, index) => {
                  const conversionRate = referral.total_clicks > 0
                    ? ((referral.total_referred / referral.total_clicks) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={referral.id} className="hover:bg-background-hover transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-2xl">🥇</span>}
                          {index === 1 && <span className="text-2xl">🥈</span>}
                          {index === 2 && <span className="text-2xl">🥉</span>}
                          <span className="text-white font-medium">{index + 1}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{referral.user_email}</p>
                          <p className="text-xs text-text-secondary">
                            Joined {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="px-2 py-1 bg-background-secondary rounded font-mono text-sm text-primary">
                          {referral.referral_code}
                        </code>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(referral.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-text-secondary" />
                          <span className="text-white font-medium">{referral.total_referred}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-text-secondary">{referral.total_clicks}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={parseFloat(conversionRate) > 5 ? 'success' : 'default'}>
                          {conversionRate}%
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">
                          ${referral.total_earned?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-yellow-500 font-medium">
                          ${referral.pending_payout?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-green-500 font-medium">
                          ${referral.total_paid?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-text-secondary">
                    No referral data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Payouts */}
      {referrals && referrals.filter(r => (r.pending_payout || 0) > 0).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-500" />
            Pending Payouts
          </h3>
          <div className="space-y-3">
            {referrals
              .filter(r => (r.pending_payout || 0) > 0)
              .map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
                      {referral.user_email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{referral.user_email}</p>
                      <p className="text-sm text-text-secondary">
                        {referral.total_referred} successful referrals
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-yellow-500">
                        ${referral.pending_payout?.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-secondary">Ready to pay</p>
                    </div>
                    <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors">
                      Pay Out
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}

