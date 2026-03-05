import pg from 'pg'
import dotenv from 'dotenv'

const { Client } = pg

dotenv.config({ path: '.env.local' })

let connectionString = process.env.DATABASE_URL

// If DATABASE_URL is not set, try to construct it from NEXT_PUBLIC_SUPABASE_URL
if (!connectionString && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('⚠️  DATABASE_URL not found, attempting to construct from NEXT_PUBLIC_SUPABASE_URL...')
  console.log('📝 Please enter your Supabase database password:')

  console.error('\n❌ Cannot proceed without DATABASE_URL')
  console.error('\nPlease add your Supabase PostgreSQL connection string to .env.local:')
  console.error('DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:[YOUR-PASSWORD]@aws-0-YOUR-REGION.pooler.supabase.com:6543/postgres')
  console.error('\nYou can find this in your Supabase Dashboard:')
  console.error('1. Go to Project Settings → Database')
  console.error('2. Copy the "Connection string" under "Connection pooling"')
  console.error('3. Make sure to use "Transaction" mode')
  console.error('4. Replace [YOUR-PASSWORD] with your actual database password')
  process.exit(1)
}

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  console.log('🚀 Starting age range migration...\n')
  console.log('🔌 Connecting to database...')

  try {
    await client.connect()
    console.log('✅ Connected successfully!\n')

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

    console.log('📝 Executing SQL migration...')
    console.log('─'.repeat(60))
    console.log(migrationSQL)
    console.log('─'.repeat(60))
    console.log('')

    await client.query(migrationSQL)

    console.log('✅ Migration completed successfully!')

    // Verify the columns were added
    console.log('\n🔍 Verifying columns...')
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clases'
      AND column_name IN ('min_age', 'max_age')
      ORDER BY column_name;
    `)

    if (result.rows.length === 2) {
      console.log('✅ Verification successful!')
      console.log('\n📊 Columns added:')
      result.rows.forEach(row => {
        console.log(`   • ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
      console.log('\n✨ Age range restrictions are now available for classes!')
    } else {
      console.warn('⚠️  Warning: Expected 2 columns, found', result.rows.length)
    }

  } catch (error) {
    console.error('\n❌ Error running migration:', error.message)
    console.error('\n💡 Tip: Make sure your DATABASE_URL is correct in .env.local')
    console.error('   Format: postgresql://postgres.YOUR_PROJECT_REF:[PASSWORD]@aws-0-YOUR-REGION.pooler.supabase.com:6543/postgres')
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Database connection closed')
  }
}

runMigration()
