import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) { console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const migrationPath = join(__dirname, '../supabase/migrations/20251120151859_create_party_requests_table.sql')
const sql = readFileSync(migrationPath, 'utf8')

console.log('Running migration: create_party_requests_table')
console.log('=' .repeat(50))

try {
  // Execute the SQL using a direct query
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

  if (error) {
    console.error('Error executing migration:', error)
    process.exit(1)
  }

  console.log('✓ Migration executed successfully!')
  console.log('✓ party_requests table created')
  console.log('✓ Indexes created')
  console.log('✓ Row Level Security policies applied')
  console.log('✓ Triggers configured')

} catch (err) {
  console.error('Failed to run migration:', err.message)
  console.log('\nAlternative: Run the SQL manually in Supabase Dashboard:')
  console.log('1. Go to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/sql/new')
  console.log('2. Copy the SQL from: supabase/migrations/20251120151859_create_party_requests_table.sql')
  console.log('3. Paste and run in the SQL Editor')
  process.exit(1)
}
