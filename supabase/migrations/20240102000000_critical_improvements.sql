-- Critical improvements: webhook logs, alerts, idempotency

-- Webhook logs table
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    event_type TEXT,
    bill_id TEXT,
    order_id TEXT,
    status TEXT,
    request_body JSONB,
    response_status INTEGER,
    processed BOOLEAN DEFAULT false,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_bill_id ON webhook_logs(bill_id);
CREATE INDEX idx_webhook_logs_order_id ON webhook_logs(order_id);
CREATE INDEX idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);

-- System notifications/alerts table
CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'low_stock', 'pending_payment', 'email_failed', 'webhook_failed'
    severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
    title TEXT NOT NULL,
    message TEXT,
    related_entity_type TEXT, -- 'product', 'order', 'payment'
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_system_notifications_type ON system_notifications(type);
CREATE INDEX idx_system_notifications_severity ON system_notifications(severity);
CREATE INDEX idx_system_notifications_is_read ON system_notifications(is_read);
CREATE INDEX idx_system_notifications_is_resolved ON system_notifications(is_resolved);
CREATE INDEX idx_system_notifications_created_at ON system_notifications(created_at);

-- Add email_status to orders
ALTER TABLE orders ADD COLUMN email_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN email_sent_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN email_retry_count INTEGER DEFAULT 0;

CREATE INDEX idx_orders_email_status ON orders(email_status);

-- Add processed_at and idempotency key to payments
ALTER TABLE payments ADD COLUMN processed_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN idempotency_key TEXT UNIQUE;

CREATE INDEX idx_payments_idempotency_key ON payments(idempotency_key);

-- Function to check low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
    available_count INTEGER;
    product_name TEXT;
    threshold INTEGER := 5; -- Alert when less than 5 codes available
BEGIN
    -- Count available codes for this product
    SELECT COUNT(*), p.name
    INTO available_count, product_name
    FROM gift_codes gc
    JOIN products p ON p.id = gc.product_id
    WHERE gc.product_id = NEW.product_id
    AND gc.status = 'available'
    GROUP BY p.name;

    -- Create alert if low stock
    IF available_count < threshold THEN
        INSERT INTO system_notifications (
            type,
            severity,
            title,
            message,
            related_entity_type,
            related_entity_id
        ) VALUES (
            'low_stock',
            CASE 
                WHEN available_count = 0 THEN 'critical'
                WHEN available_count < 3 THEN 'warning'
                ELSE 'info'
            END,
            'Low Stock Alert',
            'Product "' || product_name || '" has only ' || available_count || ' codes remaining',
            'product',
            NEW.product_id
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for low stock check
CREATE TRIGGER trigger_check_low_stock
AFTER UPDATE ON gift_codes
FOR EACH ROW
WHEN (OLD.status = 'available' AND NEW.status != 'available')
EXECUTE FUNCTION check_low_stock();

-- Function to check pending payments
CREATE OR REPLACE FUNCTION check_pending_payments()
RETURNS void AS $$
DECLARE
    pending_record RECORD;
BEGIN
    FOR pending_record IN
        SELECT p.id, p.order_id, o.email, p.created_at
        FROM payments p
        JOIN orders o ON o.id = p.order_id
        WHERE p.status = 'pending'
        AND p.created_at < NOW() - INTERVAL '30 minutes'
        AND NOT EXISTS (
            SELECT 1 FROM system_notifications
            WHERE related_entity_type = 'payment'
            AND related_entity_id = p.id
            AND is_resolved = false
        )
    LOOP
        INSERT INTO system_notifications (
            type,
            severity,
            title,
            message,
            related_entity_type,
            related_entity_id
        ) VALUES (
            'pending_payment',
            'warning',
            'Pending Payment Alert',
            'Payment for order ' || pending_record.order_id || ' (' || pending_record.email || ') has been pending for more than 30 minutes',
            'payment',
            pending_record.id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check failed emails
CREATE OR REPLACE FUNCTION check_failed_emails()
RETURNS void AS $$
DECLARE
    failed_record RECORD;
BEGIN
    FOR failed_record IN
        SELECT id, email, created_at
        FROM orders
        WHERE email_status = 'failed'
        AND status = 'paid'
        AND NOT EXISTS (
            SELECT 1 FROM system_notifications
            WHERE related_entity_type = 'order'
            AND related_entity_id = orders.id
            AND type = 'email_failed'
            AND is_resolved = false
        )
    LOOP
        INSERT INTO system_notifications (
            type,
            severity,
            title,
            message,
            related_entity_type,
            related_entity_id
        ) VALUES (
            'email_failed',
            'critical',
            'Email Delivery Failed',
            'Failed to send email to ' || failed_record.email || ' for order ' || failed_record.id,
            'order',
            failed_record.id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for new tables
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view webhook logs
CREATE POLICY "Admins can view webhook logs" ON webhook_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- Only admins can view system notifications
CREATE POLICY "Admins can view system notifications" ON system_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

