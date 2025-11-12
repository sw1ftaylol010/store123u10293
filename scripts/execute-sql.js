#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const projectRef = supabaseUrl.split('//')[1].split('.')[0];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function createTables() {
  console.log('📊 Creating database schema...\n');
  
  const schemaPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240101000000_initial_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
    
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);
    
    try {
      const result = await executeSQL(stmt);
      if (result.success) {
        console.log('✅');
      } else {
        // Check if error is "already exists"
        if (result.error && (
          result.error.includes('already exists') || 
          result.error.includes('duplicate')
        )) {
          console.log('⚠️  (already exists)');
        } else {
          console.log(`❌`);
          console.log(`   Error: ${result.error}\n`);
        }
      }
    } catch (err) {
      console.log(`❌`);
      console.log(`   Error: ${err.message}\n`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ Schema creation complete!\n');
}

async function seedData() {
  console.log('🌱 Seeding products...\n');
  
  const seedPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240101000001_seed_data.sql');
  const seed = fs.readFileSync(seedPath, 'utf8');
  
  try {
    const result = await executeSQL(seed);
    if (result.success || (result.error && result.error.includes('duplicate'))) {
      console.log('✅ Products seeded successfully!\n');
    } else {
      console.log(`⚠️  Seed result: ${result.error || 'Unknown'}\n`);
    }
  } catch (err) {
    console.log(`⚠️  Seed error: ${err.message}\n`);
  }
}

async function runDirectSeed() {
  // Direct insert using Supabase client
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🌱 Adding products via Supabase client...\n');

  const products = [
    { brand: 'Amazon', name: 'Amazon Gift Card USA', description: 'Shop millions of items on Amazon.com', region: 'USA', category: 'Shopping', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 25, currency: 'USD', is_active: true },
    { brand: 'Amazon', name: 'Amazon Gift Card EU', description: 'Shop millions of items on Amazon EU stores', region: 'EU', category: 'Shopping', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 22, currency: 'EUR', is_active: true },
    { brand: 'Apple', name: 'Apple Gift Card USA', description: 'For apps, games, music, movies, and more', region: 'USA', category: 'Entertainment', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 20, currency: 'USD', is_active: true },
    { brand: 'Apple', name: 'Apple Gift Card EU', description: 'For apps, games, music, movies, and more', region: 'EU', category: 'Entertainment', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 20, currency: 'EUR', is_active: true },
    { brand: 'Google Play', name: 'Google Play Gift Card USA', description: 'Apps, games, and digital content', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 23, currency: 'USD', is_active: true },
    { brand: 'Google Play', name: 'Google Play Gift Card EU', description: 'Apps, games, and digital content', region: 'EU', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 21, currency: 'EUR', is_active: true },
    { brand: 'PlayStation', name: 'PlayStation Store Gift Card USA', description: 'Games, add-ons, and subscriptions', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 22, currency: 'USD', is_active: true },
    { brand: 'PlayStation', name: 'PlayStation Store Gift Card EU', description: 'Games, add-ons, and subscriptions', region: 'EU', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 20, currency: 'EUR', is_active: true },
    { brand: 'Steam', name: 'Steam Wallet Code USA', description: 'Thousands of games on Steam', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 28, currency: 'USD', is_active: true },
    { brand: 'Steam', name: 'Steam Wallet Code EU', description: 'Thousands of games on Steam', region: 'EU', category: 'Gaming', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 26, currency: 'EUR', is_active: true },
    { brand: 'Netflix', name: 'Netflix Gift Card USA', description: 'Stream unlimited movies and TV shows', region: 'USA', category: 'Entertainment', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 20, currency: 'USD', is_active: true },
    { brand: 'Netflix', name: 'Netflix Gift Card EU', description: 'Stream unlimited movies and TV shows', region: 'EU', category: 'Entertainment', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 18, currency: 'EUR', is_active: true },
    { brand: 'Spotify', name: 'Spotify Gift Card USA', description: 'Premium music streaming', region: 'USA', category: 'Entertainment', min_nominal: 50, max_nominal: 300, available_nominals: [50, 100, 200, 300], discount_percentage: 25, currency: 'USD', is_active: true },
    { brand: 'Xbox', name: 'Xbox Gift Card USA', description: 'Games, add-ons, and Game Pass', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 21, currency: 'USD', is_active: true },
    { brand: 'Nintendo', name: 'Nintendo eShop Card USA', description: 'Games and DLC for Nintendo Switch', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 22, currency: 'USD', is_active: true },
  ];

  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (error) {
    if (error.message.includes('schema cache')) {
      console.log('❌ Tables do not exist yet. Running schema creation first...\n');
      return false;
    }
    console.error('❌ Error inserting products:', error.message);
    return false;
  }

  console.log(`✅ Added ${data.length} products!\n`);
  
  const brands = [...new Set(data.map(p => p.brand))];
  console.log('📦 Brands:');
  brands.forEach(brand => {
    const count = data.filter(p => p.brand === brand).length;
    console.log(`   - ${brand}: ${count} products`);
  });
  
  return true;
}

async function main() {
  console.log('🚀 Starting automatic database setup...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);
  
  // Try direct seed first (fastest method)
  const seedSuccess = await runDirectSeed();
  
  if (seedSuccess) {
    console.log('\n🎉 Database setup complete!');
    console.log('🌐 Refresh your browser to see the products!\n');
  } else {
    console.log('⚠️  Direct seed failed. This likely means tables don\'t exist.\n');
    console.log('📋 Please run the SQL manually in Supabase Dashboard:\n');
    console.log('   https://supabase.com/dashboard/project/mbbzuvqxvepdvnlelhcg/editor\n');
    console.log('   1. Copy contents of: supabase/migrations/20240101000000_initial_schema.sql');
    console.log('   2. Run in SQL Editor');
    console.log('   3. Then copy and run: supabase/migrations/20240101000001_seed_data.sql\n');
  }
}

main().catch(console.error);

