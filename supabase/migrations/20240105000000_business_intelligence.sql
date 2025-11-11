-- Business Intelligence & Enterprise Features
-- Predictive analytics, AI insights, email orchestrator, behavioral analytics

-- ============================================
-- 1. BUSINESS INTELLIGENCE
-- ============================================

-- Daily metrics materialized view (auto-aggregation)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_metrics AS
SELECT
  DATE(o.created_at) AS date,
  o.tenant_id,
  o.utm_source,
  o.utm_campaign,
  -- Sessions & Orders
  COUNT(DISTINCT o.session_id) AS sessions,
  COUNT(o.id) AS total_orders,
  COUNT(o.id) FILTER (WHERE o.status = 'paid') AS paid_orders,
  -- Revenue & Profit
  SUM(o.total_amount) FILTER (WHERE o.status = 'paid') AS revenue,
  SUM(o.total_cost) FILTER (WHERE o.status = 'paid') AS cost,
  SUM(o.total_profit) FILTER (WHERE o.status = 'paid') AS profit,
  -- Conversion metrics
  ROUND((COUNT(o.id) FILTER (WHERE o.status = 'paid')::NUMERIC / NULLIF(COUNT(DISTINCT o.session_id), 0) * 100), 2) AS conversion_rate,
  ROUND(AVG(o.total_amount) FILTER (WHERE o.status = 'paid'), 2) AS avg_order_value,
  -- Margin
  CASE 
    WHEN SUM(o.total_amount) FILTER (WHERE o.status = 'paid') > 0 
    THEN ROUND((SUM(o.total_profit) FILTER (WHERE o.status = 'paid') / SUM(o.total_amount) FILTER (WHERE o.status = 'paid') * 100), 2)
    ELSE 0 
  END AS margin_percentage
FROM orders o
GROUP BY DATE(o.created_at), o.tenant_id, o.utm_source, o.utm_campaign;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_metrics_unique 
ON daily_metrics (date, COALESCE(tenant_id::text, ''), COALESCE(utm_source, ''), COALESCE(utm_campaign, ''));

-- LTV by cohort
CREATE OR REPLACE FUNCTION get_ltv_by_cohort(
  cohort_period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  cohort_month TEXT,
  customers_count BIGINT,
  total_ltv NUMERIC,
  avg_ltv NUMERIC,
  repeat_customers BIGINT,
  repeat_rate NUMERIC,
  avg_orders_per_customer NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH first_purchases AS (
    SELECT
      email,
      user_id,
      DATE_TRUNC('month', MIN(created_at)) AS cohort_month
    FROM orders
    WHERE status = 'paid'
    GROUP BY email, user_id
  ),
  customer_stats AS (
    SELECT
      fp.cohort_month,
      fp.email,
      COUNT(o.id) AS order_count,
      SUM(o.total_amount) AS ltv
    FROM first_purchases fp
    JOIN orders o ON o.email = fp.email AND o.status = 'paid'
    GROUP BY fp.cohort_month, fp.email
  )
  SELECT
    TO_CHAR(cs.cohort_month, 'YYYY-MM') AS month,
    COUNT(DISTINCT cs.email) AS customers,
    ROUND(SUM(cs.ltv), 2) AS total,
    ROUND(AVG(cs.ltv), 2) AS avg,
    COUNT(DISTINCT cs.email) FILTER (WHERE cs.order_count > 1) AS repeat,
    ROUND((COUNT(DISTINCT cs.email) FILTER (WHERE cs.order_count > 1)::NUMERIC / NULLIF(COUNT(DISTINCT cs.email), 0) * 100), 2) AS repeat_pct,
    ROUND(AVG(cs.order_count), 2) AS avg_orders
  FROM customer_stats cs
  GROUP BY cs.cohort_month
  ORDER BY cs.cohort_month DESC;
END;
$$ LANGUAGE plpgsql;

-- Automated insights engine (anomaly detection)
CREATE OR REPLACE FUNCTION detect_anomalies()
RETURNS TABLE (
  insight_type TEXT,
  severity TEXT,
  title TEXT,
  description TEXT,
  metric_value NUMERIC,
  baseline_value NUMERIC,
  change_percentage NUMERIC,
  recommendation TEXT
) AS $$
DECLARE
  today_cr NUMERIC;
  yesterday_cr NUMERIC;
  week_avg_cr NUMERIC;
  today_revenue NUMERIC;
  yesterday_revenue NUMERIC;
BEGIN
  -- Check 1: Conversion Rate Drop
  SELECT conversion_rate INTO today_cr
  FROM daily_metrics
  WHERE date = CURRENT_DATE
  ORDER BY revenue DESC NULLS LAST
  LIMIT 1;
  
  SELECT AVG(conversion_rate) INTO week_avg_cr
  FROM daily_metrics
  WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    AND date < CURRENT_DATE;
  
  IF today_cr IS NOT NULL AND week_avg_cr IS NOT NULL AND today_cr < week_avg_cr * 0.85 THEN
    RETURN QUERY SELECT
      'conversion_drop'::TEXT,
      'critical'::TEXT,
      'Conversion Rate Drop Detected'::TEXT,
      'Today''s CR is 15% lower than weekly average'::TEXT,
      today_cr,
      week_avg_cr,
      ROUND(((today_cr - week_avg_cr) / week_avg_cr * 100), 2),
      'Check traffic quality, payment gateway status, and site performance'::TEXT;
  END IF;
  
  -- Check 2: Revenue Spike/Drop
  SELECT revenue INTO today_revenue
  FROM daily_metrics
  WHERE date = CURRENT_DATE
  ORDER BY revenue DESC NULLS LAST
  LIMIT 1;
  
  SELECT revenue INTO yesterday_revenue
  FROM daily_metrics
  WHERE date = CURRENT_DATE - INTERVAL '1 day'
  ORDER BY revenue DESC NULLS LAST
  LIMIT 1;
  
  IF today_revenue IS NOT NULL AND yesterday_revenue IS NOT NULL THEN
    IF today_revenue > yesterday_revenue * 1.5 THEN
      RETURN QUERY SELECT
        'revenue_spike'::TEXT,
        'info'::TEXT,
        'Revenue Spike'::TEXT,
        'Revenue increased 50%+ vs yesterday'::TEXT,
        today_revenue,
        yesterday_revenue,
        ROUND(((today_revenue - yesterday_revenue) / yesterday_revenue * 100), 2),
        'Great! Consider scaling successful channels'::TEXT;
    ELSIF today_revenue < yesterday_revenue * 0.7 THEN
      RETURN QUERY SELECT
        'revenue_drop'::TEXT,
        'warning'::TEXT,
        'Revenue Drop'::TEXT,
        'Revenue decreased 30%+ vs yesterday'::TEXT,
        today_revenue,
        yesterday_revenue,
        ROUND(((today_revenue - yesterday_revenue) / yesterday_revenue * 100), 2),
        'Check marketing campaigns and traffic sources'::TEXT;
    END IF;
  END IF;
  
  -- Check 3: Channel Performance (best/worst)
  RETURN QUERY
  WITH channel_perf AS (
    SELECT
      utm_source,
      utm_campaign,
      revenue,
      profit,
      CASE WHEN revenue > 0 THEN ROUND((profit / revenue * 100), 2) ELSE 0 END AS margin
    FROM daily_metrics
    WHERE date = CURRENT_DATE
      AND revenue > 0
    ORDER BY profit DESC
  )
  SELECT
    'best_channel'::TEXT,
    'info'::TEXT,
    'Best Performing Channel'::TEXT,
    'Highest profit channel today: ' || utm_source || ' / ' || utm_campaign,
    profit,
    revenue,
    margin,
    'Consider increasing budget for this channel'::TEXT
  FROM channel_perf
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. EMAIL ORCHESTRATOR
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'abandoned_cart', 'winback', 'vip_offer', 'welcome', 'receipt'
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables JSONB, -- Available template variables
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_type TEXT NOT NULL,
    template_id UUID REFERENCES email_templates(id),
    recipient_email TEXT NOT NULL,
    recipient_user_id UUID,
    subject TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    conversion_order_id UUID REFERENCES orders(id),
    conversion_amount NUMERIC,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'clicked', 'converted', 'failed')),
    error_message TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_campaign_logs_email ON campaign_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_sent ON campaign_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_status ON campaign_logs(status);

-- Campaign attribution (7-day window)
CREATE OR REPLACE FUNCTION attribute_campaign_conversion()
RETURNS TRIGGER AS $$
BEGIN
  -- If order is paid, check if there was a recent campaign email
  IF NEW.status = 'paid' THEN
    UPDATE campaign_logs
    SET 
      status = 'converted',
      converted_at = NOW(),
      conversion_order_id = NEW.id,
      conversion_amount = NEW.total_amount
    WHERE recipient_email = NEW.email
      AND sent_at >= NOW() - INTERVAL '7 days'
      AND status != 'converted'
    ORDER BY sent_at DESC
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_campaign_attribution
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
EXECUTE FUNCTION attribute_campaign_conversion();

-- ============================================
-- 3. BEHAVIORAL ANALYTICS
-- ============================================

-- Add behavioral fields to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS session_duration INTEGER; -- seconds
ALTER TABLE events ADD COLUMN IF NOT EXISTS page_duration INTEGER; -- seconds
ALTER TABLE events ADD COLUMN IF NOT EXISTS scroll_depth INTEGER; -- percentage 0-100
ALTER TABLE events ADD COLUMN IF NOT EXISTS device_type TEXT; -- mobile, tablet, desktop
ALTER TABLE events ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS city TEXT;

-- Behavioral metrics function
CREATE OR REPLACE FUNCTION get_behavioral_metrics(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  comparison_period NUMERIC,
  change_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT
      AVG(session_duration) FILTER (WHERE session_duration IS NOT NULL) AS avg_session,
      AVG(page_duration) FILTER (WHERE page_duration IS NOT NULL) AS avg_page,
      AVG(scroll_depth) FILTER (WHERE scroll_depth IS NOT NULL) AS avg_scroll,
      COUNT(DISTINCT session_id) FILTER (WHERE device_type = 'mobile') * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0) AS mobile_pct
    FROM events
    WHERE created_at BETWEEN start_date AND end_date
  ),
  previous_period AS (
    SELECT
      AVG(session_duration) FILTER (WHERE session_duration IS NOT NULL) AS avg_session,
      AVG(page_duration) FILTER (WHERE page_duration IS NOT NULL) AS avg_page,
      AVG(scroll_depth) FILTER (WHERE scroll_depth IS NOT NULL) AS avg_scroll,
      COUNT(DISTINCT session_id) FILTER (WHERE device_type = 'mobile') * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0) AS mobile_pct
    FROM events
    WHERE created_at BETWEEN start_date - (end_date - start_date) AND start_date
  )
  SELECT
    'avg_session_duration'::TEXT,
    ROUND(c.avg_session, 0),
    ROUND(p.avg_session, 0),
    ROUND(((c.avg_session - p.avg_session) / NULLIF(p.avg_session, 0) * 100), 2)
  FROM current_period c, previous_period p
  UNION ALL
  SELECT
    'avg_page_duration'::TEXT,
    ROUND(c.avg_page, 0),
    ROUND(p.avg_page, 0),
    ROUND(((c.avg_page - p.avg_page) / NULLIF(p.avg_page, 0) * 100), 2)
  FROM current_period c, previous_period p
  UNION ALL
  SELECT
    'avg_scroll_depth'::TEXT,
    ROUND(c.avg_scroll, 0),
    ROUND(p.avg_scroll, 0),
    ROUND(((c.avg_scroll - p.avg_scroll) / NULLIF(p.avg_scroll, 0) * 100), 2)
  FROM current_period c, previous_period p
  UNION ALL
  SELECT
    'mobile_traffic_pct'::TEXT,
    ROUND(c.mobile_pct, 1),
    ROUND(p.mobile_pct, 1),
    ROUND((c.mobile_pct - p.mobile_pct), 2)
  FROM current_period c, previous_period p;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. REVIEWS & SOCIAL PROOF
-- ============================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    user_id UUID,
    email TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    reported BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);

-- Purchase counter (for social proof)
CREATE TABLE IF NOT EXISTS purchase_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    real_purchases INTEGER DEFAULT 0,
    displayed_count INTEGER, -- Can be boosted for social proof
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, date)
);

-- Auto-update purchase stats
CREATE OR REPLACE FUNCTION update_purchase_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' THEN
    INSERT INTO purchase_stats (product_id, date, real_purchases, displayed_count)
    SELECT 
      oi.product_id,
      CURRENT_DATE,
      1,
      CASE 
        WHEN COUNT(*) < 100 THEN 100 + FLOOR(RANDOM() * 200)::INTEGER
        ELSE COUNT(*)
      END
    FROM order_items oi
    WHERE oi.order_id = NEW.id
    GROUP BY oi.product_id
    ON CONFLICT (product_id, date)
    DO UPDATE SET 
      real_purchases = purchase_stats.real_purchases + 1,
      displayed_count = CASE
        WHEN purchase_stats.real_purchases + 1 < 100 
        THEN GREATEST(purchase_stats.displayed_count, 100) + 1
        ELSE purchase_stats.real_purchases + 1
      END,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purchase_stats
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
EXECUTE FUNCTION update_purchase_stats();

-- ============================================
-- 5. SYSTEM HEALTH MONITORING
-- ============================================

CREATE TABLE IF NOT EXISTS system_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL, -- 'uptime', 'latency', 'webhook_latency', 'email_send_time'
    metric_value NUMERIC NOT NULL,
    details JSONB,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON system_health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded ON system_health_metrics(recorded_at);

-- Get system health summary
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS TABLE (
  metric_name TEXT,
  current_value NUMERIC,
  avg_24h NUMERIC,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'webhook_avg_latency_ms'::TEXT,
    COALESCE((
      SELECT AVG(metric_value)
      FROM system_health_metrics
      WHERE metric_type = 'webhook_latency'
        AND recorded_at >= NOW() - INTERVAL '1 hour'
    ), 0)::NUMERIC,
    COALESCE((
      SELECT AVG(metric_value)
      FROM system_health_metrics
      WHERE metric_type = 'webhook_latency'
        AND recorded_at >= NOW() - INTERVAL '24 hours'
    ), 0)::NUMERIC,
    CASE
      WHEN COALESCE((SELECT AVG(metric_value) FROM system_health_metrics WHERE metric_type = 'webhook_latency' AND recorded_at >= NOW() - INTERVAL '1 hour'), 0) < 1000 THEN 'healthy'::TEXT
      WHEN COALESCE((SELECT AVG(metric_value) FROM system_health_metrics WHERE metric_type = 'webhook_latency' AND recorded_at >= NOW() - INTERVAL '1 hour'), 0) < 3000 THEN 'warning'::TEXT
      ELSE 'critical'::TEXT
    END
  UNION ALL
  SELECT
    'email_avg_send_time_ms'::TEXT,
    COALESCE((
      SELECT AVG(metric_value)
      FROM system_health_metrics
      WHERE metric_type = 'email_send_time'
        AND recorded_at >= NOW() - INTERVAL '1 hour'
    ), 0)::NUMERIC,
    COALESCE((
      SELECT AVG(metric_value)
      FROM system_health_metrics
      WHERE metric_type = 'email_send_time'
        AND recorded_at >= NOW() - INTERVAL '24 hours'
    ), 0)::NUMERIC,
    CASE
      WHEN COALESCE((SELECT AVG(metric_value) FROM system_health_metrics WHERE metric_type = 'email_send_time' AND recorded_at >= NOW() - INTERVAL '1 hour'), 0) < 2000 THEN 'healthy'::TEXT
      WHEN COALESCE((SELECT AVG(metric_value) FROM system_health_metrics WHERE metric_type = 'email_send_time' AND recorded_at >= NOW() - INTERVAL '1 hour'), 0) < 5000 THEN 'warning'::TEXT
      ELSE 'critical'::TEXT
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TELEGRAM NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS telegram_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_status ON telegram_notifications(status);

-- Comments
COMMENT ON MATERIALIZED VIEW daily_metrics IS 'Daily aggregated metrics for BI and forecasting';
COMMENT ON FUNCTION get_ltv_by_cohort IS 'LTV analysis by customer cohort (first purchase month)';
COMMENT ON FUNCTION detect_anomalies IS 'Automated insights engine - detects anomalies and generates recommendations';
COMMENT ON FUNCTION get_behavioral_metrics IS 'Behavioral analytics - session duration, scroll depth, device type';
COMMENT ON TABLE email_templates IS 'Email campaign templates for marketing automation';
COMMENT ON TABLE campaign_logs IS 'Email campaign tracking with conversion attribution';
COMMENT ON TABLE product_reviews IS 'Customer reviews for social proof';
COMMENT ON TABLE purchase_stats IS 'Purchase counters for social proof (with boosting for low volumes)';
COMMENT ON TABLE system_health_metrics IS 'System performance metrics for monitoring';
COMMENT ON TABLE telegram_notifications IS 'Queue for Telegram bot notifications';

