-- Deep Analytics Migration
-- Расширяем events таблицу и добавляем аналитические функции

-- Расширяем events таблицу
ALTER TABLE events ADD COLUMN IF NOT EXISTS visitor_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS utm_term TEXT;

-- Добавляем utm поля в orders (если ещё нет)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Индексы для аналитики
CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_utm_source ON events(utm_source);
CREATE INDEX IF NOT EXISTS idx_events_utm_campaign ON events(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_events_event_type_created_at ON events(event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_orders_utm_source ON orders(utm_source);
CREATE INDEX IF NOT EXISTS idx_orders_utm_campaign ON orders(utm_campaign);

-- Функция для получения воронки
CREATE OR REPLACE FUNCTION get_funnel_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMPTZ DEFAULT NOW(),
  filter_utm_source TEXT DEFAULT NULL,
  filter_utm_campaign TEXT DEFAULT NULL
)
RETURNS TABLE (
  step TEXT,
  sessions_count BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH sessions_base AS (
    SELECT DISTINCT e.session_id
    FROM events e
    WHERE e.created_at BETWEEN start_date AND end_date
      AND (filter_utm_source IS NULL OR e.utm_source = filter_utm_source)
      AND (filter_utm_campaign IS NULL OR e.utm_campaign = filter_utm_campaign)
  ),
  funnel_steps AS (
    SELECT
      COUNT(DISTINCT s.session_id) AS total_sessions,
      COUNT(DISTINCT CASE WHEN e.event_type = 'view_product' THEN e.session_id END) AS view_product,
      COUNT(DISTINCT CASE WHEN e.event_type = 'configurator_open' THEN e.session_id END) AS configurator,
      COUNT(DISTINCT CASE WHEN e.event_type = 'checkout_start' THEN e.session_id END) AS checkout,
      COUNT(DISTINCT CASE WHEN e.event_type = 'payment_redirect' THEN e.session_id END) AS redirect,
      COUNT(DISTINCT o.session_id) FILTER (WHERE o.status = 'paid') AS paid
    FROM sessions_base s
    LEFT JOIN events e ON e.session_id = s.session_id
    LEFT JOIN orders o ON o.session_id = s.session_id
  )
  SELECT 
    'Total Sessions'::TEXT,
    fs.total_sessions,
    100.0::NUMERIC
  FROM funnel_steps fs
  UNION ALL
  SELECT 
    'View Product',
    fs.view_product,
    ROUND((fs.view_product::NUMERIC / NULLIF(fs.total_sessions, 0) * 100), 2)
  FROM funnel_steps fs
  UNION ALL
  SELECT 
    'Configurator Open',
    fs.configurator,
    ROUND((fs.configurator::NUMERIC / NULLIF(fs.total_sessions, 0) * 100), 2)
  FROM funnel_steps fs
  UNION ALL
  SELECT 
    'Checkout Start',
    fs.checkout,
    ROUND((fs.checkout::NUMERIC / NULLIF(fs.total_sessions, 0) * 100), 2)
  FROM funnel_steps fs
  UNION ALL
  SELECT 
    'Payment Redirect',
    fs.redirect,
    ROUND((fs.redirect::NUMERIC / NULLIF(fs.total_sessions, 0) * 100), 2)
  FROM funnel_steps fs
  UNION ALL
  SELECT 
    'Paid',
    fs.paid,
    ROUND((fs.paid::NUMERIC / NULLIF(fs.total_sessions, 0) * 100), 2)
  FROM funnel_steps fs;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения статистики по каналам
CREATE OR REPLACE FUNCTION get_channel_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  utm_source TEXT,
  utm_campaign TEXT,
  sessions BIGINT,
  orders_count BIGINT,
  paid_orders BIGINT,
  revenue NUMERIC,
  conversion_rate NUMERIC,
  avg_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(o.utm_source, '(direct)') AS utm_source,
    COALESCE(o.utm_campaign, '(none)') AS utm_campaign,
    COUNT(DISTINCT o.session_id) AS sessions,
    COUNT(o.id) AS orders_count,
    COUNT(o.id) FILTER (WHERE o.status = 'paid') AS paid_orders,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status = 'paid'), 0) AS revenue,
    ROUND(
      (COUNT(o.id) FILTER (WHERE o.status = 'paid')::NUMERIC / 
       NULLIF(COUNT(DISTINCT o.session_id), 0) * 100),
      2
    ) AS conversion_rate,
    ROUND(
      COALESCE(AVG(o.total_amount) FILTER (WHERE o.status = 'paid'), 0),
      2
    ) AS avg_order_value
  FROM orders o
  WHERE o.created_at BETWEEN start_date AND end_date
  GROUP BY o.utm_source, o.utm_campaign
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения статистики по брендам
CREATE OR REPLACE FUNCTION get_brand_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  brand TEXT,
  region TEXT,
  orders_count BIGINT,
  revenue NUMERIC,
  avg_discount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.brand,
    p.region,
    COUNT(DISTINCT o.id) AS orders_count,
    SUM(oi.price) AS revenue,
    ROUND(AVG(oi.discount_percentage), 2) AS avg_discount
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id 
    AND o.status = 'paid'
    AND o.created_at BETWEEN start_date AND end_date
  GROUP BY p.brand, p.region
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Функция для когортного анализа (repeat purchases)
CREATE OR REPLACE FUNCTION get_cohort_analysis(
  cohort_period INTEGER DEFAULT 30,
  min_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '90 days'
)
RETURNS TABLE (
  user_identifier TEXT,
  first_purchase_date DATE,
  orders_count BIGINT,
  total_revenue NUMERIC,
  days_between_purchases NUMERIC,
  is_repeat_customer BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH user_orders AS (
    SELECT
      COALESCE(o.user_id::TEXT, o.email) AS user_id,
      o.email,
      o.created_at,
      o.total_amount,
      o.status
    FROM orders o
    WHERE o.created_at >= min_date
      AND o.status = 'paid'
  ),
  user_stats AS (
    SELECT
      uo.user_id,
      MIN(uo.created_at)::DATE AS first_purchase,
      COUNT(*) AS purchase_count,
      SUM(uo.total_amount) AS total_spent,
      CASE 
        WHEN COUNT(*) > 1 THEN
          ROUND(
            EXTRACT(EPOCH FROM (MAX(uo.created_at) - MIN(uo.created_at))) / 
            (86400 * NULLIF(COUNT(*) - 1, 0)),
            2
          )
        ELSE NULL
      END AS avg_days_between
    FROM user_orders uo
    GROUP BY uo.user_id
  )
  SELECT
    us.user_id,
    us.first_purchase,
    us.purchase_count,
    us.total_spent,
    us.avg_days_between,
    (us.purchase_count > 1) AS is_repeat
  FROM user_stats us
  ORDER BY us.total_spent DESC;
END;
$$ LANGUAGE plpgsql;

-- Материализованное представление для быстрой аналитики (опционально)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_analytics AS
SELECT
  DATE(o.created_at) AS date,
  o.utm_source,
  o.utm_campaign,
  COUNT(DISTINCT o.session_id) AS sessions,
  COUNT(o.id) AS orders_total,
  COUNT(o.id) FILTER (WHERE o.status = 'paid') AS orders_paid,
  SUM(o.total_amount) FILTER (WHERE o.status = 'paid') AS revenue,
  ROUND(AVG(o.total_amount) FILTER (WHERE o.status = 'paid'), 2) AS avg_order_value
FROM orders o
GROUP BY DATE(o.created_at), o.utm_source, o.utm_campaign;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_analytics_unique 
ON daily_analytics (date, COALESCE(utm_source, ''), COALESCE(utm_campaign, ''));

-- Функция для обновления материализованного представления
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_analytics;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_funnel_stats IS 'Get conversion funnel statistics';
COMMENT ON FUNCTION get_channel_stats IS 'Get marketing channel performance stats';
COMMENT ON FUNCTION get_brand_stats IS 'Get product brand performance stats';
COMMENT ON FUNCTION get_cohort_analysis IS 'Get customer cohort and repeat purchase analysis';

