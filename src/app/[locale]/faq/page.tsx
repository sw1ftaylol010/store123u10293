'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { 
  Search, ChevronDown, ChevronUp, 
  CreditCard, Zap, RefreshCw, User,
  Mail, HelpCircle, ExternalLink
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Payment
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards through our secure payment provider Cardlink. Your card details are never stored on our servers and all transactions are SSL encrypted.',
  },
  {
    category: 'Payment',
    question: 'Is my payment secure?',
    answer: 'Yes! We use industry-standard SSL encryption and work with Cardlink, a trusted payment processor. We never store your card details and all transactions are fully secured.',
  },
  {
    category: 'Payment',
    question: 'Will I receive a receipt?',
    answer: 'Yes, you will receive an email receipt immediately after your purchase is completed. The receipt includes your order number, purchased items, and payment details.',
  },
  {
    category: 'Payment',
    question: 'Can I use cryptocurrency?',
    answer: 'Currently, we only accept credit and debit cards. We are exploring cryptocurrency options for the future.',
  },
  
  // Delivery
  {
    category: 'Delivery',
    question: 'How fast will I receive my gift card?',
    answer: 'Your digital gift card will be delivered to your email within 2-5 minutes after successful payment. Most orders are processed instantly.',
  },
  {
    category: 'Delivery',
    question: 'What if I don\'t receive my code?',
    answer: 'First, check your spam/junk folder. If you still don\'t see it after 10 minutes, contact our support team with your order number and we\'ll resend it immediately.',
  },
  {
    category: 'Delivery',
    question: 'Can I send the gift card to someone else?',
    answer: 'Yes! During checkout, you can choose the "Gift" option and enter the recipient\'s email address. You can also add a personal message and schedule the delivery date.',
  },
  {
    category: 'Delivery',
    question: 'Can I buy multiple gift cards at once?',
    answer: 'Yes, you can purchase multiple gift cards in a single order. Simply select your desired products and proceed to checkout.',
  },

  // Refund & Returns
  {
    category: 'Refund',
    question: 'What is your refund policy?',
    answer: 'All sales are final once the digital code has been delivered to your email. This is standard for digital products. However, if you receive an invalid or already-used code, please contact us immediately and we\'ll resolve the issue.',
  },
  {
    category: 'Refund',
    question: 'What if my code doesn\'t work?',
    answer: 'If your code doesn\'t work, please contact our support team immediately with your order number and the error message you received. We\'ll investigate and provide a replacement or refund if the code is indeed invalid.',
  },
  {
    category: 'Refund',
    question: 'Can I cancel my order?',
    answer: 'Orders can only be cancelled before the code is delivered. Since delivery is instant (within 2-5 minutes), cancellations are not possible in most cases. Please contact support immediately if you need assistance.',
  },

  // Account
  {
    category: 'Account',
    question: 'Do I need an account to purchase?',
    answer: 'No, you can checkout as a guest. However, creating an account allows you to view your order history, save favorite products, and checkout faster on future purchases.',
  },
  {
    category: 'Account',
    question: 'How do I track my orders?',
    answer: 'If you have an account, log in and go to "My Account" to view all your orders. You\'ll also receive email confirmations with order details for every purchase.',
  },
  {
    category: 'Account',
    question: 'Can I change my email address?',
    answer: 'Yes, log in to your account, go to Settings, and update your email address. You\'ll need to verify the new email before it becomes active.',
  },
  {
    category: 'Account',
    question: 'I forgot my password, what should I do?',
    answer: 'Click on "Forgot Password" on the login page, enter your email, and we\'ll send you a password reset link immediately.',
  },

  // Products
  {
    category: 'Products',
    question: 'What gift cards do you offer?',
    answer: 'We offer digital gift cards for popular brands including Amazon, Apple, Google Play, PlayStation, Steam, Netflix, and many more. Browse our catalog to see all available options.',
  },
  {
    category: 'Products',
    question: 'Why are your prices lower?',
    answer: 'We work directly with suppliers and buy in bulk, allowing us to offer discounts of up to 35% off retail prices. These savings are passed directly to you.',
  },
  {
    category: 'Products',
    question: 'Are the gift cards region-specific?',
    answer: 'Yes, some gift cards are region-specific. Each product page clearly indicates which regions the card is valid for (US, EU, UK, etc.). Make sure to select the correct region for your needs.',
  },
  {
    category: 'Products',
    question: 'Do gift cards expire?',
    answer: 'Expiration policies vary by brand. Most gift cards do not expire, but some may have expiration dates. Check the specific product page or the terms provided with your code.',
  },

  // Support
  {
    category: 'Support',
    question: 'How can I contact customer support?',
    answer: 'You can reach us via email at support@lonievegift.com or use the contact form on our Support page. We typically respond within 24 hours.',
  },
  {
    category: 'Support',
    question: 'What are your support hours?',
    answer: 'Our support team is available 24/7 via email. We aim to respond to all inquiries within 24 hours, but most are answered much faster.',
  },
  {
    category: 'Support',
    question: 'Do you offer phone support?',
    answer: 'Currently, we only offer email support to ensure we can provide detailed assistance and maintain records of all communications.',
  },
];

const categories = [
  { name: 'All', icon: HelpCircle, color: 'from-blue-500 to-cyan-500' },
  { name: 'Payment', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
  { name: 'Delivery', icon: Zap, color: 'from-yellow-500 to-orange-500' },
  { name: 'Refund', icon: RefreshCw, color: 'from-red-500 to-pink-500' },
  { name: 'Account', icon: User, color: 'from-purple-500 to-pink-500' },
  { name: 'Products', icon: HelpCircle, color: 'from-indigo-500 to-blue-500' },
  { name: 'Support', icon: Mail, color: 'from-teal-500 to-cyan-500' },
];

export default function FAQPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary/20 rounded-full mb-4">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help Center</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Find answers to common questions about our gift card marketplace
            </p>
          </div>

          {/* Search */}
          <Card className="p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background-lighter border border-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </Card>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-background-card text-text-secondary hover:bg-background-lighter hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  <span className="text-xs opacity-75">
                    ({faqs.filter(f => category.name === 'All' || f.category === category.name).length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* FAQ List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                const category = categories.find(c => c.name === faq.category);
                const Icon = category?.icon || HelpCircle;

                return (
                  <Card key={index} className="overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full p-6 flex items-start gap-4 text-left hover:bg-background-lighter transition-colors"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${category?.color} text-white flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary transition-colors">
                          {faq.question}
                        </h3>
                        <span className="text-xs text-text-secondary">{faq.category}</span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <div className="pl-14">
                          <p className="text-text-secondary leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Search className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-text-secondary mb-6">
                Try adjusting your search or browse all questions
              </p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Clear Search
              </Button>
            </Card>
          )}

          {/* Still Have Questions CTA */}
          <Card className="p-8 mt-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 text-center">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Still Have Questions?
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Can't find what you're looking for? Our support team is here to help 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${params.locale}/support`}>
                <Button variant="primary" size="lg" className="group">
                  <Mail className="mr-2 w-5 h-5" />
                  Contact Support
                  <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={`/${params.locale}/catalog`}>
                <Button variant="outline" size="lg">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

