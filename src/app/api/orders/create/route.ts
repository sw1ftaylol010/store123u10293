import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cardlinkAPI } from '@/lib/cardlink/api';
import { getSessionIdFromCookie, getUtmFromCookie } from '@/lib/analytics/tracking';
import { withRateLimit, RATE_LIMITS } from '@/lib/ratelimit';
import { z } from 'zod';

const orderSchema = z.object({
  email: z.string().email(),
  productId: z.string().uuid(),
  nominal: z.number().positive(),
  price: z.number().positive(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  recipientMessage: z.string().optional(),
  deliveryDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // 🔒 Rate limiting: Max 5 orders per minute per IP
  const rateLimitResult = await withRateLimit(request, RATE_LIMITS.ORDERS);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    const supabase = await createClient();

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Get session_id and UTM from cookies
    const cookieHeader = request.headers.get('cookie');
    const sessionId = getSessionIdFromCookie(cookieHeader);
    const utm = getUtmFromCookie(cookieHeader);
    const referrer = request.headers.get('referer');

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', validatedData.productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // 🔥 CRITICAL: Check stock availability BEFORE creating order
    const { count: availableCodes } = await supabase
      .from('gift_codes')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', validatedData.productId)
      .eq('nominal', validatedData.nominal)
      .eq('status', 'available');

    if (!availableCodes || availableCodes < 1) {
      // Track out of stock event
      await supabase.from('events').insert({
        event_type: 'product_out_of_stock',
        session_id: sessionId,
        user_id: user?.id,
        event_data: {
          product_id: validatedData.productId,
          nominal: validatedData.nominal,
        },
      });

      return NextResponse.json(
        { error: 'Product is out of stock. Please try another denomination or product.' },
        { status: 409 }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id,
        email: validatedData.email,
        recipient_email: validatedData.recipientEmail,
        recipient_name: validatedData.recipientName,
        recipient_message: validatedData.recipientMessage,
        delivery_date: validatedData.deliveryDate,
        total_amount: validatedData.price,
        currency: product.currency,
        status: 'pending',
        session_id: sessionId,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
        referrer: referrer,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order item
    await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        nominal: validatedData.nominal,
        price: validatedData.price,
        discount_percentage: product.discount_percentage,
      });

    // Create Cardlink bill
    const bill = await cardlinkAPI.createBill({
      amount: validatedData.price,
      order_id: order.id,
      description: `${product.brand} Gift Card - ${validatedData.nominal} ${product.currency}`,
      currency_in: product.currency,
      custom: {
        email: validatedData.email,
        product_id: product.id,
      },
    });

    // Save payment record
    await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        provider: 'cardlink',
        bill_id: bill.id,
        payment_url: bill.payment_url,
        status: 'pending',
        amount: validatedData.price,
        currency: product.currency,
        raw_response: bill,
      });

    // Track payment redirect event (server-side)
    await supabase.from('events').insert({
      event_type: 'payment_redirect',
      session_id: sessionId,
      user_id: user?.id,
      event_data: {
        order_id: order.id,
        payment_url: bill.payment_url,
        amount: validatedData.price,
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({
      orderId: order.id,
      paymentUrl: bill.payment_url,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

