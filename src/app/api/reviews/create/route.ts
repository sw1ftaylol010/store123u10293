import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/ratelimit';
import { z } from 'zod';

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  orderItemId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200).optional(),
  comment: z.string().min(10).max(2000),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  // 🔒 Rate limiting: Max 10 reviews per minute
  const rateLimitResult = await withRateLimit(request, RATE_LIMITS.REVIEWS);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const supabase = await createClient();
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);
    
    // Check if user already reviewed this product
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', validatedData.productId)
      .single();
    
    if (existing) {
      return NextResponse.json({ 
        error: 'You have already reviewed this product' 
      }, { status: 400 });
    }
    
    // Check if this is a verified purchase
    let isVerified = false;
    if (validatedData.orderId) {
      const { data: order } = await supabase
        .from('orders')
        .select('id, email')
        .eq('id', validatedData.orderId)
        .eq('status', 'paid')
        .single();
      
      if (order && order.email === user.email) {
        isVerified = true;
      }
    }
    
    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        email: user.email || '',
        name: validatedData.name,
        product_id: validatedData.productId,
        order_id: validatedData.orderId,
        order_item_id: validatedData.orderItemId,
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        is_verified_purchase: isVerified,
        status: 'pending', // Will be reviewed by admin
        reward_points: 50, // Base reward for review
      })
      .select()
      .single();
    
    if (reviewError) {
      throw reviewError;
    }
    
    // Add reward points to user (you can create a points system later)
    // For now, we'll track it in the review
    
    // Track achievement progress
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    // Update achievement progress
    if (reviewCount === 1) {
      // First review achievement
      await supabase
        .from('user_achievements')
        .upsert({
          user_id: user.id,
          achievement_id: (await supabase
            .from('achievements')
            .select('id')
            .eq('key', 'reviewer')
            .single()
          ).data?.id,
          progress: 1,
          completed: true,
          completed_at: new Date().toISOString(),
        });
    }
    
    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully! It will be published after moderation.',
      rewardPoints: 50
    });
    
  } catch (error) {
    console.error('Create review error:', error);
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

