import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/ratelimit';

/**
 * Abandoned Cart Email System
 * 
 * Sends drip sequence:
 * - 1 hour: "You left something behind! 🛒"
 * - 24 hours: "Still interested? Here's 10% OFF!"
 * - 72 hours: "Last chance! 15% OFF expires soon!"
 * 
 * This endpoint should be called by a cron job every hour
 */
export async function POST(request: NextRequest) {
  // 🔒 Rate limiting: Max 5 requests per minute (for cron protection)
  const rateLimitResult = await withRateLimit(request, RATE_LIMITS.EMAIL_CAMPAIGNS);
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const supabase = await createClient();
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    // Find abandoned carts (orders that were created but not completed)
    const { data: abandonedCarts } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .or(`created_at.lt.${oneHourAgo.toISOString()}`);

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No abandoned carts found' 
      });
    }

    const emailsSent = [];

    for (const cart of abandonedCarts) {
      const cartAge = now.getTime() - new Date(cart.created_at).getTime();
      const hoursOld = cartAge / (1000 * 60 * 60);

      let emailType = '';
      let subject = '';
      let discount = 0;

      // Determine which email to send
      if (hoursOld >= 72 && !cart.email_sent_72h) {
        emailType = '72h';
        subject = '🚨 Last Chance! 15% OFF Your Gift Cards';
        discount = 15;
      } else if (hoursOld >= 24 && !cart.email_sent_24h) {
        emailType = '24h';
        subject = '💝 Still Interested? Get 10% OFF Now!';
        discount = 10;
      } else if (hoursOld >= 1 && !cart.email_sent_1h) {
        emailType = '1h';
        subject = '🛒 You Left Something Behind!';
        discount = 0;
      }

      if (emailType) {
        // Here you would integrate with your email service (SendGrid, Resend, etc.)
        const emailData = {
          to: cart.customer_email,
          subject,
          template: 'abandoned-cart',
          data: {
            customerName: cart.customer_name || 'Valued Customer',
            productName: cart.product_name,
            amount: cart.total_amount,
            discount,
            cartUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?order=${cart.id}`,
            promoCode: discount > 0 ? `COMEBACK${discount}` : null,
          },
        };

        // TODO: Send email via your email service
        console.log('Sending abandoned cart email:', emailData);

        // Update email sent status
        await supabase
          .from('orders')
          .update({
            [`email_sent_${emailType}`]: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cart.id);

        emailsSent.push({
          orderId: cart.id,
          email: cart.customer_email,
          type: emailType,
        });
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      details: emailsSent,
    });
  } catch (error) {
    console.error('Abandoned cart email error:', error);
    return NextResponse.json(
      { error: 'Failed to process abandoned carts' },
      { status: 500 }
    );
  }
}

// GET endpoint to test/trigger manually
export async function GET() {
  return POST(new NextRequest('http://localhost:3000/api/emails/abandoned-cart'));
}

