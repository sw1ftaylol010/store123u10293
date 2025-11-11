import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tag, Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function PromoCodesPage() {
  const supabase = await createClient();

  // Fetch all promo codes
  const { data: promoCodes } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      case 'expired':
        return <Badge variant="default">Expired</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getDiscountDisplay = (code: any) => {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}% OFF`;
    } else if (code.discount_type === 'fixed') {
      return `$${code.discount_value} OFF`;
    }
    return `${code.discount_value}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Promo Codes
          </h1>
          <p className="text-text-secondary mt-1">
            Manage discount codes and track their performance
          </p>
        </div>
        <Link href="/en/admin/promo-codes/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Promo Code
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Codes</p>
              <p className="text-2xl font-bold text-white mt-1">
                {promoCodes?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Active</p>
              <p className="text-2xl font-bold text-white mt-1">
                {promoCodes?.filter(c => c.status === 'active').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Uses</p>
              <p className="text-2xl font-bold text-white mt-1">
                {promoCodes?.reduce((sum, c) => sum + (c.total_uses || 0), 0) || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${promoCodes?.reduce((sum, c) => sum + (c.total_revenue || 0), 0).toFixed(0) || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Promo Codes Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-secondary">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Code</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Discount</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Uses</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Revenue</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Valid Until</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {promoCodes && promoCodes.length > 0 ? (
                promoCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-background-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-primary">{code.code}</code>
                      </div>
                      {code.description && (
                        <p className="text-xs text-text-muted mt-1">{code.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="primary">{getDiscountDisplay(code)}</Badge>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(code.status)}
                    </td>
                    <td className="p-4">
                      <span className="text-white">
                        {code.total_uses || 0}
                        {code.max_uses && <span className="text-text-muted"> / {code.max_uses}</span>}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        ${(code.total_revenue || 0).toFixed(2)}
                      </span>
                      <p className="text-xs text-text-secondary mt-1">
                        Discount: ${(code.total_discount_given || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="p-4">
                      {code.end_date ? (
                        <span className={`text-sm ${
                          new Date(code.end_date) < new Date()
                            ? 'text-error'
                            : 'text-text-secondary'
                        }`}>
                          {format(new Date(code.end_date), 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="text-sm text-text-secondary">No expiry</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-text-secondary hover:text-primary" />
                        </button>
                        <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-text-secondary hover:text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-secondary">
                    No promo codes yet. Create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

