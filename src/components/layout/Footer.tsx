import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { 
  Gift, Mail, Phone, MapPin, Facebook, Twitter, 
  Instagram, Youtube, Shield, CreditCard, Lock,
  HelpCircle, FileText, BookOpen, User, ShoppingBag
} from 'lucide-react';

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const t = getTranslations(locale);

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background-secondary to-background-darker">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Gift className="w-8 h-8 text-primary" />
              <div className="text-2xl font-display font-bold">
                <span className="text-primary">Lonieve</span>
                <span className="text-text-primary"> Gift</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary max-w-sm">
              Premium digital gift cards with instant delivery. Save up to 35% on your favorite brands.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 pt-4">
              <a href="mailto:support@lonievegift.com" className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                <span>support@lonievegift.com</span>
              </a>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span>Trading Card BSLDIM LTD, St. Vincent</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3 pt-4">
              <a 
                href="#" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-primary hover:scale-110 transition-all text-text-secondary hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-primary hover:scale-110 transition-all text-text-secondary hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-primary hover:scale-110 transition-all text-text-secondary hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-primary hover:scale-110 transition-all text-text-secondary hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/catalog`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  All Products
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/catalog?category=Gaming`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  Gaming
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/catalog?category=Entertainment`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  Entertainment
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/catalog?category=Shopping`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  Shopping
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              {t.nav.support}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/faq`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  {t.footer.faq}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/support`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/account`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <User className="w-3 h-3" />
                  My Account
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#how-it-works`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <BookOpen className="w-3 h-3" />
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/terms`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/refund`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  {t.footer.refund}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-text-secondary group-hover:bg-primary transition-colors" />
                  {t.footer.about}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Trust Badges */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Lock className="w-4 h-4 text-green-500" />
                <span>Safe Payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Multiple Payment Methods</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-text-secondary">
            {t.footer.copyright}
          </p>
          <p className="text-center text-xs text-text-muted mt-2">
            All trademarks are property of their respective owners. Lonieve Gift is not affiliated with any brand.
          </p>
        </div>
      </div>
    </footer>
  );
}

