-- Insert sample products
INSERT INTO products (brand, name, description, region, category, min_nominal, max_nominal, available_nominals, discount_percentage, currency, is_active) VALUES
-- Amazon
('Amazon', 'Amazon Gift Card USA', 'Shop millions of items on Amazon.com', 'USA', 'Shopping', 50, 1000, ARRAY[50, 100, 250, 500, 1000], 25, 'USD', true),
('Amazon', 'Amazon Gift Card EU', 'Shop millions of items on Amazon EU stores', 'EU', 'Shopping', 50, 1000, ARRAY[50, 100, 250, 500, 1000], 22, 'EUR', true),

-- Apple
('Apple', 'Apple Gift Card USA', 'For apps, games, music, movies, and more', 'USA', 'Entertainment', 50, 500, ARRAY[50, 100, 200, 500], 20, 'USD', true),
('Apple', 'Apple Gift Card EU', 'For apps, games, music, movies, and more', 'EU', 'Entertainment', 50, 500, ARRAY[50, 100, 200, 500], 20, 'EUR', true),

-- Google Play
('Google Play', 'Google Play Gift Card USA', 'Apps, games, and digital content', 'USA', 'Gaming', 50, 500, ARRAY[50, 100, 250, 500], 23, 'USD', true),
('Google Play', 'Google Play Gift Card EU', 'Apps, games, and digital content', 'EU', 'Gaming', 50, 500, ARRAY[50, 100, 250, 500], 21, 'EUR', true),
('Google Play', 'Google Play Gift Card LATAM', 'Apps, games, and digital content', 'LATAM', 'Gaming', 50, 500, ARRAY[50, 100, 250, 500], 24, 'USD', true),

-- PlayStation
('PlayStation', 'PlayStation Store Gift Card USA', 'Games, add-ons, and subscriptions', 'USA', 'Gaming', 50, 500, ARRAY[50, 100, 250, 500], 22, 'USD', true),
('PlayStation', 'PlayStation Store Gift Card EU', 'Games, add-ons, and subscriptions', 'EU', 'Gaming', 50, 500, ARRAY[50, 100, 250, 500], 20, 'EUR', true),

-- Steam
('Steam', 'Steam Wallet Code USA', 'Thousands of games on Steam', 'USA', 'Gaming', 50, 1000, ARRAY[50, 100, 250, 500, 1000], 28, 'USD', true),
('Steam', 'Steam Wallet Code EU', 'Thousands of games on Steam', 'EU', 'Gaming', 50, 1000, ARRAY[50, 100, 250, 500, 1000], 26, 'EUR', true),
('Steam', 'Steam Wallet Code LATAM', 'Thousands of games on Steam', 'LATAM', 'Gaming', 50, 1000, ARRAY[50, 100, 250, 500, 1000], 30, 'USD', true),

-- Netflix
('Netflix', 'Netflix Gift Card USA', 'Stream unlimited movies and TV shows', 'USA', 'Entertainment', 50, 500, ARRAY[50, 100, 200, 500], 20, 'USD', true),
('Netflix', 'Netflix Gift Card EU', 'Stream unlimited movies and TV shows', 'EU', 'Entertainment', 50, 500, ARRAY[50, 100, 200, 500], 18, 'EUR', true),

-- Spotify
('Spotify', 'Spotify Gift Card USA', 'Premium music streaming', 'USA', 'Entertainment', 50, 300, ARRAY[50, 100, 200, 300], 25, 'USD', true),
('Spotify', 'Spotify Gift Card EU', 'Premium music streaming', 'EU', 'Entertainment', 50, 300, ARRAY[50, 100, 200, 300], 23, 'EUR', true),

-- Xbox
('Xbox', 'Xbox Gift Card USA', 'Games, add-ons, and Game Pass', 'USA', 'Gaming', 50, 500, ARRAY[50, 100, 250, 500], 21, 'USD', true),
('Xbox', 'Xbox Gift Card EU', 'Games, add-ons, and Game Pass', 'EU', 'Gaming', 50, 500, ARRAY[50, 100, 250, 500], 19, 'EUR', true),

-- Nintendo
('Nintendo', 'Nintendo eShop Card USA', 'Games and DLC for Nintendo Switch', 'USA', 'Gaming', 50, 500, ARRAY[50, 100, 200, 500], 22, 'USD', true),
('Nintendo', 'Nintendo eShop Card EU', 'Games and DLC for Nintendo Switch', 'EU', 'Gaming', 50, 500, ARRAY[50, 100, 200, 500], 20, 'EUR', true);

-- Update instructions for products
UPDATE products SET instructions = 
'How to redeem:
1. Go to the brand''s website or app
2. Sign in to your account
3. Navigate to the gift card redemption page
4. Enter your code
5. The balance will be added to your account immediately

Note: This code is region-specific and can only be used in ' || region || '.';

UPDATE products SET terms = 
'Terms and Conditions:
- Code is valid for use only in the specified region
- Code cannot be resold or transferred
- No refunds for used codes
- Contact support within 48 hours if code doesn''t work
- Code may have expiration date (check brand policy)';

