'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPageViewTracking, Analytics } from '@/lib/analytics/tracking';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize page view tracking
    initPageViewTracking();
  }, []);

  useEffect(() => {
    // Track page view on route change
    Analytics.pageView();
  }, [pathname, searchParams]);

  return <>{children}</>;
}

