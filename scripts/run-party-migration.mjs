/**
 * Script to run the party_requests migration
 * Run with: node scripts/run-party-migration.mjs
 */

import pkg from 'pg';
const { Client } = pkg;
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('🚀 Running party_requests migration...\n');

  if (!process.env.DATABASE_URL) {
    console.error('Missing required env var: DATABASE_URL');
    console.error('Example: DATABASE_URL="postgresql://user:pass@host:port/db" node scripts/run-party-migration.mjs');
    process.exit(1);
  }

  // Connection configurations to try
  const configs = [
    {
      name: 'Database connection',
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  ];

  for (const config of configs) {
    console.log(`Trying: ${config.name}...`);

    const client = new Client({
      connectionString: config.connectionString,
      ssl: config.ssl
    });

    try {
      await client.connect();
      console.log('✅ Connected!\n');

      const migrationPath = join(__dirname, '../supabase/migrations/20251120151859_create_party_requests_table.sql');
      const sql = readFileSync(migrationPath, 'utf-8');

      console.log('📄 Executing migration SQL...');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');

      console.log('✅ Migration successful!\n');
      console.log('='.repeat(60));
      console.log('✓ party_requests table created');
      console.log('✓ Indexes created');
      console.log('✓ Row Level Security enabled');
      console.log('✓ Triggers configured');
      console.log('='.repeat(60));

      // Verify
      const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'party_requests'
      `);

      if (result.rows.length > 0) {
        console.log('\n✅ Verified: party_requests table exists!\n');
        console.log('🎉 Next steps:');
        console.log('   1. Restart your dev server: npm run dev');
        console.log('   2. Visit: http://localhost:3000/dashboard/party-requests');
        console.log('   3. Test submitting a party request');
      }

      await client.end();
      process.exit(0);

    } catch (error) {
      try {
        await client.end();
      } catch (e) {}
      
      console.log(`❌ Failed: ${error.message}\n`);

      if (config === configs[configs.length - 1]) {
        console.error('\n⚠️  All connection attempts failed.\n');
        console.error('Manual steps:');
        console.error('1. Go to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/sql/new');
        console.error('2. Copy and paste the SQL from:');
        console.error('   supabase/migrations/20251120151859_create_party_requests_table.sql');
        console.error('3. Click "Run"\n');
        process.exit(1);
      }
    }
  }
}

main();
