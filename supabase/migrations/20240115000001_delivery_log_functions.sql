-- Function to create SHA-256 hash
CREATE OR REPLACE FUNCTION hash_code(code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(digest(code, 'sha256'), 'hex');
END;
$$;

-- Function to log delivery
CREATE OR REPLACE FUNCTION log_code_delivery(
  p_order_id uuid,
  p_order_item_id uuid,
  p_transaction_id text,
  p_customer_email text,
  p_customer_ip inet,
  p_code text,
  p_code_id uuid,
  p_email_message_id text DEFAULT NULL,
  p_email_provider text DEFAULT 'supabase',
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id uuid;
  v_code_hash text;
BEGIN
  -- Generate SHA-256 hash of code
  v_code_hash := hash_code(p_code);
  
  -- Insert delivery log
  INSERT INTO delivery_logs (
    order_id,
    order_item_id,
    transaction_id,
    customer_email,
    customer_ip,
    code_hash,
    code_id,
    delivery_method,
    delivery_status,
    delivery_timestamp,
    email_message_id,
    email_provider,
    user_agent
  ) VALUES (
    p_order_id,
    p_order_item_id,
    p_transaction_id,
    p_customer_email,
    p_customer_ip,
    v_code_hash,
    p_code_id,
    'email',
    'sent',
    now(),
    p_email_message_id,
    p_email_provider,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to verify code delivery (for disputes)
CREATE OR REPLACE FUNCTION verify_code_delivery(
  p_transaction_id text,
  p_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_hash text;
  v_exists boolean;
BEGIN
  -- Generate hash of provided code
  v_code_hash := hash_code(p_code);
  
  -- Check if this hash exists for this transaction
  SELECT EXISTS(
    SELECT 1 
    FROM delivery_logs 
    WHERE transaction_id = p_transaction_id 
    AND code_hash = v_code_hash
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;

-- Function to get delivery proof for order
CREATE OR REPLACE FUNCTION get_delivery_proof(p_order_id uuid)
RETURNS TABLE (
  delivered_at timestamptz,
  customer_email text,
  customer_ip inet,
  transaction_id text,
  code_hash text,
  email_message_id text,
  delivery_status text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    delivery_timestamp as delivered_at,
    customer_email,
    customer_ip,
    transaction_id,
    code_hash,
    email_message_id,
    delivery_status
  FROM delivery_logs
  WHERE order_id = p_order_id
  ORDER BY delivery_timestamp ASC;
$$;

COMMENT ON FUNCTION log_code_delivery IS 'Logs code delivery with SHA-256 hash for proof of delivery';
COMMENT ON FUNCTION verify_code_delivery IS 'Verifies if a code was delivered for a transaction';
COMMENT ON FUNCTION get_delivery_proof IS 'Gets delivery proof for an order (for disputes)';

