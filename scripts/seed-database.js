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

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('🌱 Seeding database with sample products...\n');

  const products = [
    // Amazon
    { brand: 'Amazon', name: 'Amazon Gift Card USA', description: 'Shop millions of items on Amazon.com', region: 'USA', category: 'Shopping', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 25, currency: 'USD', is_active: true },
    { brand: 'Amazon', name: 'Amazon Gift Card EU', description: 'Shop millions of items on Amazon EU stores', region: 'EU', category: 'Shopping', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 22, currency: 'EUR', is_active: true },

    // Apple
    { brand: 'Apple', name: 'Apple Gift Card USA', description: 'For apps, games, music, movies, and more', region: 'USA', category: 'Entertainment', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 20, currency: 'USD', is_active: true },
    { brand: 'Apple', name: 'Apple Gift Card EU', description: 'For apps, games, music, movies, and more', region: 'EU', category: 'Entertainment', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 20, currency: 'EUR', is_active: true },

    // Google Play
    { brand: 'Google Play', name: 'Google Play Gift Card USA', description: 'Apps, games, and digital content', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 23, currency: 'USD', is_active: true },
    { brand: 'Google Play', name: 'Google Play Gift Card EU', description: 'Apps, games, and digital content', region: 'EU', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 21, currency: 'EUR', is_active: true },
    { brand: 'Google Play', name: 'Google Play Gift Card LATAM', description: 'Apps, games, and digital content', region: 'LATAM', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 24, currency: 'USD', is_active: true },

    // PlayStation
    { brand: 'PlayStation', name: 'PlayStation Store Gift Card USA', description: 'Games, add-ons, and subscriptions', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 22, currency: 'USD', is_active: true },
    { brand: 'PlayStation', name: 'PlayStation Store Gift Card EU', description: 'Games, add-ons, and subscriptions', region: 'EU', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 20, currency: 'EUR', is_active: true },

    // Steam
    { brand: 'Steam', name: 'Steam Wallet Code USA', description: 'Thousands of games on Steam', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 28, currency: 'USD', is_active: true },
    { brand: 'Steam', name: 'Steam Wallet Code EU', description: 'Thousands of games on Steam', region: 'EU', category: 'Gaming', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 26, currency: 'EUR', is_active: true },
    { brand: 'Steam', name: 'Steam Wallet Code LATAM', description: 'Thousands of games on Steam', region: 'LATAM', category: 'Gaming', min_nominal: 50, max_nominal: 1000, available_nominals: [50, 100, 250, 500, 1000], discount_percentage: 30, currency: 'USD', is_active: true },

    // Netflix
    { brand: 'Netflix', name: 'Netflix Gift Card USA', description: 'Stream unlimited movies and TV shows', region: 'USA', category: 'Entertainment', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 20, currency: 'USD', is_active: true },
    { brand: 'Netflix', name: 'Netflix Gift Card EU', description: 'Stream unlimited movies and TV shows', region: 'EU', category: 'Entertainment', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 18, currency: 'EUR', is_active: true },

    // Spotify
    { brand: 'Spotify', name: 'Spotify Gift Card USA', description: 'Premium music streaming', region: 'USA', category: 'Entertainment', min_nominal: 50, max_nominal: 300, available_nominals: [50, 100, 200, 300], discount_percentage: 25, currency: 'USD', is_active: true },
    { brand: 'Spotify', name: 'Spotify Gift Card EU', description: 'Premium music streaming', region: 'EU', category: 'Entertainment', min_nominal: 50, max_nominal: 300, available_nominals: [50, 100, 200, 300], discount_percentage: 23, currency: 'EUR', is_active: true },

    // Xbox
    { brand: 'Xbox', name: 'Xbox Gift Card USA', description: 'Games, add-ons, and Game Pass', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 21, currency: 'USD', is_active: true },
    { brand: 'Xbox', name: 'Xbox Gift Card EU', description: 'Games, add-ons, and Game Pass', region: 'EU', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 250, 500], discount_percentage: 19, currency: 'EUR', is_active: true },

    // Nintendo
    { brand: 'Nintendo', name: 'Nintendo eShop Card USA', description: 'Games and DLC for Nintendo Switch', region: 'USA', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 22, currency: 'USD', is_active: true },
    { brand: 'Nintendo', name: 'Nintendo eShop Card EU', description: 'Games and DLC for Nintendo Switch', region: 'EU', category: 'Gaming', min_nominal: 50, max_nominal: 500, available_nominals: [50, 100, 200, 500], discount_percentage: 20, currency: 'EUR', is_active: true },
  ];

  try {
    // Check if products already exist
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (count > 0) {
      console.log(`⚠️  Database already has ${count} products. Skipping seed.`);
      console.log('   To re-seed, delete existing products first.\n');
      return;
    }

    // Insert products
    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (error) {
      console.error('❌ Error inserting products:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully added ${data.length} products!\n`);
    
    // Display summary
    const brands = [...new Set(data.map(p => p.brand))];
    console.log('📦 Brands added:');
    brands.forEach(brand => {
      const count = data.filter(p => p.brand === brand).length;
      console.log(`   - ${brand}: ${count} products`);
    });
    
    console.log('\n🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedDatabase();

