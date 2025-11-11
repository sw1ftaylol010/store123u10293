-- Delivery Logs for proof of delivery
-- Stores evidence that codes were delivered to customer

CREATE TABLE delivery_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  
  -- Order & Transaction info
  order_id uuid references orders(id) on delete cascade not null,
  order_item_id uuid references order_items(id) on delete cascade,
  transaction_id text not null, -- Payment gateway transaction ID
  
  -- Customer info
  customer_email text not null,
  customer_ip inet, -- IP address of customer
  
  -- Code info (hashed for security)
  code_hash text not null, -- SHA-256 hash of the code
  code_id uuid references gift_codes(id) on delete set null,
  
  -- Delivery details
  delivery_method text default 'email' not null, -- email, api, etc
  delivery_status text default 'sent' not null, -- sent, failed, bounced
  delivery_timestamp timestamptz default now() not null,
  
  -- Email delivery proof
  email_message_id text, -- Email service message ID
  email_provider text, -- 'supabase', 'mailgun', 'ses'
  
  -- Additional metadata
  user_agent text,
  metadata jsonb default '{}'::jsonb
);

-- Indexes for fast lookups
CREATE INDEX idx_delivery_logs_order_id ON delivery_logs(order_id);
CREATE INDEX idx_delivery_logs_customer_email ON delivery_logs(customer_email);
CREATE INDEX idx_delivery_logs_transaction_id ON delivery_logs(transaction_id);
CREATE INDEX idx_delivery_logs_created_at ON delivery_logs(created_at DESC);
CREATE INDEX idx_delivery_logs_code_hash ON delivery_logs(code_hash);

-- RLS Policies
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to delivery_logs"
  ON delivery_logs
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Users can view their own delivery logs
CREATE POLICY "Users can view own delivery logs"
  ON delivery_logs
  FOR SELECT
  TO authenticated
  USING (
    customer_email = auth.jwt() ->> 'email'
  );

COMMENT ON TABLE delivery_logs IS 'Proof of delivery logs - stores evidence that codes were delivered';
COMMENT ON COLUMN delivery_logs.code_hash IS 'SHA-256 hash of the delivered code (for verification without storing plaintext)';
COMMENT ON COLUMN delivery_logs.customer_ip IS 'IP address at time of purchase (for dispute resolution)';
COMMENT ON COLUMN delivery_logs.transaction_id IS 'Payment gateway transaction ID (for reconciliation)';

