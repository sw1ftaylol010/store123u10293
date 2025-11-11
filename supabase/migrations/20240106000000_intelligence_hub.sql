-- Lonieve Intelligence Hub - Final Enterprise Upgrade
-- AI Copilot, RFM Analysis, Unit Economics, Partner API, Jobs Engine

-- ============================================
-- 1. UNIT ECONOMICS (TRUE PROFIT)
-- ============================================

-- Transaction fees tracking
CREATE TABLE IF NOT EXISTS transaction_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    fee_type TEXT NOT NULL, -- 'payment_gateway', 'platform', 'currency_conversion'
    fee_amount NUMERIC(10,2) NOT NULL,
    fee_percentage NUMERIC(5,2),
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refunds tracking
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    refund_amount NUMERIC(10,2) NOT NULL,
    refund_reason TEXT,
    refund_type TEXT DEFAULT 'full' CHECK (refund_type IN ('full', 'partial')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    requested_by UUID,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Add true profit fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_fees NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS true_profit NUMERIC(10,2);

-- Calculate true profit
CREATE OR REPLACE FUNCTION calculate_true_profit(order_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
    order_record RECORD;
    total_fees NUMERIC DEFAULT 0;
    total_refunds NUMERIC DEFAULT 0;
    ad_spend_amount NUMERIC DEFAULT 0;
    true_profit_value NUMERIC;
BEGIN
    -- Get order data
    SELECT * INTO order_record FROM orders WHERE id = order_id_param;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate total fees
    SELECT COALESCE(SUM(fee_amount), 0) INTO total_fees
    FROM transaction_fees
    WHERE order_id = order_id_param;
    
    -- Calculate total refunds
    SELECT COALESCE(SUM(refund_amount), 0) INTO total_refunds
    FROM refunds
    WHERE order_id = order_id_param AND status = 'completed';
    
    -- Calculate true profit
    -- True Profit = Revenue - Cost - Fees - Refunds - Ad Spend (allocated)
    true_profit_value := 
        COALESCE(order_record.total_amount, 0) - 
        COALESCE(order_record.total_cost, 0) - 
        total_fees - 
        total_refunds;
    
    RETURN true_profit_value;
END;
$$ LANGUAGE plpgsql;

-- Unit economics view
CREATE OR REPLACE FUNCTION get_unit_economics(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    period_comparison NUMERIC
) AS $$
DECLARE
    current_orders BIGINT;
    current_revenue NUMERIC;
    current_cost NUMERIC;
    current_profit NUMERIC;
    current_fees NUMERIC;
    current_refunds NUMERIC;
    current_ad_spend NUMERIC;
    true_profit_total NUMERIC;
    cac NUMERIC;
    ltv NUMERIC;
    aov NUMERIC;
BEGIN
    -- Current period stats
    SELECT 
        COUNT(*) FILTER (WHERE status = 'paid'),
        SUM(total_amount) FILTER (WHERE status = 'paid'),
        SUM(total_cost) FILTER (WHERE status = 'paid'),
        SUM(total_profit) FILTER (WHERE status = 'paid'),
        SUM(transaction_fees) FILTER (WHERE status = 'paid'),
        SUM(refund_amount) FILTER (WHERE status = 'paid')
    INTO 
        current_orders,
        current_revenue,
        current_cost,
        current_profit,
        current_fees,
        current_refunds
    FROM orders
    WHERE created_at BETWEEN start_date AND end_date;
    
    -- Get ad spend for period
    SELECT COALESCE(SUM(spend), 0) INTO current_ad_spend
    FROM ad_spend
    WHERE date BETWEEN start_date::DATE AND end_date::DATE;
    
    -- Calculate metrics
    true_profit_total := COALESCE(current_profit, 0) - COALESCE(current_fees, 0) - COALESCE(current_refunds, 0);
    aov := CASE WHEN current_orders > 0 THEN current_revenue / current_orders ELSE 0 END;
    cac := CASE WHEN current_orders > 0 THEN current_ad_spend / current_orders ELSE 0 END;
    ltv := aov; -- For gift cards, LTV ≈ AOV (single purchase model)
    
    -- Return metrics
    RETURN QUERY
    SELECT 'Total Orders'::TEXT, current_orders::NUMERIC, 0::NUMERIC
    UNION ALL SELECT 'Revenue'::TEXT, COALESCE(current_revenue, 0), 0::NUMERIC
    UNION ALL SELECT 'Cost'::TEXT, COALESCE(current_cost, 0), 0::NUMERIC
    UNION ALL SELECT 'Gross Profit'::TEXT, COALESCE(current_profit, 0), 0::NUMERIC
    UNION ALL SELECT 'Transaction Fees'::TEXT, COALESCE(current_fees, 0), 0::NUMERIC
    UNION ALL SELECT 'Refunds'::TEXT, COALESCE(current_refunds, 0), 0::NUMERIC
    UNION ALL SELECT 'Ad Spend'::TEXT, current_ad_spend, 0::NUMERIC
    UNION ALL SELECT 'True Profit'::TEXT, true_profit_total, 0::NUMERIC
    UNION ALL SELECT 'AOV'::TEXT, aov, 0::NUMERIC
    UNION ALL SELECT 'LTV'::TEXT, ltv, 0::NUMERIC
    UNION ALL SELECT 'CAC'::TEXT, cac, 0::NUMERIC
    UNION ALL SELECT 'LTV/CAC Ratio'::TEXT, CASE WHEN cac > 0 THEN ROUND(ltv / cac, 2) ELSE 0 END, 0::NUMERIC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. RFM ANALYSIS & CUSTOMER SEGMENTS
-- ============================================

-- RFM segmentation
CREATE OR REPLACE FUNCTION get_rfm_segments()
RETURNS TABLE (
    customer_email TEXT,
    recency_days INTEGER,
    frequency INTEGER,
    monetary NUMERIC,
    rfm_score TEXT,
    segment TEXT,
    segment_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH customer_metrics AS (
        SELECT
            o.email,
            EXTRACT(DAY FROM (NOW() - MAX(o.created_at)))::INTEGER AS recency,
            COUNT(*)::INTEGER AS frequency,
            SUM(o.total_amount)::NUMERIC AS monetary
        FROM orders o
        WHERE o.status = 'paid'
        GROUP BY o.email
    ),
    rfm_quartiles AS (
        SELECT
            email,
            recency,
            frequency,
            monetary,
            NTILE(5) OVER (ORDER BY recency DESC) AS r_score,
            NTILE(5) OVER (ORDER BY frequency) AS f_score,
            NTILE(5) OVER (ORDER BY monetary) AS m_score
        FROM customer_metrics
    ),
    rfm_segments AS (
        SELECT
            email,
            recency,
            frequency,
            monetary,
            CONCAT(r_score::TEXT, f_score::TEXT, m_score::TEXT) AS rfm,
            CASE
                -- VIP Champions (bought recently, often, spend most)
                WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'VIP Champions'
                -- Loyal Customers (high frequency)
                WHEN f_score >= 4 THEN 'Loyal Customers'
                -- Big Spenders (high monetary)
                WHEN m_score >= 4 THEN 'Big Spenders'
                -- At Risk (bought often but not recently)
                WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
                -- Promising (recent buyers, low frequency)
                WHEN r_score >= 4 AND f_score <= 2 THEN 'Promising'
                -- Need Attention (average across board)
                WHEN r_score = 3 AND f_score = 3 THEN 'Need Attention'
                -- Lost (haven't bought recently, low frequency)
                WHEN r_score <= 2 AND f_score <= 2 THEN 'Lost'
                ELSE 'Regular'
            END AS segment,
            CASE
                WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Your best customers - nurture and retain'
                WHEN f_score >= 4 THEN 'Regular buyers - upsell and cross-sell'
                WHEN m_score >= 4 THEN 'High value - encourage repeat purchases'
                WHEN r_score <= 2 AND f_score >= 3 THEN 'Previously engaged - winback campaign'
                WHEN r_score >= 4 AND f_score <= 2 THEN 'New customers - convert to loyal'
                WHEN r_score = 3 AND f_score = 3 THEN 'Middle ground - targeted offers'
                WHEN r_score <= 2 AND f_score <= 2 THEN 'Inactive - aggressive winback or let go'
                ELSE 'Standard customers - maintain engagement'
            END AS description
        FROM rfm_quartiles
    )
    SELECT * FROM rfm_segments
    ORDER BY 
        CASE segment
            WHEN 'VIP Champions' THEN 1
            WHEN 'Loyal Customers' THEN 2
            WHEN 'Big Spenders' THEN 3
            WHEN 'Promising' THEN 4
            WHEN 'Need Attention' THEN 5
            WHEN 'At Risk' THEN 6
            WHEN 'Lost' THEN 7
            ELSE 8
        END,
        monetary DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. PARTNER / AFFILIATE API
-- ============================================

CREATE TABLE IF NOT EXISTS partner_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name TEXT NOT NULL,
    partner_email TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    api_secret TEXT NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    commission_rate NUMERIC(5,2) DEFAULT 10.00, -- percentage
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
    link_code TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id),
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue NUMERIC(10,2) DEFAULT 0,
    commission NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partner_accounts(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    payment_method TEXT,
    payment_details JSONB,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track affiliate conversions
ALTER TABLE orders ADD COLUMN IF NOT EXISTS affiliate_link_id UUID REFERENCES affiliate_links(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partner_accounts(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS partner_commission NUMERIC(10,2);

-- Calculate partner commission
CREATE OR REPLACE FUNCTION calculate_partner_commission()
RETURNS TRIGGER AS $$
DECLARE
    commission_rate NUMERIC;
    commission_amount NUMERIC;
BEGIN
    IF NEW.status = 'paid' AND NEW.partner_id IS NOT NULL THEN
        -- Get commission rate
        SELECT pa.commission_rate INTO commission_rate
        FROM partner_accounts pa
        WHERE pa.id = NEW.partner_id;
        
        -- Calculate commission
        commission_amount := NEW.total_profit * (commission_rate / 100);
        
        -- Update order
        NEW.partner_commission := commission_amount;
        
        -- Update affiliate link stats
        IF NEW.affiliate_link_id IS NOT NULL THEN
            UPDATE affiliate_links
            SET 
                conversions = conversions + 1,
                revenue = revenue + NEW.total_amount,
                commission = commission + commission_amount
            WHERE id = NEW.affiliate_link_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_partner_commission
BEFORE UPDATE ON orders
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
EXECUTE FUNCTION calculate_partner_commission();

-- ============================================
-- 4. JOBS & AUTOMATION ENGINE
-- ============================================

CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT UNIQUE NOT NULL,
    job_type TEXT NOT NULL, -- 'sql_function', 'api_call', 'email_campaign'
    schedule TEXT NOT NULL, -- cron format: '0 0 * * *'
    job_config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    last_run_status TEXT,
    last_run_duration_ms INTEGER,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
    job_name TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
    duration_ms INTEGER,
    result JSONB,
    error_message TEXT,
    logs TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_started ON job_logs(started_at);

-- Insert default jobs
INSERT INTO scheduled_jobs (job_name, job_type, schedule, job_config, enabled) VALUES
('refresh_daily_metrics', 'sql_function', '0 1 * * *', '{"function": "REFRESH MATERIALIZED VIEW CONCURRENTLY daily_metrics"}'::jsonb, true),
('send_daily_insights', 'api_call', '0 9 * * *', '{"endpoint": "/api/insights/generate", "method": "GET"}'::jsonb, true),
('check_system_health', 'sql_function', '*/5 * * * *', '{"function": "check_data_quality"}'::jsonb, true),
('process_abandoned_carts', 'sql_function', '0 */6 * * *', '{"function": "get_abandoned_checkouts", "params": {"minutes_ago": 360}}'::jsonb, true),
('generate_partner_payouts', 'sql_function', '0 0 1 * *', '{"function": "calculate_partner_payouts"}'::jsonb, true)
ON CONFLICT (job_name) DO NOTHING;

-- ============================================
-- 5. AI COPILOT / QUERY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS ai_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    query_text TEXT NOT NULL,
    query_intent TEXT, -- 'revenue', 'profit', 'customers', 'channels', etc
    sql_executed TEXT,
    response TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_queries_user ON ai_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_queries_created ON ai_queries(created_at);

-- Common query patterns for AI
CREATE OR REPLACE FUNCTION ai_get_revenue_last_n_days(days INTEGER DEFAULT 7)
RETURNS NUMERIC AS $$
    SELECT COALESCE(SUM(total_amount), 0)
    FROM orders
    WHERE status = 'paid'
    AND created_at >= NOW() - (days || ' days')::INTERVAL;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION ai_get_profit_last_n_days(days INTEGER DEFAULT 7)
RETURNS NUMERIC AS $$
    SELECT COALESCE(SUM(total_profit), 0)
    FROM orders
    WHERE status = 'paid'
    AND created_at >= NOW() - (days || ' days')::INTERVAL;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION ai_get_top_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    product_name TEXT,
    brand TEXT,
    orders_count BIGINT,
    revenue NUMERIC
) AS $$
    SELECT
        p.name,
        p.brand,
        COUNT(DISTINCT o.id) AS orders,
        SUM(oi.price) AS rev
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id AND o.status = 'paid'
    WHERE o.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.name, p.brand
    ORDER BY rev DESC
    LIMIT limit_count;
$$ LANGUAGE SQL;

-- ============================================
-- 6. TELEGRAM BOT COMMANDS
-- ============================================

CREATE TABLE IF NOT EXISTS telegram_bot_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT UNIQUE NOT NULL,
    telegram_username TEXT,
    user_id UUID, -- Link to admin user
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_command TEXT,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telegram command handlers (metadata)
CREATE TABLE IF NOT EXISTS telegram_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command TEXT UNIQUE NOT NULL, -- '/daily', '/revenue', etc
    description TEXT,
    sql_function TEXT, -- SQL function to call
    response_format TEXT DEFAULT 'text' CHECK (response_format IN ('text', 'chart', 'table')),
    requires_role TEXT DEFAULT 'viewer' CHECK (requires_role IN ('admin', 'manager', 'viewer')),
    enabled BOOLEAN DEFAULT true
);

-- Insert default commands
INSERT INTO telegram_commands (command, description, sql_function, response_format, requires_role) VALUES
('/daily', 'Get daily revenue and profit', 'ai_get_revenue_last_n_days', 'text', 'viewer'),
('/revenue', 'Get revenue for period', 'ai_get_revenue_last_n_days', 'text', 'viewer'),
('/profit', 'Get profit for period', 'ai_get_profit_last_n_days', 'text', 'viewer'),
('/alerts', 'Get active alerts', 'detect_anomalies', 'table', 'manager'),
('/topchannels', 'Get top performing channels', 'get_channel_stats_financial', 'table', 'manager'),
('/crm', 'Get CRM opportunities', 'get_winback_candidates', 'table', 'manager')
ON CONFLICT (command) DO NOTHING;

-- Comments
COMMENT ON TABLE transaction_fees IS 'Transaction fees for unit economics calculation';
COMMENT ON TABLE refunds IS 'Refund tracking for true profit calculation';
COMMENT ON FUNCTION get_unit_economics IS 'Unit economics metrics: CAC, LTV, AOV, True Profit';
COMMENT ON FUNCTION get_rfm_segments IS 'RFM customer segmentation for targeted marketing';
COMMENT ON TABLE partner_accounts IS 'Partner/affiliate accounts for B2B marketplace';
COMMENT ON TABLE affiliate_links IS 'Tracking links for affiliate conversions';
COMMENT ON TABLE partner_payouts IS 'Commission payouts to partners';
COMMENT ON TABLE scheduled_jobs IS 'Automated jobs scheduler';
COMMENT ON TABLE job_logs IS 'Job execution logs';
COMMENT ON TABLE ai_queries IS 'AI Copilot query log';
COMMENT ON TABLE telegram_bot_users IS 'Telegram bot user management';
COMMENT ON TABLE telegram_commands IS 'Available Telegram bot commands';

