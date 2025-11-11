'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Analytics } from '@/lib/analytics/tracking';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function PendingPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  useEffect(() => {
    // Track payment return with pending status
    if (orderId) {
      Analytics.paymentReturn(orderId, 'pending');
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full p-8 text-center space-y-6">
        <div className="text-6xl animate-pulse">⏳</div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-white">
            {t.pending.title}
          </h1>
          <p className="text-text-secondary">
            {t.pending.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href={`/${params.locale}/account`}>
            <Button variant="primary">
              {t.pending.checkStatus}
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
