/**
 * Script to apply student migration directly to Supabase
 * Run with: npx tsx scripts/run-migration-direct.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const migrationStatements = [
  // Child Information fields
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS child_full_name VARCHAR(255)`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS child_age INTEGER`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS child_preferred_name VARCHAR(255)`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS has_cooking_experience BOOLEAN DEFAULT false`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS cooking_experience_details TEXT`,

  // Health & Safety fields
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS allergies TEXT`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS medical_conditions TEXT`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_medications TEXT`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS additional_notes TEXT`,

  // Parent Information fields (enhanced)
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_guardian_names TEXT`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(50)`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255)`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS preferred_communication_method VARCHAR(50) DEFAULT 'email'`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255)`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50)`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100)`,

  // Pick-Up Information fields
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS authorized_pickup_persons TEXT`,
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS custody_restrictions TEXT`,

  // Media & Photos field
  `ALTER TABLE students ADD COLUMN IF NOT EXISTS media_permission BOOLEAN DEFAULT false`,

  // Update existing child_name to be nullable
  `ALTER TABLE students ALTER COLUMN child_name DROP NOT NULL`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_students_child_full_name ON students(child_full_name)`,
  `CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email)`,
  `CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone)`,
  `CREATE INDEX IF NOT EXISTS idx_students_child_age ON students(child_age)`,

  // Drop old unique constraint
  `DROP INDEX IF EXISTS uq_students_parent_child_email`,

  // Create new unique constraint
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_students_parent_email_child_full_name
   ON students (LOWER(parent_email), LOWER(child_full_name))
   WHERE parent_email IS NOT NULL AND child_full_name IS NOT NULL`
]

async function runMigration() {
  console.log('🚀 Starting migration...\n')

  for (let i = 0; i < migrationStatements.length; i++) {
    const statement = migrationStatements[i]
    console.log(`[${i + 1}/${migrationStatements.length}] Executing: ${statement.substring(0, 60)}...`)

    try {
      // Use the REST API to execute SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query: statement })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`   ⚠️  Warning: ${errorText.substring(0, 100)}`)
      } else {
        console.log(`   ✅ Success`)
      }
    } catch (error: any) {
      console.log(`   ⚠️  Error (may be expected): ${error.message}`)
    }
  }

  console.log('\n✅ Migration execution completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Go to Supabase Dashboard > Database > Tables')
  console.log('2. Check the "students" table to verify new columns')
  console.log('3. Test the signup flow at /signup')
}

runMigration().catch(console.error)
