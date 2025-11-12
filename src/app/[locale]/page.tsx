import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, calculateDiscountedPrice } from '@/lib/utils';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
import { 
  Zap, Shield, CheckCircle, Lock, 
  ArrowRight, Sparkles, TrendingUp,
  Users, Clock, Star, Gift
} from 'lucide-react';
import { StatsSection } from '@/components/sections/StatsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { HeroConfigurator } from '@/components/home/HeroConfigurator';
import { LiveStatsDisplay } from '@/components/marketing/LiveStatsDisplay';
import { RealTimeActivityFeed } from '@/components/marketing/RealTimeActivityFeed';
import { FlashSaleBanner } from '@/components/marketing/FlashSaleBanner';
import { BundleDeals } from '@/components/marketing/BundleDeals';

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const supabase = await createClient();

  // Fetch all products for configurator
  const { data: allProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('brand');

  // Fetch top products (best sellers)
  const { data: topProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('discount_percentage', { ascending: false })
    .limit(6);

  // Fetch active flash sale
  const { data: flashSale } = await supabase
    .from('flash_sales')
    .select('*')
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .lte('start_date', new Date().toISOString())
    .single();

  // Serialize data for client components
  const serializedProducts = allProducts ? JSON.parse(JSON.stringify(allProducts)) : [];
  const serializedTopProducts = topProducts ? JSON.parse(JSON.stringify(topProducts)) : [];
  const serializedFlashSale = flashSale ? JSON.parse(JSON.stringify(flashSale)) : null;

  return (
    <div className="w-full">
      {/* Flash Sale Banner */}
      {serializedFlashSale && <FlashSaleBanner flashSale={serializedFlashSale} />}
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-background-secondary">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f605_1px,transparent_1px),linear-gradient(to_bottom,#3b82f605_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary/20 rounded-full animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Trusted by 10,000+ customers</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-balance leading-tight">
              <span className="text-text-primary">{t.hero.title.split('35%')[0]}</span>
              <span className="gradient-primary bg-clip-text text-transparent">35%</span>
              <span className="text-text-primary">{t.hero.title.split('35%')[1]}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12">
              {t.hero.subtitle}
            </p>

            {/* Hero Configurator */}
            <HeroConfigurator locale={params.locale} products={serializedProducts} />

            {/* Brand Logos */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-16">
              {['Amazon', 'Apple', 'Google Play', 'PlayStation', 'Steam', 'Netflix'].map((brand) => (
                <div key={brand} className="text-sm font-medium text-text-tertiary hover:text-text-secondary transition-colors">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                Icon: Zap,
                title: t.features.instantDelivery.title,
                description: t.features.instantDelivery.description,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                Icon: Shield,
                title: t.features.trustedProviders.title,
                description: t.features.trustedProviders.description,
                color: 'from-green-500 to-emerald-500',
              },
              {
                Icon: CheckCircle,
                title: t.features.guarantee.title,
                description: t.features.guarantee.description,
                color: 'from-purple-500 to-pink-500',
              },
              {
                Icon: Lock,
                title: t.features.securePayment.title,
                description: t.features.securePayment.description,
                color: 'from-orange-500 to-red-500',
              },
            ].map((feature, index) => {
              const { Icon } = feature;
              return (
                <Card key={index} hover className="p-6 text-center group cursor-default">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary/20 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Real-Time Stats</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Trusted Worldwide
            </h2>
            <p className="text-text-secondary text-lg">
              Join thousands of satisfied customers
            </p>
          </div>
          <LiveStatsDisplay />
        </div>
      </section>

      {/* Top Products Section */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary/20 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-primary animate-bounce" />
              <span className="text-sm font-medium text-primary">Hot Deals</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              Best Sellers
            </h2>
            <p className="text-text-secondary text-lg">
              {t.catalog.upTo} 35% {t.catalog.discount}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serializedTopProducts?.map((product: Product) => {
              const discountedPrice = calculateDiscountedPrice(
                product.min_nominal,
                product.discount_percentage
              );

              return (
                <Card key={product.id} hover className="overflow-hidden group">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                          {product.brand}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {product.region}
                        </p>
                      </div>
                      <Badge variant="primary">
                        {product.discount_percentage}% {t.catalog.discount}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(discountedPrice, product.currency as any)}
                        </span>
                        <span className="text-sm text-text-muted line-through">
                          {formatCurrency(product.min_nominal, product.currency as any)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {t.product.from} {formatCurrency(product.min_nominal, product.currency as any)}
                      </p>
                    </div>

                    <Link href={`/${params.locale}/product/${product.id}`}>
                      <Button className="w-full" variant="primary">
                        {t.catalog.configure}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href={`/${params.locale}/catalog`}>
              <Button variant="outline" size="lg">
                {t.common.viewAll}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-background-lighter">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {t.howItWorks.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: t.howItWorks.step1.title,
                description: t.howItWorks.step1.description,
              },
              {
                step: '2',
                title: t.howItWorks.step2.title,
                description: t.howItWorks.step2.description,
              },
              {
                step: '3',
                title: t.howItWorks.step3.title,
                description: t.howItWorks.step3.description,
              },
            ].map((step) => (
              <div key={step.step} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary text-primary text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Bundle Deals Section */}
      <BundleDeals />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Ready to save up to 35%?
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Get your digital gift card in 2 minutes
          </p>
          <Link href={`/${params.locale}/catalog`}>
            <Button size="lg" variant="primary" className="group">
              <Gift className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              {t.hero.ctaPrimary}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Real-Time Activity Feed (Fixed Position) */}
      <RealTimeActivityFeed />
    </div>
  );
}

