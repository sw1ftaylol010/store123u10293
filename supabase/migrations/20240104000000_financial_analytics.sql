-- Financial & Marketing Analytics Migration
-- Cost, Profit, Multi-tenant, Ad Spend, A/B Tests, CRM

-- ============================================
-- 1. FINANCIAL ANALYTICS (Cost & Profit)
-- ============================================

-- Add cost tracking to gift_codes
ALTER TABLE gift_codes ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2);
ALTER TABLE gift_codes ADD COLUMN IF NOT EXISTS margin_percentage NUMERIC(5,2);

-- Add cost and profit to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS profit NUMERIC(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS margin_percentage NUMERIC(5,2);

-- Update orders with total cost and profit
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_profit NUMERIC(10,2) DEFAULT 0;

-- ============================================
-- 2. MULTI-TENANT (Multi-domain)
-- ============================================

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    primary_domain TEXT,
    theme_overrides JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT UNIQUE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    ssl_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add tenant_id to key tables
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Create default tenant
INSERT INTO tenants (name, slug, primary_domain, status)
VALUES ('Lonieve Gift', 'lonieve-gift', 'lonievegift.com', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_domains_tenant_id ON domains(tenant_id);

-- ============================================
-- 3. AD SPEND & ROI TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS ad_spend (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    spend NUMERIC(10,2) NOT NULL,
    impressions INTEGER,
    clicks INTEGER,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_spend_unique 
ON ad_spend (date, COALESCE(tenant_id::text, ''), COALESCE(utm_source, ''), COALESCE(utm_campaign, ''), COALESCE(utm_content, ''));

CREATE INDEX IF NOT EXISTS idx_ad_spend_date ON ad_spend(date);
CREATE INDEX IF NOT EXISTS idx_ad_spend_campaign ON ad_spend(utm_source, utm_campaign);

-- ============================================
-- 4. A/B TESTS & EXPERIMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    variants JSONB NOT NULL, -- [{"key": "control", "weight": 50}, {"key": "variant_a", "weight": 50}]
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    visitor_id TEXT,
    user_id UUID,
    variant TEXT NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_session ON experiment_assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON experiment_assignments(experiment_id);

-- Add AB test fields to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS experiment_id UUID REFERENCES experiments(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS experiment_variant TEXT;

-- Add AB test fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS experiments JSONB; -- Store multiple experiments

-- ============================================
-- 5. CRM TRIGGERS & MARKETING AUTOMATION
-- ============================================

-- Marketing triggers log
CREATE TABLE IF NOT EXISTS marketing_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type TEXT NOT NULL, -- 'abandoned_checkout', 'winback', 'vip_offer', 'repeat_reminder'
    user_id UUID,
    email TEXT,
    order_id UUID REFERENCES orders(id),
    trigger_data JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_triggers_email ON marketing_triggers(email);
CREATE INDEX IF NOT EXISTS idx_marketing_triggers_status ON marketing_triggers(status);
CREATE INDEX IF NOT EXISTS idx_marketing_triggers_type ON marketing_triggers(trigger_type);

-- ============================================
-- 6. DATA QUALITY MONITORING
-- ============================================

CREATE TABLE IF NOT EXISTS data_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_name TEXT NOT NULL,
    check_type TEXT NOT NULL, -- 'missing_data', 'anomaly', 'integrity'
    severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    metric_value NUMERIC,
    threshold_value NUMERIC,
    details JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_quality_status ON data_quality_checks(status);
CREATE INDEX IF NOT EXISTS idx_data_quality_created ON data_quality_checks(created_at);

-- ============================================
-- SQL FUNCTIONS FOR FINANCIAL ANALYTICS
-- ============================================

-- Get channel stats with profit & ROI
CREATE OR REPLACE FUNCTION get_channel_stats_financial(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW(),
  filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
  utm_source TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  sessions BIGINT,
  orders_count BIGINT,
  paid_orders BIGINT,
  revenue NUMERIC,
  cost NUMERIC,
  profit NUMERIC,
  margin_percentage NUMERIC,
  ad_spend NUMERIC,
  roi_percentage NUMERIC,
  mer NUMERIC,
  conversion_rate NUMERIC,
  avg_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH order_stats AS (
    SELECT
      COALESCE(o.utm_source, '(direct)') AS src,
      COALESCE(o.utm_campaign, '(none)') AS cmp,
      COALESCE(o.utm_content, '(none)') AS cnt,
      COUNT(DISTINCT o.session_id) AS sess,
      COUNT(o.id) AS ord_count,
      COUNT(o.id) FILTER (WHERE o.status = 'paid') AS paid_count,
      COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'paid'), 0) AS rev,
      COALESCE(SUM(o.total_cost) FILTER (WHERE o.status = 'paid'), 0) AS cst,
      COALESCE(SUM(o.total_profit) FILTER (WHERE o.status = 'paid'), 0) AS prf
    FROM orders o
    WHERE o.created_at BETWEEN start_date AND end_date
      AND (filter_tenant_id IS NULL OR o.tenant_id = filter_tenant_id)
    GROUP BY o.utm_source, o.utm_campaign, o.utm_content
  ),
  spend_stats AS (
    SELECT
      COALESCE(a.utm_source, '(direct)') AS src,
      COALESCE(a.utm_campaign, '(none)') AS cmp,
      COALESCE(a.utm_content, '(none)') AS cnt,
      SUM(a.spend) AS total_spend
    FROM ad_spend a
    WHERE a.date BETWEEN start_date::DATE AND end_date::DATE
      AND (filter_tenant_id IS NULL OR a.tenant_id = filter_tenant_id)
    GROUP BY a.utm_source, a.utm_campaign, a.utm_content
  )
  SELECT
    o.src,
    o.cmp,
    o.cnt,
    o.sess,
    o.ord_count,
    o.paid_count,
    o.rev,
    o.cst,
    o.prf,
    CASE WHEN o.rev > 0 THEN ROUND((o.prf / o.rev * 100), 2) ELSE 0 END AS margin_pct,
    COALESCE(s.total_spend, 0) AS spend,
    CASE 
      WHEN COALESCE(s.total_spend, 0) > 0 
      THEN ROUND(((o.prf - COALESCE(s.total_spend, 0)) / COALESCE(s.total_spend, 0) * 100), 2)
      ELSE NULL 
    END AS roi_pct,
    CASE 
      WHEN COALESCE(s.total_spend, 0) > 0 
      THEN ROUND((o.rev / COALESCE(s.total_spend, 0)), 2)
      ELSE NULL 
    END AS mer_val,
    ROUND((o.paid_count::NUMERIC / NULLIF(o.sess, 0) * 100), 2) AS cr,
    ROUND(COALESCE(AVG(o.rev) FILTER (WHERE o.paid_count > 0), 0), 2) AS aov
  FROM order_stats o
  LEFT JOIN spend_stats s ON o.src = s.src AND o.cmp = s.cmp AND o.cnt = s.cnt
  ORDER BY o.prf DESC;
END;
$$ LANGUAGE plpgsql;

-- Get product profitability
CREATE OR REPLACE FUNCTION get_product_profitability(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  product_id UUID,
  brand TEXT,
  region TEXT,
  orders_count BIGINT,
  units_sold BIGINT,
  revenue NUMERIC,
  cost NUMERIC,
  profit NUMERIC,
  margin_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.brand,
    p.region,
    COUNT(DISTINCT o.id) AS orders_count,
    COUNT(oi.id) AS units_sold,
    SUM(oi.price) AS revenue,
    SUM(oi.cost_price) AS cost,
    SUM(oi.profit) AS profit,
    ROUND(AVG(oi.margin_percentage), 2) AS margin_pct
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id 
    AND o.status = 'paid'
    AND o.created_at BETWEEN start_date AND end_date
  GROUP BY p.id, p.brand, p.region
  ORDER BY profit DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CRM FUNCTIONS
-- ============================================

-- Get abandoned checkouts
CREATE OR REPLACE FUNCTION get_abandoned_checkouts(
  minutes_ago INTEGER DEFAULT 60
)
RETURNS TABLE (
  session_id TEXT,
  email TEXT,
  last_event TIMESTAMPTZ,
  minutes_elapsed INTEGER,
  utm_source TEXT,
  utm_campaign TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH checkout_starts AS (
    SELECT DISTINCT ON (e.session_id)
      e.session_id,
      e.created_at,
      e.utm_source,
      e.utm_campaign,
      e.event_data->>'email' AS email
    FROM events e
    WHERE e.event_type = 'checkout_start'
      AND e.created_at >= NOW() - (minutes_ago || ' minutes')::INTERVAL
    ORDER BY e.session_id, e.created_at DESC
  ),
  completed_payments AS (
    SELECT DISTINCT e.session_id
    FROM events e
    WHERE e.event_type IN ('payment_success', 'payment_redirect')
  )
  SELECT
    c.session_id,
    c.email,
    c.created_at,
    EXTRACT(EPOCH FROM (NOW() - c.created_at))::INTEGER / 60 AS elapsed,
    c.utm_source,
    c.utm_campaign
  FROM checkout_starts c
  LEFT JOIN completed_payments cp ON cp.session_id = c.session_id
  WHERE cp.session_id IS NULL
    AND c.email IS NOT NULL
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get winback candidates
CREATE OR REPLACE FUNCTION get_winback_candidates(
  days_since_last_order INTEGER DEFAULT 30,
  min_days INTEGER DEFAULT 20
)
RETURNS TABLE (
  email TEXT,
  user_id UUID,
  last_order_date TIMESTAMPTZ,
  days_since INTEGER,
  total_orders BIGINT,
  total_spent NUMERIC,
  avg_order_value NUMERIC,
  favorite_brand TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH customer_orders AS (
    SELECT
      o.email,
      o.user_id,
      MAX(o.created_at) AS last_order,
      COUNT(*) AS order_count,
      SUM(o.total_amount) AS total_revenue,
      AVG(o.total_amount) AS aov
    FROM orders o
    WHERE o.status = 'paid'
    GROUP BY o.email, o.user_id
    HAVING COUNT(*) > 0
  ),
  favorite_brands AS (
    SELECT DISTINCT ON (o.email)
      o.email,
      p.brand
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.status = 'paid'
    GROUP BY o.email, p.brand
    ORDER BY o.email, COUNT(*) DESC
  )
  SELECT
    co.email,
    co.user_id,
    co.last_order,
    EXTRACT(DAY FROM (NOW() - co.last_order))::INTEGER AS days,
    co.order_count,
    co.total_revenue,
    co.aov,
    fb.brand
  FROM customer_orders co
  LEFT JOIN favorite_brands fb ON fb.email = co.email
  WHERE EXTRACT(DAY FROM (NOW() - co.last_order))::INTEGER BETWEEN min_days AND days_since_last_order
  ORDER BY co.total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATA QUALITY FUNCTIONS
-- ============================================

-- Check data quality
CREATE OR REPLACE FUNCTION check_data_quality()
RETURNS TABLE (
  check_name TEXT,
  check_type TEXT,
  severity TEXT,
  current_value NUMERIC,
  threshold NUMERIC,
  status TEXT,
  message TEXT
) AS $$
DECLARE
  events_without_session NUMERIC;
  orders_without_utm NUMERIC;
  recent_conversion_rate NUMERIC;
  failed_emails_today NUMERIC;
BEGIN
  -- Check 1: Events without session_id
  SELECT COUNT(*)::NUMERIC INTO events_without_session
  FROM events
  WHERE session_id IS NULL OR session_id = ''
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  RETURN QUERY
  SELECT 
    'events_without_session'::TEXT,
    'missing_data'::TEXT,
    CASE WHEN events_without_session > 100 THEN 'critical'::TEXT ELSE 'warning'::TEXT END,
    events_without_session,
    100::NUMERIC,
    CASE WHEN events_without_session > 100 THEN 'failing'::TEXT ELSE 'passing'::TEXT END,
    'Events without session_id in last 24h'::TEXT;
  
  -- Check 2: Orders without UTM
  SELECT (COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '7 days'), 0))::NUMERIC 
  INTO orders_without_utm
  FROM orders
  WHERE (utm_source IS NULL OR utm_source = '')
    AND created_at >= NOW() - INTERVAL '7 days';
  
  RETURN QUERY
  SELECT 
    'orders_without_utm'::TEXT,
    'missing_data'::TEXT,
    'info'::TEXT,
    ROUND(orders_without_utm, 2),
    50::NUMERIC,
    'info'::TEXT,
    '% of orders without UTM in last 7 days'::TEXT;
  
  -- Check 3: Conversion rate anomaly
  SELECT (COUNT(*) FILTER (WHERE status = 'paid')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0) * 100)
  INTO recent_conversion_rate
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '24 hours';
  
  RETURN QUERY
  SELECT 
    'conversion_rate_drop'::TEXT,
    'anomaly'::TEXT,
    CASE WHEN recent_conversion_rate < 10 THEN 'critical'::TEXT ELSE 'info'::TEXT END,
    ROUND(recent_conversion_rate, 2),
    10::NUMERIC,
    CASE WHEN recent_conversion_rate < 10 THEN 'failing'::TEXT ELSE 'passing'::TEXT END,
    'Conversion rate in last 24h (should be >10%)'::TEXT;
  
  -- Check 4: Failed emails
  SELECT COUNT(*)::NUMERIC INTO failed_emails_today
  FROM orders
  WHERE email_status = 'failed'
    AND created_at >= CURRENT_DATE;
  
  RETURN QUERY
  SELECT 
    'failed_emails_today'::TEXT,
    'operational'::TEXT,
    CASE WHEN failed_emails_today > 5 THEN 'critical'::TEXT ELSE 'info'::TEXT END,
    failed_emails_today,
    5::NUMERIC,
    CASE WHEN failed_emails_today > 5 THEN 'failing'::TEXT ELSE 'passing'::TEXT END,
    'Failed email deliveries today'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE tenants IS 'Multi-tenant support for multiple domains/brands';
COMMENT ON TABLE ad_spend IS 'Marketing spend tracking for ROI calculation';
COMMENT ON TABLE experiments IS 'A/B test experiments configuration';
COMMENT ON TABLE marketing_triggers IS 'CRM automation triggers (abandoned cart, winback, etc)';
COMMENT ON TABLE data_quality_checks IS 'Data quality monitoring and alerts';

COMMENT ON FUNCTION get_channel_stats_financial IS 'Get marketing channel stats with profit, ROI, and MER';
COMMENT ON FUNCTION get_product_profitability IS 'Get product-level profitability analysis';
COMMENT ON FUNCTION get_abandoned_checkouts IS 'Get list of abandoned checkouts for remarketing';
COMMENT ON FUNCTION get_winback_candidates IS 'Get customers ready for winback campaigns';
COMMENT ON FUNCTION check_data_quality IS 'Run data quality checks and return issues';

