import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createReferralSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = createReferralSchema.parse(body);
    
    // Check if user already has a referral code
    const { data: existing } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_user_id', user.id)
      .single();
    
    if (existing) {
      return NextResponse.json({
        success: true,
        referralCode: existing.referral_code,
        message: 'Referral code already exists'
      });
    }
    
    // Generate unique referral code
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_referral_code', { user_email: validatedData.email });
    
    if (codeError) {
      throw new Error('Failed to generate referral code');
    }
    
    // Create referral
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_user_id: user.id,
        referrer_email: validatedData.email,
        referral_code: codeData,
        referrer_reward_amount: 5.00, // $5 reward
        referee_reward_amount: 5.00,
      })
      .select()
      .single();
    
    if (referralError) {
      throw referralError;
    }
    
    return NextResponse.json({
      success: true,
      referralCode: referral.referral_code,
      referralUrl: `${process.env.NEXT_PUBLIC_SITE_URL}?ref=${referral.referral_code}`,
      message: 'Referral code created successfully'
    });
    
  } catch (error) {
    console.error('Create referral error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

