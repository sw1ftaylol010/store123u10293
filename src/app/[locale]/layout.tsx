import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import type { Locale } from '@/lib/i18n/config';
import { locales } from '@/lib/i18n/config';

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  return (
    <AnalyticsProvider>
      <div className="flex min-h-screen flex-col">
        <Header locale={params.locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={params.locale} />
      </div>
    </AnalyticsProvider>
  );
}

