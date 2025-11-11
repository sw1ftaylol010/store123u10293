-- =====================================================
-- MARKETING FEATURES - BASE TABLES
-- =====================================================
-- Created: 2025-01-15
-- Description: Core tables for marketing features

-- =====================================================
-- 1. REFERRAL PROGRAM
-- =====================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Referrer (who invites)
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_email TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  
  -- Referee (who was invited)
  referee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_email TEXT,
  referee_first_purchase_id UUID REFERENCES orders(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, expired
  
  -- Rewards
  referrer_reward_amount NUMERIC(10,2) DEFAULT 0,
  referrer_reward_status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  referee_reward_amount NUMERIC(10,2) DEFAULT 0,
  referee_reward_status TEXT DEFAULT 'pending',
  
  -- Tracking
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  
  -- Metadata
  utm_source TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_user_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- =====================================================
-- 2. CASHBACK SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS user_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  -- Balance
  available_balance NUMERIC(10,2) DEFAULT 0,
  pending_balance NUMERIC(10,2) DEFAULT 0,
  lifetime_earned NUMERIC(10,2) DEFAULT 0,
  lifetime_spent NUMERIC(10,2) DEFAULT 0,
  
  -- Metadata
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(user_id),
  UNIQUE(email)
);

CREATE INDEX idx_user_balance_user ON user_balance(user_id);
CREATE INDEX idx_user_balance_email ON user_balance(email);

-- =====================================================

CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_id UUID REFERENCES user_balance(id) ON DELETE CASCADE,
  
  -- Transaction
  type TEXT NOT NULL, -- cashback, referral, bonus, purchase, withdrawal
  amount NUMERIC(10,2) NOT NULL,
  balance_before NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  
  -- Reference
  order_id UUID REFERENCES orders(id),
  referral_id UUID REFERENCES referrals(id),
  
  -- Details
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_balance_tx_user ON balance_transactions(user_id);
CREATE INDEX idx_balance_tx_balance ON balance_transactions(balance_id);
CREATE INDEX idx_balance_tx_type ON balance_transactions(type);
CREATE INDEX idx_balance_tx_order ON balance_transactions(order_id);

-- =====================================================
-- 3. REVIEWS & RATINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  
  -- Product
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  
  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  
  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  
  -- Reward
  reward_points INTEGER DEFAULT 0,
  reward_given BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- =====================================================
-- 4. PROMO CODES
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Code
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type TEXT NOT NULL, -- percentage, fixed, bonus
  discount_value NUMERIC(10,2) NOT NULL,
  max_discount_amount NUMERIC(10,2), -- cap for percentage discounts
  
  -- Limits
  min_purchase_amount NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER, -- NULL = unlimited
  max_uses_per_user INTEGER DEFAULT 1,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, paused, expired
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  
  -- Restrictions
  allowed_products UUID[], -- NULL = all products
  allowed_brands TEXT[],
  allowed_categories TEXT[],
  allowed_user_ids UUID[], -- NULL = all users
  first_purchase_only BOOLEAN DEFAULT FALSE,
  
  -- Tracking
  total_uses INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_discount_given NUMERIC(10,2) DEFAULT 0,
  
  -- Attribution
  created_by UUID REFERENCES auth.users(id),
  campaign_name TEXT,
  utm_source TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_status ON promo_codes(status);
CREATE INDEX idx_promo_codes_dates ON promo_codes(start_date, end_date);

-- =====================================================

CREATE TABLE IF NOT EXISTS promo_code_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  discount_amount NUMERIC(10,2) NOT NULL,
  order_amount NUMERIC(10,2) NOT NULL,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_promo_uses_code ON promo_code_uses(promo_code_id);
CREATE INDEX idx_promo_uses_user ON promo_code_uses(user_id);
CREATE INDEX idx_promo_uses_order ON promo_code_uses(order_id);

-- =====================================================
-- 5. PRICE DROP ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Alert conditions
  target_price NUMERIC(10,2),
  target_discount_percentage INTEGER,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, triggered, cancelled
  triggered_at TIMESTAMPTZ,
  
  -- Notification
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_price_alerts_product ON price_alerts(product_id);
CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_status ON price_alerts(status);

-- =====================================================
-- 6. ACHIEVEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Achievement details
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Requirements
  requirement_type TEXT NOT NULL, -- purchase_count, spend_amount, referral_count, review_count, etc.
  requirement_value NUMERIC(10,2) NOT NULL,
  
  -- Rewards
  reward_points INTEGER DEFAULT 0,
  reward_badge TEXT,
  reward_discount_code TEXT,
  
  -- Display
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_achievements_key ON achievements(key);
CREATE INDEX idx_achievements_active ON achievements(is_active);

-- =====================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Progress
  progress NUMERIC(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Reward
  reward_claimed BOOLEAN DEFAULT FALSE,
  reward_claimed_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(completed);

-- =====================================================
-- 7. AFFILIATE PROGRAM
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  
  -- Affiliate details
  affiliate_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, active, paused, banned
  tier TEXT DEFAULT 'bronze', -- bronze, silver, gold
  
  -- Commission
  commission_percentage NUMERIC(5,2) DEFAULT 10.00,
  lifetime_commission NUMERIC(10,2) DEFAULT 0,
  pending_commission NUMERIC(10,2) DEFAULT 0,
  paid_commission NUMERIC(10,2) DEFAULT 0,
  
  -- Stats
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  
  -- Payout
  payout_method TEXT, -- paypal, bank, balance
  payout_details JSONB DEFAULT '{}'::jsonb,
  min_payout_amount NUMERIC(10,2) DEFAULT 50.00,
  
  -- Contact
  website TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliates_user ON affiliates(user_id);
CREATE INDEX idx_affiliates_status ON affiliates(status);

-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL,
  
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT,
  
  -- Conversion
  converted BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id),
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_converted ON affiliate_clicks(converted);
CREATE INDEX idx_affiliate_clicks_created ON affiliate_clicks(created_at);

-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, paid, failed
  
  payout_method TEXT NOT NULL,
  payout_details JSONB DEFAULT '{}'::jsonb,
  
  paid_at TIMESTAMPTZ,
  transaction_id TEXT,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON affiliate_payouts(status);

-- =====================================================
-- 8. FLASH SALES
-- =====================================================

CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Sale details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Discount
  discount_percentage INTEGER NOT NULL,
  max_discount_amount NUMERIC(10,2),
  
  -- Products
  product_ids UUID[], -- NULL = all products
  brand_names TEXT[],
  category_names TEXT[],
  
  -- Status
  status TEXT DEFAULT 'scheduled', -- scheduled, active, ended, cancelled
  
  -- Limits
  max_uses INTEGER, -- total uses limit
  max_uses_per_user INTEGER DEFAULT 1,
  
  -- Stats
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  
  -- Display
  banner_text TEXT,
  banner_color TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_flash_sales_status ON flash_sales(status);
CREATE INDEX idx_flash_sales_dates ON flash_sales(start_date, end_date);

-- =====================================================
-- 9. ACTIVITY FEED (for real-time display)
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Activity type
  type TEXT NOT NULL, -- purchase, review, milestone
  
  -- User (anonymized for privacy)
  user_name TEXT, -- "John" or "User123"
  user_location TEXT, -- "US", "UK"
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  
  -- Reference
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  
  -- Display
  icon TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_public ON activity_feed(is_public);

-- =====================================================
-- 10. EMAIL CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Campaign details
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- abandoned_cart, winback, promo, newsletter
  
  -- Content
  subject TEXT NOT NULL,
  template_id TEXT NOT NULL,
  template_data JSONB DEFAULT '{}'::jsonb,
  
  -- Targeting
  target_segment TEXT, -- all, first_time, inactive_30d, high_value, etc.
  target_user_ids UUID[],
  
  -- Schedule
  schedule_type TEXT DEFAULT 'immediate', -- immediate, scheduled, triggered
  scheduled_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
  
  -- Stats
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_email_campaigns_type ON email_campaigns(type);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);

-- =====================================================

CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, bounced, failed
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Conversion
  converted BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id),
  
  -- Details
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_email ON email_sends(email);
CREATE INDEX idx_email_sends_status ON email_sends(status);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM referrals WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code(affiliate_name TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  base TEXT;
  exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  base := UPPER(REGEXP_REPLACE(affiliate_name, '[^a-zA-Z0-9]', '', 'g'));
  base := SUBSTRING(base FROM 1 FOR 10);
  
  code := base;
  LOOP
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = code) INTO exists;
    EXIT WHEN NOT exists;
    counter := counter + 1;
    code := base || counter::TEXT;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to add cashback
CREATE OR REPLACE FUNCTION add_cashback(
  p_user_id UUID,
  p_email TEXT,
  p_order_id UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT 'Cashback earned'
)
RETURNS UUID AS $$
DECLARE
  v_balance_id UUID;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
  v_transaction_id UUID;
BEGIN
  -- Get or create balance
  INSERT INTO user_balance (user_id, email)
  VALUES (p_user_id, p_email)
  ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
  RETURNING id, available_balance INTO v_balance_id, v_balance_before;
  
  -- Calculate new balance
  v_balance_after := v_balance_before + p_amount;
  
  -- Update balance
  UPDATE user_balance
  SET available_balance = v_balance_after,
      lifetime_earned = lifetime_earned + p_amount,
      updated_at = NOW()
  WHERE id = v_balance_id;
  
  -- Create transaction
  INSERT INTO balance_transactions (
    user_id, balance_id, type, amount,
    balance_before, balance_after,
    order_id, description
  )
  VALUES (
    p_user_id, v_balance_id, 'cashback', p_amount,
    v_balance_before, v_balance_after,
    p_order_id, p_description
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

-- User Balance
ALTER TABLE user_balance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own balance" ON user_balance FOR SELECT USING (auth.uid() = user_id);

-- Balance Transactions
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON balance_transactions FOR SELECT USING (auth.uid() = user_id);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Price Alerts
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own alerts" ON price_alerts FOR ALL USING (auth.uid() = user_id);

-- Achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active achievements" ON achievements FOR SELECT USING (is_active = true);

-- User Achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Activity Feed
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public activity" ON activity_feed FOR SELECT USING (is_public = true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Sample Achievements
INSERT INTO achievements (key, name, description, requirement_type, requirement_value, reward_points) VALUES
('first_purchase', 'First Steps', 'Made your first purchase', 'purchase_count', 1, 50),
('loyal_customer', 'Loyal Customer', 'Made 5 purchases', 'purchase_count', 5, 200),
('big_spender', 'Big Spender', 'Single purchase over $500', 'single_purchase_amount', 500, 500),
('brand_explorer', 'Brand Explorer', 'Purchased from 3 different brands', 'unique_brands', 3, 150),
('reviewer', 'Reviewer', 'Left your first review', 'review_count', 1, 50),
('review_master', 'Review Master', 'Left 10 reviews', 'review_count', 10, 300),
('referral_starter', 'Social Butterfly', 'Referred your first friend', 'referral_count', 1, 100),
('referral_master', 'Influencer', 'Referred 10 friends', 'referral_count', 10, 1000),
('vip', 'VIP Member', 'Lifetime spending over $5000', 'lifetime_spend', 5000, 2000)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_balance_updated_at BEFORE UPDATE ON user_balance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flash_sales_updated_at BEFORE UPDATE ON flash_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

