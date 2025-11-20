import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - you can add a secret key here
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET || 'run-migration-secret'}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/20251120151859_create_party_requests_table.sql')
    const sql = readFileSync(migrationPath, 'utf8')

    // Split into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    const results = []

    for (const statement of statements) {
      try {
        // Use the from() method with a raw SQL query
        const { error } = await supabase.rpc('exec', { sql: statement })

        if (error) {
          results.push({
            statement: statement.substring(0, 100),
            success: false,
            error: error.message
          })
        } else {
          results.push({
            statement: statement.substring(0, 100),
            success: true
          })
        }
      } catch (err: any) {
        results.push({
          statement: statement.substring(0, 100),
          success: false,
          error: err.message
        })
      }
    }

    return NextResponse.json({
      message: 'Migration execution attempted',
      results
    })

  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
