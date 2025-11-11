// Meta (Facebook) Pixel integration

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function initMetaPixel() {
  if (typeof window === 'undefined' || !META_PIXEL_ID) return;

  (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  window.fbq?.('init', META_PIXEL_ID);
  window.fbq?.('track', 'PageView');
}

export function trackMetaPageView() {
  if (!META_PIXEL_ID) return;
  window.fbq?.('track', 'PageView');
}

export function trackMetaViewContent(params: {
  content_name: string;
  content_category: string;
  content_ids: string[];
  value: number;
  currency: string;
}) {
  if (!META_PIXEL_ID) return;
  window.fbq?.('track', 'ViewContent', params);
}

export function trackMetaAddToCart(params: {
  content_name: string;
  content_ids: string[];
  value: number;
  currency: string;
}) {
  if (!META_PIXEL_ID) return;
  window.fbq?.('track', 'AddToCart', params);
}

export function trackMetaInitiateCheckout(params: {
  value: number;
  currency: string;
  content_ids: string[];
}) {
  if (!META_PIXEL_ID) return;
  window.fbq?.('track', 'InitiateCheckout', params);
}

export function trackMetaPurchase(params: {
  value: number;
  currency: string;
  content_ids: string[];
  content_type?: string;
}) {
  if (!META_PIXEL_ID) return;
  window.fbq?.('track', 'Purchase', params);
}

