// Google Analytics 4 integration

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize GA4
export function initGA4() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll send manually
  });
}

// Page view
export function trackPageView(url: string) {
  if (!GA_MEASUREMENT_ID) return;
  window.gtag?.('event', 'page_view', {
    page_location: url,
  });
}

// E-commerce events

export function trackViewItem(product: {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
}) {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag?.('event', 'view_item', {
    currency: product.currency,
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_brand: product.brand,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  quantity?: number;
}) {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag?.('event', 'add_to_cart', {
    currency: product.currency,
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_brand: product.brand,
        price: product.price,
        quantity: product.quantity || 1,
      },
    ],
  });
}

export function trackBeginCheckout(items: any[], total: number, currency: string) {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag?.('event', 'begin_checkout', {
    currency,
    value: total,
    items,
  });
}

export function trackPurchase(transaction: {
  transaction_id: string;
  value: number;
  currency: string;
  items: any[];
}) {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag?.('event', 'purchase', {
    transaction_id: transaction.transaction_id,
    value: transaction.value,
    currency: transaction.currency,
    items: transaction.items,
  });
}

// Custom events
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag?.('event', eventName, eventParams);
}

