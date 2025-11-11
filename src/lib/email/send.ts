import { createClient } from '@/lib/supabase/server';
import { generateOrderConfirmationEmail, generateGiftEmail } from './templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions) {
  // Using Supabase's built-in email functionality
  // For production, integrate with Mailgun, SES, or other email service
  
  // This is a placeholder - implement based on your email provider
  console.log('Sending email:', {
    to: options.to,
    subject: options.subject,
  });

  // Example with fetch to an email service:
  /*
  await fetch('https://api.mailgun.net/v3/your-domain/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      from: 'Lonieve Gift <noreply@lonievegift.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });
  */
}

export async function sendOrderConfirmation(orderId: string) {
  const supabase = await createClient();

  // Fetch order with items and codes
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (brand, currency),
        gift_codes:assigned_code_id (code)
      )
    `)
    .eq('id', orderId)
    .single();

  if (!order) {
    throw new Error('Order not found');
  }

  const items = order.order_items.map((item: any) => ({
    brand: item.products.brand,
    nominal: item.nominal,
    code: item.gift_codes?.code || 'N/A',
    currency: order.currency,
  }));

  const emailHtml = generateOrderConfirmationEmail({
    orderNumber: order.id.slice(0, 8),
    customerEmail: order.email,
    items,
    totalAmount: order.total_amount,
    currency: order.currency,
  });

  await sendEmail({
    to: order.email,
    subject: `Your Lonieve Gift Order #${order.id.slice(0, 8)}`,
    html: emailHtml,
  });

  // If it's a gift, send separate email to recipient
  if (order.recipient_email) {
    const giftEmailHtml = generateGiftEmail({
      orderNumber: order.id.slice(0, 8),
      customerEmail: order.email,
      recipientName: order.recipient_name,
      message: order.recipient_message,
      items,
      totalAmount: order.total_amount,
      currency: order.currency,
    });

    await sendEmail({
      to: order.recipient_email,
      subject: '🎁 You received a gift card!',
      html: giftEmailHtml,
    });
  }
}

