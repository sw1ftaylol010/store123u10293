import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { createClient } from '@/lib/supabase/server';
import { ProductConfigurator } from '@/components/product/ProductConfigurator';
import { 
  Zap, CheckCircle, Shield, Lock, Globe, 
  Tag, Star, Clock, ChevronRight, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { PriceDropAlert } from '@/components/marketing/PriceDropAlert';

interface ProductPageProps {
  params: { 
    locale: Locale;
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const t = getTranslations(params.locale);
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', params.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-8 max-w-6xl mx-auto">
          <Link href={`/${params.locale}`} className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${params.locale}/catalog`} className="hover:text-primary transition-colors">
            Catalog
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{product.brand}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Product Info */}
          <div className="space-y-6">
            {/* Brand Header */}
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Badge variant="primary" className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  <span>Best Seller</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>{product.region}</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{product.category}</span>
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {product.brand}
              </h1>
              <p className="text-lg text-text-secondary">{product.name}</p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="p-6 bg-background-card border border-white/10 rounded-xl">
                <p className="text-text-secondary">{product.description}</p>
              </div>
            )}

            {/* Key Info */}
            <div className="p-6 bg-background-card border border-white/10 rounded-xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {t.product.deliveryTime}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Instant email delivery within 2 minutes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {t.product.guarantee}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    100% working codes or your money back
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    Secure Payment
                  </h3>
                  <p className="text-sm text-text-secondary">
                    SSL encrypted checkout process
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Trust & Safety</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>10,000+ Happy Customers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Money Back Guarantee</span>
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="p-6 bg-background-card border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-white">
                  {t.product.aboutCard}
                </h2>
              </div>
              
              {product.instructions && (
                <div className="mb-4">
                  <h3 className="font-medium text-white mb-2">{t.product.howToRedeem}</h3>
                  <p className="text-sm text-text-secondary whitespace-pre-line">
                    {product.instructions}
                  </p>
                </div>
              )}

              {product.terms && (
                <div>
                  <h3 className="font-medium text-white mb-2">{t.product.terms}</h3>
                  <p className="text-sm text-text-secondary whitespace-pre-line">
                    {product.terms}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Configurator */}
          <div className="lg:sticky lg:top-24 h-fit">
            <ProductConfigurator product={product} locale={params.locale} />
            
            {/* Price Drop Alert */}
            <div className="mt-4">
              <PriceDropAlert
                productId={product.id}
                currentPrice={product.min_nominal}
                currentDiscount={product.discount_percentage}
                productName={`${product.brand} Gift Card`}
              />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Review Form */}
            <div className="lg:col-span-1">
              <ReviewForm productId={product.id} />
            </div>

            {/* Right: Reviews List */}
            <div className="lg:col-span-2">
              <ReviewsList
                reviews={reviews || []}
                averageRating={averageRating}
                totalReviews={reviews?.length || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


