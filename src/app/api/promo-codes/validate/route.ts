import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/ratelimit';
import { z } from 'zod';

const validatePromoSchema = z.object({
  code: z.string().min(1),
  productId: z.string().uuid(),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  // 🔒 Rate limiting: Max 20 promo code validations per minute
  const rateLimitResult = await withRateLimit(request, RATE_LIMITS.PROMO_CODES);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { code, productId, amount } = validatePromoSchema.parse(body);
    
    // Get user (optional)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Find promo code
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .single();
    
    if (error || !promo) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired promo code' 
      }, { status: 400 });
    }
    
    // Check dates
    const now = new Date();
    if (promo.start_date && new Date(promo.start_date) > now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Promo code not yet active' 
      }, { status: 400 });
    }
    
    if (promo.end_date && new Date(promo.end_date) < now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Promo code has expired' 
      }, { status: 400 });
    }
    
    // Check total uses
    if (promo.max_uses && promo.total_uses >= promo.max_uses) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Promo code has reached maximum uses' 
      }, { status: 400 });
    }
    
    // Check user-specific uses
    if (user && promo.max_uses_per_user) {
      const { count } = await supabase
        .from('promo_code_uses')
        .select('*', { count: 'exact', head: true })
        .eq('promo_code_id', promo.id)
        .eq('user_id', user.id);
      
      if (count && count >= promo.max_uses_per_user) {
        return NextResponse.json({ 
          valid: false, 
          error: 'You have already used this promo code' 
        }, { status: 400 });
      }
    }
    
    // Check minimum purchase amount
    if (promo.min_purchase_amount && amount < promo.min_purchase_amount) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum purchase amount is $${promo.min_purchase_amount}` 
      }, { status: 400 });
    }
    
    // Check product restrictions
    if (promo.allowed_products && promo.allowed_products.length > 0) {
      if (!promo.allowed_products.includes(productId)) {
        return NextResponse.json({ 
          valid: false, 
          error: 'This promo code is not valid for this product' 
        }, { status: 400 });
      }
    }
    
    // Calculate discount
    let discountAmount = 0;
    
    if (promo.discount_type === 'percentage') {
      discountAmount = (amount * promo.discount_value) / 100;
      if (promo.max_discount_amount) {
        discountAmount = Math.min(discountAmount, promo.max_discount_amount);
      }
    } else if (promo.discount_type === 'fixed') {
      discountAmount = promo.discount_value;
    }
    
    const finalAmount = Math.max(0, amount - discountAmount);
    
    return NextResponse.json({
      valid: true,
      promoCode: promo,
      discount: {
        amount: discountAmount,
        type: promo.discount_type,
        finalAmount
      },
      message: `${promo.discount_type === 'percentage' ? promo.discount_value + '%' : '$' + promo.discount_value} discount applied!`
    });
    
  } catch (error) {
    console.error('Validate promo code error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid request data' 
      }, { status: 400 });
    }
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

