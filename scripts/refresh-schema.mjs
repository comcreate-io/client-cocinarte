/**
 * Refresh Supabase PostgREST schema cache
 * Run with: node scripts/refresh-schema.mjs
 */

import pkg from 'pg';
const { Client } = pkg;

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

async function refreshSchema() {
  console.log('🔄 Refreshing Supabase schema cache...\n');

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Send the NOTIFY command to reload schema
    await client.query("NOTIFY pgrst, 'reload schema'");

    console.log('✅ Schema cache refresh triggered!\n');
    console.log('📋 What happens next:');
    console.log('   - PostgREST will reload the database schema');
    console.log('   - New tables (parents, children) will be accessible via API');
    console.log('   - This usually takes a few seconds\n');

    console.log('🧪 Test by running:');
    console.log('   npx tsx scripts/check-tables.ts\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Use Supabase Dashboard');
    console.log('   1. Go to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/settings/api');
    console.log('   2. Click "Restart PostgREST" or run this SQL:');
    console.log("      NOTIFY pgrst, 'reload schema';");
  } finally {
    await client.end();
  }
}

refreshSchema();
