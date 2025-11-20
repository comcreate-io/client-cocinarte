/**
 * Check what tables exist using Supabase client
 * Run with: npx tsx scripts/check-tables.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Checking existing tables...\n')

  const tables = ['students', 'parents', 'children', 'party_requests']

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ Table '${table}' does NOT exist`)
        } else {
          console.log(`⚠️  Table '${table}' exists but error: ${error.message}`)
        }
      } else {
        console.log(`✅ Table '${table}' exists (${data?.length || 0} sample records)`)
      }
    } catch (err: any) {
      console.log(`❌ Table '${table}' - ${err.message}`)
    }
  }

  console.log('\n📋 Summary:')
  console.log('If parents/children tables are missing, you need to apply migrations.')
  console.log('Use Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/sql/new')
}

checkTables()
