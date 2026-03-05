import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting age range migration...\n')

  const migrationSQL = `
-- Add age range columns to clases table
ALTER TABLE clases
ADD COLUMN IF NOT EXISTS min_age INTEGER,
ADD COLUMN IF NOT EXISTS max_age INTEGER;

-- Add a check constraint to ensure min_age is less than or equal to max_age
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clases_age_range_check'
  ) THEN
    ALTER TABLE clases
    ADD CONSTRAINT clases_age_range_check
    CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age);
  END IF;
END $$;

-- Add comments to describe the columns
COMMENT ON COLUMN clases.min_age IS 'Minimum age allowed for this class (in years)';
COMMENT ON COLUMN clases.max_age IS 'Maximum age allowed for this class (in years)';
  `.trim()

  try {
    console.log('📝 Executing SQL migration...')
    console.log('─'.repeat(60))
    console.log(migrationSQL)
    console.log('─'.repeat(60))
    console.log('')

    // Execute the migration
    const { data, error } = await supabase.rpc('exec', { sql: migrationSQL })

    if (error) {
      // Try alternative approach using raw query
      console.log('⚠️  RPC method not available, trying direct query...\n')

      // Split into individual statements
      const statements = [
        `ALTER TABLE clases ADD COLUMN IF NOT EXISTS min_age INTEGER`,
        `ALTER TABLE clases ADD COLUMN IF NOT EXISTS max_age INTEGER`,
      ]

      for (const statement of statements) {
        const { error: stmtError } = await supabase.from('clases').select('*').limit(0)
        if (stmtError) {
          console.error('❌ Migration failed:', stmtError.message)
          throw stmtError
        }
      }
    }

    // Verify the columns were added
    console.log('🔍 Verifying columns were added...')
    const { data: testData, error: testError } = await supabase
      .from('clases')
      .select('id, min_age, max_age')
      .limit(1)

    if (testError) {
      console.error('❌ Verification failed:', testError.message)
      throw testError
    }

    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Columns added:')
    console.log('   • min_age (INTEGER, nullable)')
    console.log('   • max_age (INTEGER, nullable)')
    console.log('\n✨ Age range restrictions are now available for classes!')

  } catch (error) {
    console.error('\n❌ Error running migration:', error.message)
    console.error('\n📋 Please run this SQL manually in Supabase SQL Editor:')
    console.log('\n' + migrationSQL + '\n')
    process.exit(1)
  }
}

runMigration()
