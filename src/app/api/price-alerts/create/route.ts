import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/ratelimit';
import { z } from 'zod';

const createAlertSchema = z.object({
  productId: z.string().uuid(),
  email: z.string().email(),
  targetDiscountPercentage: z.number().int().min(1).max(100).optional(),
  targetPrice: z.number().positive().optional(),
});

export async function POST(request: NextRequest) {
  // 🔒 Rate limiting: Max 15 price alerts per minute
  const rateLimitResult = await withRateLimit(request, RATE_LIMITS.PRICE_ALERTS);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const validatedData = createAlertSchema.parse(body);

    // Get user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, brand')
      .eq('id', validatedData.productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if alert already exists
    const { data: existing } = await supabase
      .from('price_alerts')
      .select('id')
      .eq('product_id', validatedData.productId)
      .eq('email', validatedData.email)
      .eq('status', 'active')
      .single();

    if (existing) {
      return NextResponse.json({ 
        error: 'You already have an active alert for this product' 
      }, { status: 400 });
    }

    // Create alert
    const { data: alert, error: alertError } = await supabase
      .from('price_alerts')
      .insert({
        user_id: user?.id,
        email: validatedData.email,
        product_id: validatedData.productId,
        target_discount_percentage: validatedData.targetDiscountPercentage,
        target_price: validatedData.targetPrice,
        status: 'active',
      })
      .select()
      .single();

    if (alertError) {
      throw alertError;
    }

    return NextResponse.json({
      success: true,
      alert,
      message: 'Price alert created successfully',
    });

  } catch (error) {
    console.error('Create price alert error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

