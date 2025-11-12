#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔌 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`📄 Reading ${fileName}...`);
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`🔄 Executing ${fileName}...`);
  
  // Note: Supabase client doesn't support raw SQL execution directly
  // We'll need to use the REST API
  const { error } = await supabase.rpc('exec_sql', { sql_string: sql }).catch(() => {
    // If the function doesn't exist, we need to execute via Supabase SQL Editor
    console.log('⚠️  Cannot execute SQL directly via client.');
    console.log('   Please run this SQL manually in Supabase Dashboard:\n');
    console.log('   1. Go to: https://supabase.com/dashboard/project/mbbzuvqxvepdvnlelhcg/editor');
    console.log(`   2. Copy contents from: ${filePath}`);
    console.log('   3. Paste and run in SQL Editor\n');
    return { error: { message: 'Manual execution required' } };
  });

  if (error) {
    // Try alternative approach: check if tables exist
    const { data: tables } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (tables !== null) {
      console.log('✅ Tables already exist! Skipping schema creation.\n');
      return true;
    }
    
    console.log('❌ Tables do not exist. Manual migration required.\n');
    console.log('📋 SQL content:\n');
    console.log('─'.repeat(80));
    console.log(sql.substring(0, 500) + '...\n');
    console.log('─'.repeat(80));
    return false;
  }

  console.log(`✅ ${fileName} executed successfully!\n`);
  return true;
}

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  const migrationFiles = [
    '20240101000000_initial_schema.sql',
    '20240101000001_seed_data.sql',
    '20240115000000_delivery_logs.sql',
    '20250115000000_marketing_features_base.sql',
    '20250115100000_email_campaigns.sql'
  ];

  // Check if products table exists
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (!error && data !== null) {
      console.log('✅ Database schema already exists!\n');
      console.log('📊 Checking product count...');
      
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (count === 0) {
        console.log('⚠️  No products found. Running seed script...\n');
        // Run seed script
        require('./seed-database.js');
      } else {
        console.log(`✅ Found ${count} products in database!\n`);
        console.log('🎉 Database is ready!');
      }
      return;
    }
  } catch (err) {
    // Table doesn't exist, proceed with migrations
  }

  console.log('❌ Products table does not exist!\n');
  console.log('📋 MANUAL MIGRATION REQUIRED:\n');
  console.log('1. Open Supabase Dashboard:');
  console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.split('/')[2].split('.')[0]}/editor\n`);
  console.log('2. Click "New query" button\n');
  console.log('3. Copy and paste the following files one by one:\n');
  
  migrationFiles.forEach((file, i) => {
    const filePath = path.join(migrationsDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ${i + 1}. ${file}`);
      console.log(`      Location: ${filePath}\n`);
    }
  });
  
  console.log('4. Run each query by clicking "Run" or pressing Ctrl+Enter\n');
  console.log('5. After all migrations complete, run this script again:\n');
  console.log('   node scripts/run-migrations.js\n');
}

runMigrations().catch(console.error);

