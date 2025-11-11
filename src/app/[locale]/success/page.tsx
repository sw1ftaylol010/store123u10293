'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Analytics } from '@/lib/analytics/tracking';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function SuccessPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const orderId = searchParams.get('order_id');
  
  useEffect(() => {
    // Track payment return with success status
    if (orderId) {
      Analytics.paymentReturn(orderId, 'success');
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full p-8 text-center space-y-6">
        <div className="text-6xl">✓</div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-white">
            {t.success.title}
          </h1>
          {email && (
            <p className="text-text-secondary">
              {t.success.subtitle} <span className="text-primary">{email}</span>
            </p>
          )}
        </div>

        <p className="text-text-secondary">
          {t.success.checkEmail}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href={`/${params.locale}/account`}>
            <Button variant="primary">
              {t.success.viewOrder}
            </Button>
          </Link>
          <Link href={`/${params.locale}/catalog`}>
            <Button variant="outline">
              {t.success.backToCatalog}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
