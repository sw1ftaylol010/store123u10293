import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { 
  Gift, Shield, Zap, Users, TrendingUp, 
  Globe, Heart, Award, Mail, CheckCircle
} from 'lucide-react';

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);

  const values = [
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your security is our priority. All transactions are SSL encrypted and your data is always protected.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Get your digital gift cards within minutes. No waiting, no hassle - just instant delivery to your inbox.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: TrendingUp,
      title: 'Best Prices',
      description: 'Save up to 35% on your favorite brands. We work directly with suppliers to bring you unbeatable discounts.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Our dedicated support team is always here to help. Reach out anytime and we\'ll respond quickly.',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const stats = [
    { value: '10,247+', label: 'Happy Customers', icon: Users },
    { value: '25,380+', label: 'Orders Delivered', icon: Gift },
    { value: '4.9/5', label: 'Customer Rating', icon: Award },
    { value: '35%', label: 'Average Savings', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary/20 rounded-full mb-6">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">About Us</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Your Trusted Digital Gift Card Marketplace
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make digital gift cards accessible, affordable, and instant for everyone around the world.
          </p>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} hover className="p-6 text-center group cursor-default">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-white">Our Story</h2>
            </div>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                <span className="font-semibold text-white">Lonieve Gift</span> was founded with a simple vision: to make digital gift cards more accessible and affordable for everyone. We saw a gap in the market where customers were paying full price for digital products that should be more competitive.
              </p>
              <p>
                By working directly with suppliers and leveraging bulk purchasing power, we're able to offer genuine digital gift cards at discounts of up to 35% off retail prices. This means you save money on your favorite brands while still getting instant, secure delivery.
              </p>
              <p>
                Today, we serve <span className="font-semibold text-white">over 10,000 happy customers</span> across multiple countries, delivering <span className="font-semibold text-white">25,000+ gift cards</span> with a <span className="font-semibold text-white">4.9/5 customer satisfaction rating</span>. Our commitment to quality, security, and customer service has made us a trusted name in the digital gift card marketplace.
              </p>
            </div>
          </Card>
        </div>

        {/* Values */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Our core values guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} hover className="p-8 group">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How We're Different */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-white">Why Choose Us?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Genuine digital codes from authorized suppliers',
                'Up to 35% discount on popular brands',
                'Instant email delivery within 2-5 minutes',
                'SSL encrypted secure checkout',
                '24/7 customer support via email',
                'Money-back guarantee on invalid codes',
                'Multiple payment methods accepted',
                'International delivery to 50+ countries',
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Company Info */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-white">Legal & Compliance</h2>
            </div>
            <div className="space-y-4 text-text-secondary">
              <p>
                <span className="font-semibold text-white">Company:</span> Trading Card BSLDIM LTD
              </p>
              <p>
                <span className="font-semibold text-white">Registration:</span> Saint Vincent and the Grenadines
              </p>
              <p>
                <span className="font-semibold text-white">Business Type:</span> Digital Gift Card Marketplace
              </p>
              <p className="text-sm text-text-muted pt-4 border-t border-border">
                <span className="font-semibold">Disclaimer:</span> Lonieve Gift is not affiliated with, endorsed by, or sponsored by any of the brands whose gift cards we sell. All trademarks are property of their respective owners. We are an authorized reseller of digital gift cards.
              </p>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Saving?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Browse our catalog of digital gift cards and start saving up to 35% today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${params.locale}/catalog`}>
                <Button variant="primary" size="lg" className="group">
                  <Gift className="mr-2 w-5 h-5" />
                  Browse Catalog
                </Button>
              </Link>
              <Link href={`/${params.locale}/support`}>
                <Button variant="outline" size="lg">
                  <Mail className="mr-2 w-5 h-5" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

