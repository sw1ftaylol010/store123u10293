// Глубокая E2E аналитика - клиентская библиотека

const SESSION_COOKIE = 'lv_sess';
const VISITOR_COOKIE = 'lv_visitor';
const UTM_COOKIE = 'lv_utm';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const VISITOR_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

interface TrackingData extends UTMParams {
  session_id: string;
  visitor_id: string;
  url: string;
  referrer: string | null;
}

// Генерация уникального ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Работа с cookies
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Получить или создать Session ID
export function getOrCreateSessionId(): string {
  let sessionId = getCookie(SESSION_COOKIE);
  
  if (!sessionId) {
    sessionId = generateId();
    setCookie(SESSION_COOKIE, sessionId, 30);
  }
  
  return sessionId;
}

// Получить или создать Visitor ID
export function getOrCreateVisitorId(): string {
  let visitorId = getCookie(VISITOR_COOKIE);
  
  if (!visitorId) {
    visitorId = generateId();
    setCookie(VISITOR_COOKIE, visitorId, 365);
  }
  
  return visitorId;
}

// Извлечь UTM параметры из URL
function extractUtmFromUrl(): UTMParams {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const utm: UTMParams = {};
  
  const utmKeys: (keyof UTMParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  
  utmKeys.forEach(key => {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
    }
  });
  
  return utm;
}

// Сохранить UTM в cookie (Last Non-Direct Click)
export function captureAndStoreUtm() {
  const utm = extractUtmFromUrl();
  
  // Если есть хотя бы один UTM параметр - сохраняем
  if (Object.keys(utm).length > 0) {
    setCookie(UTM_COOKIE, JSON.stringify(utm), 30);
    return utm;
  }
  
  // Иначе возвращаем сохраненные
  return getStoredUtm();
}

// Получить сохраненные UTM
export function getStoredUtm(): UTMParams {
  const stored = getCookie(UTM_COOKIE);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
}

// Получить полные tracking данные
function getTrackingData(): TrackingData {
  return {
    session_id: getOrCreateSessionId(),
    visitor_id: getOrCreateVisitorId(),
    url: window.location.href,
    referrer: document.referrer || null,
    ...getStoredUtm(),
  };
}

// Стандартные типы событий (tracking plan)
export const EventTypes = {
  // Navigation
  PAGE_VIEW: 'page_view',
  VIEW_CATALOG: 'view_catalog',
  VIEW_PRODUCT: 'view_product',
  
  // Funnel
  CONFIGURATOR_OPEN: 'configurator_open',
  CONFIGURATOR_CHANGE: 'configurator_change',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_SUBMIT: 'checkout_submit',
  PAYMENT_REDIRECT: 'payment_redirect',
  PAYMENT_RETURN: 'payment_return',
  
  // Support
  SUPPORT_OPEN: 'support_open',
  SUPPORT_REQUEST: 'support_request',
  RESEND_EMAIL: 'resend_email_request',
  
  // Account
  ACCOUNT_LOGIN: 'account_login',
  ACCOUNT_REGISTER: 'account_register',
} as const;

// Валидация event_type
const VALID_EVENT_TYPES = new Set<string>(Object.values(EventTypes));

function isValidEventType(eventType: string): boolean {
  return VALID_EVENT_TYPES.has(eventType);
}

// Основная функция трекинга
export function trackEvent(
  eventType: string,
  data: Record<string, any> = {}
): void {
  if (typeof window === 'undefined') return;
  
  // Валидация event_type
  if (!isValidEventType(eventType)) {
    console.warn(`[Analytics] Invalid event_type: ${eventType}`);
    return;
  }
  
  try {
    const trackingData = getTrackingData();
    
    const payload = {
      event_type: eventType,
      ...trackingData,
      data,
      timestamp: new Date().toISOString(),
    };
    
    // Используем sendBeacon для надежности
    const success = navigator.sendBeacon(
      '/api/events',
      JSON.stringify(payload)
    );
    
    // Fallback на fetch если sendBeacon не сработал
    if (!success) {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(err => {
        console.error('[Analytics] Failed to track event:', err);
      });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

// Автоматический page view tracking
export function initPageViewTracking() {
  if (typeof window === 'undefined') return;
  
  // Capture UTM при первой загрузке
  captureAndStoreUtm();
  
  // Track initial page view
  trackEvent(EventTypes.PAGE_VIEW);
  
  // Track page views on route changes (для Next.js)
  let lastUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      trackEvent(EventTypes.PAGE_VIEW);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Хелперы для частых событий
export const Analytics = {
  // Page views
  pageView: () => trackEvent(EventTypes.PAGE_VIEW),
  
  // Product views
  viewCatalog: (filters?: Record<string, any>) => 
    trackEvent(EventTypes.VIEW_CATALOG, { filters }),
  
  viewProduct: (productId: string, brand: string, region: string) => 
    trackEvent(EventTypes.VIEW_PRODUCT, { product_id: productId, brand, region }),
  
  // Configurator
  configuratorOpen: (productId: string) => 
    trackEvent(EventTypes.CONFIGURATOR_OPEN, { product_id: productId }),
  
  configuratorChange: (productId: string, nominal: number, mode: 'self' | 'gift') =>
    trackEvent(EventTypes.CONFIGURATOR_CHANGE, { product_id: productId, nominal, mode }),
  
  // Checkout
  addToCart: (productId: string, nominal: number, price: number) =>
    trackEvent(EventTypes.ADD_TO_CART, { product_id: productId, nominal, price }),
  
  checkoutStart: () => 
    trackEvent(EventTypes.CHECKOUT_START),
  
  checkoutSubmit: (orderId: string, totalAmount: number) =>
    trackEvent(EventTypes.CHECKOUT_SUBMIT, { order_id: orderId, total_amount: totalAmount }),
  
  paymentRedirect: (orderId: string, paymentUrl: string) =>
    trackEvent(EventTypes.PAYMENT_REDIRECT, { order_id: orderId, payment_url: paymentUrl }),
  
  paymentReturn: (orderId: string, status: string) =>
    trackEvent(EventTypes.PAYMENT_RETURN, { order_id: orderId, status }),
  
  // Support
  supportOpen: () => 
    trackEvent(EventTypes.SUPPORT_OPEN),
  
  resendEmail: (orderId: string) =>
    trackEvent(EventTypes.RESEND_EMAIL, { order_id: orderId }),
  
  // Account
  accountLogin: (userId: string) =>
    trackEvent(EventTypes.ACCOUNT_LOGIN, { user_id: userId }),
};

// Экспорт для server-side tracking
export function getSessionIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const match = cookieHeader.match(new RegExp('(^| )' + SESSION_COOKIE + '=([^;]+)'));
  return match ? match[2] : null;
}

export function getUtmFromCookie(cookieHeader: string | null): UTMParams {
  if (!cookieHeader) return {};
  
  const match = cookieHeader.match(new RegExp('(^| )' + UTM_COOKIE + '=([^;]+)'));
  if (!match) return {};
  
  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return {};
  }
}

