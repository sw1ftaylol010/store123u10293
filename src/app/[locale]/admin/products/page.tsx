import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export default async function AdminProductsPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('brand');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          {t.admin.products}
        </h1>
        <Link href={`/${params.locale}/admin/products/new`}>
          <Button variant="primary">
            {t.admin.addProduct}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <Card key={product.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {product.brand}
                </h3>
                <p className="text-sm text-text-secondary">{product.region}</p>
              </div>
              <Badge variant={product.is_active ? 'success' : 'default'}>
                {product.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Category:</span>
                <span className="text-white">{product.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Discount:</span>
                <span className="text-primary font-semibold">
                  {product.discount_percentage}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Range:</span>
                <span className="text-white">
                  {formatCurrency(product.min_nominal, product.currency as any)} - {formatCurrency(product.max_nominal, product.currency as any)}
                </span>
              </div>
            </div>

            <Link href={`/${params.locale}/admin/products/${product.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                {t.admin.editProduct}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

