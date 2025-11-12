require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Извлекаем компоненты из Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'wAt25FlkFuZh67Ov';

if (!supabaseUrl || !dbPassword) {
  console.error('❌ Ошибка: не установлены переменные окружения NEXT_PUBLIC_SUPABASE_URL и SUPABASE_DB_PASSWORD');
  process.exit(1);
}

// Построить DATABASE_URL из компонентов
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
const DB_HOST = `db.${projectRef}.supabase.co`;
const DB_PORT = 5432;
const DB_USER = 'postgres';
const DB_NAME = 'postgres';

const DATABASE_URL = `postgresql://${DB_USER}:${dbPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log('🚀 Начинаем настройку базы данных Supabase...');
console.log(`📍 Хост: ${DB_HOST}`);

async function executeSqlFile(filePath, client) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  console.log(`\n📄 Выполняем: ${fileName}`);
  
  try {
    await client.query(sql);
    console.log(`✅ Успешно выполнен ${fileName}`);
  } catch (error) {
    console.error(`❌ Ошибка при выполнении ${fileName}:`, error.message);
    throw error;
  }
}

async function runSetup() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Необходимо для Supabase
    },
  });

  try {
    console.log('\n🔌 Подключаемся к PostgreSQL...');
    await client.connect();
    console.log('✅ Подключение установлено!');

    // Выполняем миграции по порядку
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrationFiles = [
      '20240101000000_initial_schema.sql',
      '20240101000001_seed_data.sql',
      '20250115000000_marketing_features_base.sql',
      '20250115100000_email_campaigns.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        await executeSqlFile(filePath, client);
      } else {
        console.log(`⚠️ Файл ${file} не найден, пропускаем...`);
      }
    }

    console.log('\n🎉 База данных успешно настроена!');
    console.log('\n✨ Теперь вы можете запустить приложение:');
    console.log('   1. На сервере: pm2 restart gift-cards');
    console.log('   2. Локально: npm run dev');

  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error.message);
    console.log('\n📋 ЕСЛИ ОШИБКА ПРОДОЛЖАЕТСЯ:');
    console.log('1. Откройте Supabase Dashboard');
    console.log('2. Перейдите в SQL Editor');
    console.log('3. Скопируйте и выполните файлы из папки supabase/migrations вручную');
  } finally {
    await client.end();
    console.log('\n🔌 Отключено от базы данных.');
  }
}

runSetup();

