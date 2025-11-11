import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Partner API - Statistics endpoint
// Returns partner performance stats

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Verify partner
    const { data: partner, error: partnerError } = await supabase
      .from('partner_accounts')
      .select('*')
      .eq('api_key', apiKey)
      .eq('status', 'active')
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    // Get partner stats
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('partner_id', partner.id)
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
    const totalCommission = orders?.reduce((sum, o) => sum + Number(o.partner_commission || 0), 0) || 0;

    // Get affiliate link stats
    const { data: links } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq('partner_id', partner.id);

    const totalClicks = links?.reduce((sum, l) => sum + Number(l.clicks || 0), 0) || 0;
    const totalConversions = links?.reduce((sum, l) => sum + Number(l.conversions || 0), 0) || 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;

    // Get pending payouts
    const { data: pendingPayouts } = await supabase
      .from('partner_payouts')
      .select('*')
      .eq('partner_id', partner.id)
      .eq('status', 'pending');

    const pendingAmount = pendingPayouts?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.partner_name,
        commission_rate: partner.commission_rate,
      },
      period: {
        start: startDate,
        end: endDate,
      },
      stats: {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        total_commission: totalCommission,
        avg_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        total_clicks: totalClicks,
        total_conversions: totalConversions,
        conversion_rate: conversionRate,
        pending_payout: pendingAmount,
      },
      links: links?.map(l => ({
        code: l.link_code,
        clicks: l.clicks,
        conversions: l.conversions,
        revenue: l.revenue,
        commission: l.commission,
      })) || [],
    });
  } catch (error) {
    console.error('Partner stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

