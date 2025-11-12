const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Parse the Supabase URL to get connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.argv[2];

if (!supabaseUrl || !dbPassword) {
  console.error('❌ Usage: node run-marketing-migration-pg.js <database-password>');
  console.error('   Get password from: Supabase Dashboard > Project Settings > Database');
  process.exit(1);
}

// Extract project ID from URL: https://xxx.supabase.co -> xxx
const projectId = supabaseUrl.match(/https:\/\/([a-z]+)\.supabase\.co/)?.[1];

if (!projectId) {
  console.error('❌ Could not parse Supabase URL');
  process.exit(1);
}

const client = new Client({
  host: `db.${projectId}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: dbPassword,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('🚀 Connecting to database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250115000000_marketing_features_base.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`📄 Migration file: 20250115000000_marketing_features_base.sql`);
    console.log(`📊 File size: ${(sql.length / 1024).toFixed(2)} KB\n`);

    console.log('⏳ Executing migration (this may take a minute)...\n');

    // Execute the entire SQL file as one transaction
    await client.query('BEGIN');

    try {
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ Migration executed successfully!\n');

      // Verify tables were created
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
          'referrals', 'user_balance', 'balance_transactions',
          'reviews', 'promo_codes', 'promo_code_uses',
          'price_alerts', 'achievements', 'user_achievements',
          'affiliates', 'affiliate_clicks', 'affiliate_payouts',
          'flash_sales', 'activity_feed', 'email_campaigns', 'email_sends'
        )
        ORDER BY table_name
      `);

      console.log('📊 Created tables:');
      result.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });

      console.log(`\n🎉 All done! Created ${result.rows.length} tables.`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.position) {
      console.error(`   Position in SQL: ${error.position}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

