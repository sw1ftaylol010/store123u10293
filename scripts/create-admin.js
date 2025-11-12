const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Supabase environment variables not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log('🔐 Creating admin user...\n');

  const adminEmail = '123aijsdfhAwe08912eA@asihjfbO.comasIAUG';
  const adminPassword = 'aoishf1Q(*24yOAIf)129028y4012hjf)Asdy91n';

  try {
    // Create the admin user
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Super Admin',
        role: 'super_admin'
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('⚠️  User already exists!');
        console.log('\n✅ Admin credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`\n🌐 Login at: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/en/auth/signin`);
        return;
      }
      throw signUpError;
    }

    console.log('✅ Admin user created successfully!');
    console.log(`\n📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`\n👤 User ID: ${user.user.id}`);
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.user.id,
        email: adminEmail,
        full_name: 'Super Admin',
        role: 'super_admin',
        preferred_language: 'en',
        preferred_currency: 'USD'
      });

    if (profileError) {
      console.log('\n⚠️  Warning: Could not create user profile (table might not exist yet)');
      console.log('   This is OK if you haven\'t run migrations yet.');
    } else {
      console.log('✅ User profile created with admin role!');
    }

    console.log(`\n🌐 You can now login at: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/en/auth/signin`);
    console.log('\n🎉 Admin setup complete!');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();

