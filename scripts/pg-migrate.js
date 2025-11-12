#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: '.env.local' });

const connectionString = 'postgresql://postgres:wAt25FlkFuZh67Ov@db.mbbzuvqxvepdvnlelhcg.supabase.co:5432/postgres';

async function runMigrations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // Run schema migration
    console.log('📊 Creating database schema...\n');
    const schemaPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240101000000_initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('✅ Schema created successfully!\n');

    // Run seed migration
    console.log('🌱 Seeding products...\n');
    const seedPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240101000001_seed_data.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    await client.query(seed);
    console.log('✅ Products seeded successfully!\n');

    // Check results
    const result = await client.query('SELECT brand, COUNT(*) as count FROM products GROUP BY brand ORDER BY brand');
    console.log('📦 Products in database:');
    result.rows.forEach(row => {
      console.log(`   - ${row.brand}: ${row.count} products`);
    });
    
    const totalResult = await client.query('SELECT COUNT(*) as total FROM products');
    console.log(`\n✅ Total: ${totalResult.rows[0].total} products\n`);
    
    console.log('🎉 Database setup complete!');
    console.log('🌐 Refresh your browser: http://34.122.210.216:3000/\n');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Tables already exist! Checking products...\n');
      
      try {
        const result = await client.query('SELECT COUNT(*) as count FROM products');
        const count = result.rows[0].count;
        
        if (count === 0) {
          console.log('📊 No products found. Adding products...\n');
          const seedPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240101000001_seed_data.sql');
          const seed = fs.readFileSync(seedPath, 'utf8');
          await client.query(seed);
          console.log('✅ Products added!\n');
        } else {
          console.log(`✅ Found ${count} products in database!\n`);
          console.log('🎉 Database is ready!');
        }
      } catch (err) {
        console.error('❌ Error checking products:', err.message);
      }
    } else {
      console.error('❌ Migration error:', error.message);
      throw error;
    }
  } finally {
    await client.end();
  }
}

runMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

