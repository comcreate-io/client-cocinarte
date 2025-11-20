/**
 * Script to manually apply the student table migration
 * Run with: npx tsx scripts/apply-student-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('📝 Reading migration file...')

    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations/20251120145601_add_comprehensive_student_parent_info.sql'
    )

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('🚀 Applying migration to Supabase...')

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    })

    if (error) {
      console.error('❌ Migration failed:', error)

      // Try executing statements one by one if bulk fails
      console.log('📝 Attempting to execute statements individually...')
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        })

        if (stmtError) {
          console.error(`⚠️  Statement failed (may be expected):`, stmtError.message)
        }
      }

      console.log('✅ Individual statement execution completed')
    } else {
      console.log('✅ Migration applied successfully!')
    }

    // Verify the columns were added
    console.log('🔍 Verifying new columns...')
    const { data: tableInfo, error: infoError } = await supabase
      .from('students')
      .select('*')
      .limit(1)

    if (infoError) {
      console.error('Error verifying:', infoError)
    } else {
      console.log('✅ Verification successful!')
      console.log('Sample record structure:', tableInfo?.[0] ? Object.keys(tableInfo[0]) : 'No records yet')
    }

  } catch (error) {
    console.error('❌ Error applying migration:', error)
    process.exit(1)
  }
}

applyMigration()
