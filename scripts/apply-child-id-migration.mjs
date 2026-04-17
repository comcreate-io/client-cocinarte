/**
 * Apply child_id migration to bookings table
 * Run with: node scripts/apply-child-id-migration.mjs
 */

import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

async function applyMigration() {
  console.log('🚀 Applying child_id migration to bookings table...\n');

  const client = new Client(connectionConfig);

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251120170000_add_child_id_to_bookings.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Applying migration...');
    await client.query(sql);

    console.log('✅ Migration applied successfully!\n');

    // Refresh schema cache
    console.log('🔄 Refreshing schema cache...');
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log('✅ Schema cache refreshed!\n');

    console.log('🎉 Done! The bookings table now has the child_id column.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    console.log('\n💡 Alternative: Apply via Supabase Dashboard');
    console.log('   1. Go to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/sql/new');
    console.log('   2. Copy the SQL from: supabase/migrations/20251120170000_add_child_id_to_bookings.sql');
    console.log('   3. Click "Run"');
    console.log('   4. Then run: NOTIFY pgrst, \'reload schema\';');
    process.exit(1);
  } finally {
    try {
      await client.end();
      console.log('\n👋 Database connection closed');
    } catch (err) {
      // Ignore close errors
    }
  }
}

applyMigration();
