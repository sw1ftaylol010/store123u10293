-- Add email tracking fields to orders table
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS email_sent_1h BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_24h BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_72h BOOLEAN DEFAULT FALSE;

-- Create email_log table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('abandoned-cart', 'win-back', 'price-alert', 'flash-sale', 'newsletter')),
  subject TEXT NOT NULL,
  promo_code TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_log_email ON email_log(email);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_log(type);
CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON email_log(sent_at DESC);

-- Add user_email field to promo_codes for personalized codes
ALTER TABLE IF EXISTS promo_codes
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_promo_codes_user_email ON promo_codes(user_email);

COMMENT ON TABLE email_log IS 'Tracks all marketing emails sent to customers';
COMMENT ON COLUMN email_log.type IS 'Type of email campaign';
COMMENT ON COLUMN email_log.promo_code IS 'Promo code included in email, if any';
COMMENT ON COLUMN email_log.opened_at IS 'When email was opened (requires email service webhook)';
COMMENT ON COLUMN email_log.clicked_at IS 'When link in email was clicked';
COMMENT ON COLUMN email_log.converted_at IS 'When user made a purchase after clicking email';

