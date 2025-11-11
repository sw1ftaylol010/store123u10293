import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { 
  Zap, ShoppingBag, TrendingUp, ArrowRight, 
  PackageX, Filter, Tag, Globe, Sparkles 
} from 'lucide-react';

interface CatalogPageProps {
  params: { locale: Locale };
  searchParams: {
    brand?: string;
    category?: string;
    region?: string;
  };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const t = getTranslations(params.locale);
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (searchParams.brand) {
    query = query.eq('brand', searchParams.brand);
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category);
  }
  if (searchParams.region) {
    query = query.eq('region', searchParams.region);
  }

  const { data: products } = await query.order('brand');

  // Get unique values for filters
  const { data: allProducts } = await supabase
    .from('products')
    .select('brand, category, region')
    .eq('is_active', true);

  const brands = Array.from(new Set(allProducts?.map((p) => p.brand) || []));
  const categories = Array.from(new Set(allProducts?.map((p) => p.category) || []));
  const regions = Array.from(new Set(allProducts?.map((p) => p.region) || []));

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Best Prices Guaranteed</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            {t.catalog.title}
          </h1>
          <div className="flex items-center gap-4 text-text-secondary">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{products?.length || 0} products</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Up to 35% discount</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Instant delivery</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <CatalogFilters
              locale={params.locale}
              brands={brands}
              categories={categories}
              regions={regions}
              currentFilters={searchParams}
            />
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => {
                  const discountedPrice = calculateDiscountedPrice(
                    product.min_nominal,
                    product.discount_percentage
                  );

                  return (
                    <Card key={product.id} hover className="overflow-hidden group">
                      {/* Discount Badge - Floating */}
                      {product.discount_percentage > 0 && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-bold rounded-full shadow-lg">
                            <TrendingUp className="w-3 h-3" />
                            {product.discount_percentage}% OFF
                          </div>
                        </div>
                      )}

                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                              {product.brand}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                              <Globe className="w-4 h-4" />
                              <span>{product.region}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <Tag className="w-4 h-4" />
                              <span>{product.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-border pt-4">
                          <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {t.product.from}
                          </p>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-bold text-primary">
                              {formatCurrency(discountedPrice, product.currency as any)}
                            </span>
                            {product.discount_percentage > 0 && (
                              <span className="text-sm text-text-muted line-through">
                                {formatCurrency(product.min_nominal, product.currency as any)}
                              </span>
                            )}
                          </div>
                          {product.discount_percentage > 0 && (
                            <p className="text-xs text-green-500 font-medium">
                              You save {formatCurrency(product.min_nominal - discountedPrice, product.currency as any)}!
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-text-secondary pt-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span>Instant Email Delivery</span>
                        </div>

                        <Link href={`/${params.locale}/product/${product.id}`}>
                          <Button className="w-full group/btn" variant="primary">
                            {t.catalog.configure}
                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                  <PackageX className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No Products Found</h3>
                <p className="text-text-secondary text-lg mb-6 max-w-md mx-auto">
                  {t.catalog.noResults}
                  <br />
                  Try adjusting your filters or browse all products.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href={`/${params.locale}/catalog`}>
                    <Button variant="primary" className="group">
                      <Filter className="mr-2 w-4 h-4" />
                      Clear Filters
                    </Button>
                  </Link>
                  <Link href={`/${params.locale}`}>
                    <Button variant="outline">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

