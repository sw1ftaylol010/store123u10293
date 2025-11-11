import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cardlinkAPI } from '@/lib/cardlink/api';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  let body: any;

  try {
    body = await request.json();
    
    // Log webhook request
    const { data: webhookLog } = await supabase
      .from('webhook_logs')
      .insert({
        provider: 'cardlink',
        event_type: body.event || 'payment_notification',
        bill_id: body.bill_id,
        order_id: body.order_id,
        status: body.status,
        request_body: body,
        processed: false,
      })
      .select()
      .single();

    // Verify signature (MANDATORY for security)
    const signature = request.headers.get('x-signature');
    if (!signature) {
      await supabase
        .from('webhook_logs')
        .update({ error: 'Missing signature', response_status: 401 })
        .eq('id', webhookLog?.id);
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }
    
    if (!cardlinkAPI.verifyPostbackSignature(signature, body)) {
      await supabase
        .from('webhook_logs')
        .update({ error: 'Invalid signature', response_status: 401 })
        .eq('id', webhookLog?.id);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { bill_id, status, order_id } = body;

    // Check idempotency - have we already processed this webhook?
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('bill_id', bill_id)
      .single();

    if (!existingPayment) {
      await supabase
        .from('webhook_logs')
        .update({ error: 'Payment not found', response_status: 404, processed: true })
        .eq('bill_id', bill_id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // If already processed, return success (idempotency)
    if (existingPayment.processed_at) {
      await supabase
        .from('webhook_logs')
        .update({ 
          processed: true, 
          response_status: 200,
          error: 'Already processed (idempotent)'
        })
        .eq('bill_id', bill_id);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // Update payment status with idempotency key
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: status === 'PAID' ? 'paid' : 'failed',
        updated_at: new Date().toISOString(),
        paid_at: status === 'PAID' ? new Date().toISOString() : null,
        processed_at: new Date().toISOString(),
        idempotency_key: `${bill_id}_${status}_${Date.now()}`,
        raw_response: body,
      })
      .eq('bill_id', bill_id)
      .eq('processed_at', null) // Only update if not yet processed (race condition protection)
      .select()
      .single();

    if (paymentError || !payment) {
      // Another process already updated it
      await supabase
        .from('webhook_logs')
        .update({ 
          processed: true, 
          response_status: 200,
          error: 'Concurrent processing detected'
        })
        .eq('bill_id', bill_id);
      return NextResponse.json({ success: true, message: 'Concurrent processing' });
    }

        // If paid, process the order
        if (status === 'PAID') {
          // Update order status
          const { data: updatedOrder } = await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', payment.order_id)
            .select()
            .single();
          
          // Track payment success event (server-side)
          if (updatedOrder) {
            await supabase.from('events').insert({
              event_type: 'payment_success',
              session_id: updatedOrder.session_id,
              user_id: updatedOrder.user_id,
              event_data: {
                order_id: payment.order_id,
                amount: updatedOrder.total_amount,
                currency: updatedOrder.currency,
                bill_id: bill_id,
              },
            });
          }

      // Get order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .eq('order_id', payment.order_id);

      let allCodesAssigned = true;

      // Assign gift codes with transaction-like behavior
      for (const item of orderItems || []) {
        // Use UPDATE with WHERE status='available' to prevent race conditions
        const { data: updatedCodes } = await supabase
          .from('gift_codes')
          .update({
            status: 'sold',
            order_item_id: item.id,
            used_at: new Date().toISOString(),
          })
          .eq('product_id', item.product_id)
          .eq('nominal', item.nominal)
          .eq('status', 'available')
          .is('order_item_id', null)
          .limit(1)
          .select()
          .single();

        if (updatedCodes) {
          // Update order item with assigned code
          await supabase
            .from('order_items')
            .update({ assigned_code_id: updatedCodes.id })
            .eq('id', item.id);
        } else {
          // No code available!
          allCodesAssigned = false;
          
          // Create critical alert
          await supabase
            .from('system_notifications')
            .insert({
              type: 'low_stock',
              severity: 'critical',
              title: 'No Codes Available for Paid Order',
              message: `Order ${payment.order_id} is paid but no codes available for product ${item.product_id} (nominal: ${item.nominal})`,
              related_entity_type: 'order',
              related_entity_id: payment.order_id,
            });
        }
      }

      // If not all codes assigned, mark order for manual review
      if (!allCodesAssigned) {
        await supabase
          .from('orders')
          .update({ status: 'manual_review', email_status: 'pending' })
          .eq('id', payment.order_id);
        
        await supabase
          .from('webhook_logs')
          .update({ 
            processed: true, 
            response_status: 200,
            error: 'Incomplete: some codes not available'
          })
          .eq('bill_id', bill_id);

        return NextResponse.json({ 
          success: true, 
          warning: 'Order requires manual review - codes not available' 
        });
      }

          // Send email with codes
          try {
            const { sendOrderConfirmation } = await import('@/lib/email/send');
            await sendOrderConfirmation(payment.order_id);

            // Mark email as sent
            const { data: orderForEvent } = await supabase
              .from('orders')
              .update({
                email_status: 'sent',
                email_sent_at: new Date().toISOString()
              })
              .eq('id', payment.order_id)
              .select()
              .single();
            
            // Track code_sent event (server-side)
            if (orderForEvent) {
              await supabase.from('events').insert({
                event_type: 'code_sent',
                session_id: orderForEvent.session_id,
                user_id: orderForEvent.user_id,
                event_data: {
                  order_id: payment.order_id,
                  codes_count: orderItems?.length || 0,
                },
              });
            }

            // 🔒 LOG DELIVERY PROOF - For legal protection
            // Store: date, IP, email, transaction_id, SHA-256 hash
            const clientIp = request.headers.get('x-forwarded-for') || 
                            request.headers.get('x-real-ip') || 
                            'unknown';
            const userAgent = request.headers.get('user-agent') || 'unknown';

            // 🚀 OPTIMIZED: Batch fetch all codes (fix N+1 query)
            const codeIds = orderItems
              ?.map(item => item.assigned_code_id)
              .filter(Boolean) || [];

            const { data: allCodes } = await supabase
              .from('gift_codes')
              .select('id, code')
              .in('id', codeIds);

            const codeMap = new Map(
              allCodes?.map(c => [c.id, c.code]) || []
            );

            // Log each delivered code
            for (const item of orderItems || []) {
              if (item.assigned_code_id) {
                const code = codeMap.get(item.assigned_code_id);
                
                if (code) {
                  // Call log_code_delivery function
                  await supabase.rpc('log_code_delivery', {
                    p_order_id: payment.order_id,
                    p_order_item_id: item.id,
                    p_transaction_id: bill_id,
                    p_customer_email: orderForEvent?.email || 'unknown',
                    p_customer_ip: clientIp,
                    p_code: code,
                    p_code_id: item.assigned_code_id,
                    p_email_message_id: null, // Can be populated if using external email service
                    p_email_provider: 'supabase',
                    p_user_agent: userAgent,
                  });
                }
              }
            }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        
        // Mark email as failed
        await supabase
          .from('orders')
          .update({ 
            email_status: 'failed',
            email_retry_count: 0
          })
          .eq('id', payment.order_id);

        // Create alert
        await supabase
          .from('system_notifications')
          .insert({
            type: 'email_failed',
            severity: 'critical',
            title: 'Email Delivery Failed',
            message: `Failed to send codes to customer for order ${payment.order_id}`,
            related_entity_type: 'order',
            related_entity_id: payment.order_id,
          });
      }
    }

    // Mark webhook as processed
    await supabase
      .from('webhook_logs')
      .update({ processed: true, response_status: 200 })
      .eq('bill_id', bill_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Log error
    if (body?.bill_id) {
      await supabase
        .from('webhook_logs')
        .update({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          response_status: 500,
          processed: false
        })
        .eq('bill_id', body.bill_id);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

