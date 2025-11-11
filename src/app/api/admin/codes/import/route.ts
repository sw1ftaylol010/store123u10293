import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { codes } = await request.json();

    if (!Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid codes data' },
        { status: 400 }
      );
    }

    // Insert codes
    const { data, error } = await supabase
      .from('gift_codes')
      .insert(
        codes.map((code: any) => ({
          product_id: code.product_id,
          code: code.code,
          nominal: parseFloat(code.nominal),
          status: 'available',
          expires_at: code.expires_at || null,
        }))
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, count: codes.length });
  } catch (error) {
    console.error('Import codes error:', error);
    return NextResponse.json(
      { error: 'Failed to import codes' },
      { status: 500 }
    );
  }
}

