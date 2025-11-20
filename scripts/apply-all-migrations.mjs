/**
 * Apply all pending migrations using Supabase API
 * Run with: node scripts/apply-all-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mwipqlvteowoyipbozyu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXBxbHZ0ZW93b3lpcGJvenl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQzMDAyMSwiZXhwIjoyMDc1MDA2MDIxfQ.QjIjGc7k_Ef3KmLy-8XTSoON-UukQyyNl693kji6Evo'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(filePath, fileName) {
  console.log(`\n📄 Applying migration: ${fileName}`)
  console.log('='.repeat(60))

  try {
    const sql = readFileSync(filePath, 'utf-8')

    // Execute the SQL using Supabase's RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      throw error
    }

    console.log(`✅ Successfully applied: ${fileName}`)
    return true
  } catch (error) {
    console.error(`❌ Error applying ${fileName}:`)
    console.error(error.message)
    console.log('\n💡 This migration might already be applied, or you need to run it via Supabase Dashboard')
    return false
  }
}

async function main() {
  console.log('🚀 Starting database migration process...')
  console.log('📍 Using Supabase API\n')

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')

  const migrations = [
    {
      file: '20251120170000_add_child_id_to_bookings.sql',
      name: 'Add child_id to bookings table'
    },
    {
      file: '20251120180000_create_invoices_table.sql',
      name: 'Create invoices table'
    }
  ]

  console.log('⚠️  Note: Direct SQL execution via API is restricted by Supabase.')
  console.log('📋 Recommended approach: Use Supabase Dashboard SQL Editor\n')
  console.log('Please apply these migrations manually:')
  console.log('='.repeat(60))

  for (const migration of migrations) {
    console.log(`\n📄 Migration: ${migration.name}`)
    console.log(`📂 File: supabase/migrations/${migration.file}`)
    console.log(`🔗 Go to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/sql/new`)
    console.log('   1. Copy the SQL from the file above')
    console.log('   2. Paste it in the SQL Editor')
    console.log('   3. Click "Run"')
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 Quick Copy Commands:')
  console.log('='.repeat(60))

  for (const migration of migrations) {
    const filePath = join(migrationsDir, migration.file)
    console.log(`\n# ${migration.name}`)
    console.log(`cat ${filePath}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Alternative: Use the refresh-schema.mjs script after manual migration')
  console.log('='.repeat(60))
  console.log('node scripts/refresh-schema.mjs')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
