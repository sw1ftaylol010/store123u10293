import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/ratelimit';
import { z } from 'zod';

// 🔒 SECURITY: Whitelist of allowed event types
const ALLOWED_EVENT_TYPES = [
  // Navigation
  'page_view',
  'view_catalog',
  'view_product',
  
  // Purchase funnel
  'configurator_open',
  'configurator_change',
  'add_to_cart',
  'checkout_start',
  'checkout_submit',
  'payment_redirect',
  'payment_return',
  'payment_success',
  'code_sent',
  
  // Support & Account
  'support_open',
  'support_request',
  'resend_email_request',
  'account_login',
  
  // Admin events
  'product_out_of_stock',
] as const;

// Валидация payload
const eventSchema = z.object({
  event_type: z.enum(ALLOWED_EVENT_TYPES, {
    errorMap: () => ({ message: 'Invalid event type' })
  }),
  session_id: z.string().min(1),
  visitor_id: z.string().optional(),
  url: z.string().optional(),
  referrer: z.string().nullable().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  data: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // 🔒 Rate limiting: Max 100 events per minute per IP
  const rateLimitResult = await withRateLimit(request, RATE_LIMITS.EVENTS);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await request.json();
    
    // Валидация
    const validatedData = eventSchema.parse(body);
    
    const supabase = await createClient();
    
    // Получаем user_id если авторизован
    const { data: { user } } = await supabase.auth.getUser();
    
    // Вставляем событие
    const { error } = await supabase.from('events').insert({
      event_type: validatedData.event_type,
      session_id: validatedData.session_id,
      user_id: user?.id,
      visitor_id: validatedData.visitor_id,
      url: validatedData.url,
      referrer: validatedData.referrer,
      utm_source: validatedData.utm_source,
      utm_medium: validatedData.utm_medium,
      utm_campaign: validatedData.utm_campaign,
      utm_content: validatedData.utm_content,
      utm_term: validatedData.utm_term,
      event_data: validatedData.data,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });
    
    if (error) {
      console.error('Failed to insert event:', error);
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Event tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
