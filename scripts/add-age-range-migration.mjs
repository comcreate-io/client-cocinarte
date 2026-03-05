import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Adding age range columns to clases table...')

  try {
    // Add columns using raw SQL
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE clases
        ADD COLUMN IF NOT EXISTS min_age INTEGER,
        ADD COLUMN IF NOT EXISTS max_age INTEGER;
      `
    })

    if (alterError) {
      // Try direct query if RPC doesn't exist
      const { error } = await supabase.from('clases').select('min_age, max_age').limit(1)

      if (error && error.message.includes('column') && error.message.includes('does not exist')) {
        console.error('Cannot add columns directly. Please run this SQL in your Supabase SQL editor:')
        console.log(`
-- Add age range columns to clases table
ALTER TABLE clases
ADD COLUMN IF NOT EXISTS min_age INTEGER,
ADD COLUMN IF NOT EXISTS max_age INTEGER;

-- Add a check constraint to ensure min_age is less than or equal to max_age
ALTER TABLE clases
ADD CONSTRAINT clases_age_range_check
CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age);

-- Add comments to describe the columns
COMMENT ON COLUMN clases.min_age IS 'Minimum age allowed for this class (in years)';
COMMENT ON COLUMN clases.max_age IS 'Maximum age allowed for this class (in years)';
        `)
        process.exit(1)
      } else if (!error) {
        console.log('✓ Columns already exist or were successfully added')
      }
    } else {
      console.log('✓ Successfully added age range columns')
    }

    console.log('✓ Migration completed successfully')
  } catch (error) {
    console.error('Error running migration:', error)
    process.exit(1)
  }
}

runMigration()
