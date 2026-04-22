/**
 * Script to apply migrations using PostgreSQL directly
 * Run with: node scripts/run-migrations.mjs
 */

import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Connection details with SSL configuration
// Set DB_USER and DB_PASSWORD env vars before running
const connectionConfig = {
  host: process.env.DB_HOST || 'aws-1-us-east-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '6543'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
};

if (!connectionConfig.user || !connectionConfig.password) {
  console.error('Missing required env vars: DB_USER, DB_PASSWORD');
  process.exit(1);
}

async function runMigration(client, filePath, fileName) {
  console.log(`\n📄 Applying migration: ${fileName}`);
  console.log('='.repeat(60));

  try {
    const sql = readFileSync(filePath, 'utf-8');

    // Execute the entire SQL file as one transaction
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log(`✅ Successfully applied: ${fileName}`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Error applying ${fileName}:`);
    console.error(error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migration process...');
  console.log('📍 Connecting to Supabase PostgreSQL...\n');

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

    const migrations = [
      {
        file: '20251120145601_add_comprehensive_student_parent_info.sql',
        name: 'Add comprehensive student/parent info'
      },
      {
        file: '20251120161733_create_parents_children_tables.sql',
        name: 'Create parents and children tables'
      },
      {
        file: '20251120151859_create_party_requests_table.sql',
        name: 'Create party requests table'
      },
      {
        file: '20251120170000_add_child_id_to_bookings.sql',
        name: 'Add child_id to bookings table'
      },
      {
        file: '20251120180000_create_invoices_table.sql',
        name: 'Create invoices table'
      }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
      const filePath = join(migrationsDir, migration.file);
      const success = await runMigration(client, filePath, migration.name);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('='.repeat(60));

    if (failCount === 0) {
      console.log('\n🎉 All migrations applied successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Verify tables in Supabase Dashboard');
      console.log('2. Test signup: npm run dev, then visit /signup');
      console.log('3. Test account page: /account');
    } else {
      console.log('\n⚠️  Some migrations failed. Check errors above.');
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
