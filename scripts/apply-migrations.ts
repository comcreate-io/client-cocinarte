/**
 * Script to apply all pending migrations to Supabase
 * Run with: npx tsx scripts/apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in environment')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQLFile(filePath: string) {
  console.log(`\n📄 Reading migration: ${path.basename(filePath)}`)

  const sql = fs.readFileSync(filePath, 'utf-8')

  // Split by semicolons but be careful with DO blocks
  const statements = []
  let currentStatement = ''
  let inDoBlock = false

  for (const line of sql.split('\n')) {
    currentStatement += line + '\n'

    if (line.trim().toUpperCase().startsWith('DO $$')) {
      inDoBlock = true
    }

    if (inDoBlock && line.trim() === '$$;') {
      inDoBlock = false
      statements.push(currentStatement.trim())
      currentStatement = ''
      continue
    }

    if (!inDoBlock && line.trim().endsWith(';')) {
      statements.push(currentStatement.trim())
      currentStatement = ''
    }
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim())
  }

  console.log(`📝 Found ${statements.length} SQL statements`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]

    // Skip empty statements and comments
    if (!statement || statement.startsWith('--') || statement.trim() === '') {
      continue
    }

    const preview = statement.substring(0, 60).replace(/\n/g, ' ')

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_string: statement
      })

      if (error) {
        console.log(`   ⚠️  [${i + 1}/${statements.length}] Warning: ${preview}...`)
        console.log(`       ${error.message}`)
        errorCount++
      } else {
        console.log(`   ✅ [${i + 1}/${statements.length}] Success: ${preview}...`)
        successCount++
      }
    } catch (err: any) {
      console.log(`   ⚠️  [${i + 1}/${statements.length}] Error: ${preview}...`)
      console.log(`       ${err.message}`)
      errorCount++
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n✅ Completed: ${successCount} successful, ${errorCount} warnings/errors`)

  return { successCount, errorCount }
}

async function applyMigrations() {
  console.log('🚀 Starting migration process...')
  console.log(`📍 Target: ${supabaseUrl}\n`)

  const migrationsDir = path.join(process.cwd(), 'supabase/migrations')

  const migrationFiles = [
    '20251120145601_add_comprehensive_student_parent_info.sql',
    '20251120161733_create_parents_children_tables.sql'
  ]

  let totalSuccess = 0
  let totalErrors = 0

  for (const filename of migrationFiles) {
    const filePath = path.join(migrationsDir, filename)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Migration file not found: ${filename}`)
      continue
    }

    try {
      const { successCount, errorCount } = await executeSQLFile(filePath)
      totalSuccess += successCount
      totalErrors += errorCount
    } catch (err: any) {
      console.error(`❌ Failed to execute ${filename}:`, err.message)
      totalErrors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Migration Summary')
  console.log('='.repeat(60))
  console.log(`✅ Total successful statements: ${totalSuccess}`)
  console.log(`⚠️  Total warnings/errors: ${totalErrors}`)
  console.log('='.repeat(60))

  if (totalErrors > 0) {
    console.log('\n⚠️  Some statements failed. This may be expected if:')
    console.log('   - Tables/columns already exist')
    console.log('   - Some operations are not supported via RPC')
    console.log('   - Permissions are restricted')
    console.log('\n💡 Please verify in Supabase Dashboard that tables were created:')
    console.log('   - parents table')
    console.log('   - children table')
  } else {
    console.log('\n🎉 All migrations applied successfully!')
  }

  console.log('\n📋 Next steps:')
  console.log('1. Verify tables in Supabase Dashboard > Database > Tables')
  console.log('2. Test signup flow at /signup')
  console.log('3. Check account page at /account')
}

applyMigrations().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
