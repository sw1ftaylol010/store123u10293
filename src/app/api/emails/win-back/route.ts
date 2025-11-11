import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Win-Back Campaign for Inactive Users
 * 
 * Targets users who haven't made a purchase in 30+ days
 * Sends personalized emails with special offers to re-engage them
 * 
 * This endpoint should be called by a cron job daily
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Find users who made their last purchase 30+ days ago
    const { data: inactiveUsers } = await supabase
      .from('orders')
      .select('customer_email, customer_name, created_at')
      .eq('status', 'completed')
      .lt('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No inactive users found' 
      });
    }

    // Group by email to get unique users with their last purchase date
    const uniqueUsers = inactiveUsers.reduce((acc, order) => {
      if (!acc[order.customer_email] || 
          new Date(order.created_at) > new Date(acc[order.customer_email].created_at)) {
        acc[order.customer_email] = order;
      }
      return acc;
    }, {} as Record<string, typeof inactiveUsers[0]>);

    // Check if they've already received a win-back email recently
    const { data: sentEmails } = await supabase
      .from('email_log')
      .select('email, sent_at')
      .eq('type', 'win-back')
      .gte('sent_at', thirtyDaysAgo.toISOString());

    const recentlySentEmails = new Set(sentEmails?.map(e => e.email) || []);

    const emailsSent = [];

    for (const [email, userData] of Object.entries(uniqueUsers)) {
      // Skip if email was sent recently
      if (recentlySentEmails.has(email)) {
        continue;
      }

      const daysSinceLastPurchase = Math.floor(
        (now.getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine offer based on inactivity period
      let discount = 15;
      let urgency = 'limited time';
      
      if (daysSinceLastPurchase >= 90) {
        discount = 25; // Extra discount for very inactive users
        urgency = '48 hours only';
      } else if (daysSinceLastPurchase >= 60) {
        discount = 20;
        urgency = '72 hours only';
      }

      // Generate unique promo code
      const promoCode = `COMEBACK${discount}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create promo code in database
      await supabase.from('promo_codes').insert({
        code: promoCode,
        discount_type: 'percentage',
        discount_value: discount,
        status: 'active',
        max_uses: 1,
        user_email: email,
        start_date: now.toISOString(),
        end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        description: `Win-back offer for ${email}`,
      });

      // Here you would integrate with your email service
      const emailData = {
        to: email,
        subject: `🎁 We Miss You! ${discount}% OFF Just For You`,
        template: 'win-back',
        data: {
          customerName: userData.customer_name || 'Valued Customer',
          daysSince: daysSinceLastPurchase,
          discount,
          promoCode,
          urgency,
          shopUrl: `${process.env.NEXT_PUBLIC_SITE_URL}?promo=${promoCode}`,
        },
      };

      // TODO: Send email via your email service
      console.log('Sending win-back email:', emailData);

      // Log sent email
      await supabase.from('email_log').insert({
        email,
        type: 'win-back',
        subject: emailData.subject,
        promo_code: promoCode,
        sent_at: now.toISOString(),
      });

      emailsSent.push({
        email,
        discount,
        promoCode,
        daysSinceLastPurchase,
      });
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      details: emailsSent,
    });
  } catch (error) {
    console.error('Win-back campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to process win-back campaign' },
      { status: 500 }
    );
  }
}

// GET endpoint to test/trigger manually
export async function GET() {
  return POST(new NextRequest('http://localhost:3000/api/emails/win-back'));
}

