export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

export const currencies = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  MXN: { symbol: '$', name: 'Mexican Peso' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  ARS: { symbol: '$', name: 'Argentine Peso' },
  COP: { symbol: '$', name: 'Colombian Peso' },
} as const;

export type Currency = keyof typeof currencies;

export const defaultCurrency: Currency = 'USD';

// Region to currency mapping
export const regionToCurrency: Record<string, Currency> = {
  USA: 'USD',
  EU: 'EUR',
  LATAM: 'USD',
  Mexico: 'MXN',
  Brazil: 'BRL',
  Argentina: 'ARS',
  Colombia: 'COP',
};

// Locale to currency mapping
export const localeToCurrency: Record<Locale, Currency> = {
  en: 'USD',
  es: 'USD',
};

