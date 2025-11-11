'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Home, Grid3x3, HelpCircle, User, Menu, X, Globe, ChevronDown } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { locales, localeNames } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';

interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const t = getTranslations(locale);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Gift className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="text-2xl font-display font-bold">
              <span className="text-primary">Lonieve</span>
              <span className="text-text-primary"> Gift</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href={`/${locale}`}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-all group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {t.nav.home}
            </Link>
            <Link 
              href={`/${locale}/catalog`}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-all group"
            >
              <Grid3x3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {t.nav.catalog}
            </Link>
            <Link 
              href={`/${locale}#how-it-works`}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-all group"
            >
              <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {t.nav.howItWorks}
            </Link>
            <Link 
              href={`/${locale}/support`}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-all group"
            >
              <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {t.nav.support}
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary transition-colors uppercase">
                <Globe className="w-4 h-4" />
                {locale}
                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {locales.map((l) => (
                  <Link
                    key={l}
                    href={`/${l}`}
                    className={`block px-4 py-2 text-sm hover:bg-background-hover transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      l === locale ? 'text-primary font-medium' : 'text-text-secondary'
                    }`}
                  >
                    {localeNames[l]}
                  </Link>
                ))}
              </div>
            </div>

            {/* Account */}
            <Link
              href={`/${locale}/account`}
              className="hidden md:inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-text-primary hover:text-primary border border-border rounded-lg hover:border-primary/50 hover:bg-primary-50 hover:shadow-md transition-all group"
            >
              <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {t.nav.account}
            </Link>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-border">
                <nav className="flex flex-col space-y-2">
                  <Link 
                    href={`/${locale}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-background-hover rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    {t.nav.home}
                  </Link>
                  <Link 
                    href={`/${locale}/catalog`}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-background-hover rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Grid3x3 className="w-5 h-5" />
                    {t.nav.catalog}
                  </Link>
                  <Link 
                    href={`/${locale}#how-it-works`}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-background-hover rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle className="w-5 h-5" />
                    {t.nav.howItWorks}
                  </Link>
                  <Link 
                    href={`/${locale}/support`}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-background-hover rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle className="w-5 h-5" />
                    {t.nav.support}
                  </Link>
                  <Link 
                    href={`/${locale}/account`}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-background-hover rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    {t.nav.account}
                  </Link>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

