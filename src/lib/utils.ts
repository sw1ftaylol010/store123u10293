import { type ClassValue, clsx } from 'clsx';
import type { Currency } from './i18n/config';
import { currencies } from './i18n/config';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  const currencyInfo = currencies[currency];
  
  if (currency === 'USD' || currency === 'MXN' || currency === 'ARS' || currency === 'COP') {
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }
  
  if (currency === 'EUR') {
    return `${amount.toFixed(2)}${currencyInfo.symbol}`;
  }
  
  if (currency === 'BRL') {
    return `${currencyInfo.symbol} ${amount.toFixed(2)}`;
  }
  
  return `${currencyInfo.symbol}${amount.toFixed(2)}`;
}

export function calculateDiscountedPrice(nominal: number, discountPercentage: number): number {
  return nominal * (1 - discountPercentage / 100);
}

export function maskCode(code: string): string {
  if (code.length <= 8) {
    return '*'.repeat(code.length - 4) + code.slice(-4);
  }
  return code.slice(0, 4) + '*'.repeat(code.length - 8) + code.slice(-4);
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

export async function trackEvent(
  eventType: string,
  eventData?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        event_data: eventData,
        session_id: getSessionId(),
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

