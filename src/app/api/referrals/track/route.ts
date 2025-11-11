import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  // 🔒 Rate limiting: Max 10 referral tracking per minute
  const rateLimitResult = await withRateLimit(request, RATE_LIMITS.REFERRALS);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const supabase = await createClient();
    const { referralCode } = await request.json();
    
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }
    
    // Find referral
    const { data: referral, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', referralCode)
      .eq('status', 'pending')
      .single();
    
    if (error || !referral) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }
    
    // Increment clicks
    await supabase
      .from('referrals')
      .update({ clicks: referral.clicks + 1 })
      .eq('id', referral.id);
    
    // Store in cookie for later (when user makes first purchase)
    const response = NextResponse.json({
      success: true,
      referrerId: referral.referrer_user_id,
      reward: referral.referee_reward_amount
    });
    
    response.cookies.set('ref_code', referralCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      sameSite: 'lax'
    });
    
    return response;
    
  } catch (error) {
    console.error('Track referral error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

