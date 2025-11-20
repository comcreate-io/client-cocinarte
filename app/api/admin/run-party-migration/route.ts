import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // The SQL for creating the party_requests table
    const createTableSQL = `
      -- Create party_requests table
      create table if not exists party_requests (
        id uuid primary key default gen_random_uuid(),
        preferred_date timestamp with time zone not null,
        number_of_children integer not null,
        package text not null,
        parent_name text not null,
        phone text not null,
        email text not null,
        child_name_age text,
        special_requests text,
        status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
        admin_notes text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `

    const createIndexStatus = `create index if not exists idx_party_requests_status on party_requests(status);`
    const createIndexCreatedAt = `create index if not exists idx_party_requests_created_at on party_requests(created_at desc);`
    const enableRLS = `alter table party_requests enable row level security;`

    const createPolicyInsert = `
      create policy if not exists "Allow public inserts" on party_requests
        for insert
        with check (true);
    `

    const createPolicySelect = `
      create policy if not exists "Allow authenticated users to view all" on party_requests
        for select
        using (auth.role() = 'authenticated');
    `

    const createPolicyUpdate = `
      create policy if not exists "Allow authenticated users to update" on party_requests
        for update
        using (auth.role() = 'authenticated')
        with check (auth.role() = 'authenticated');
    `

    const createFunction = `
      create or replace function update_updated_at_column()
      returns trigger as $$
      begin
        new.updated_at = timezone('utc'::text, now());
        return new;
      end;
      $$ language plpgsql;
    `

    const createTrigger = `
      drop trigger if exists update_party_requests_updated_at on party_requests;
      create trigger update_party_requests_updated_at
        before update on party_requests
        for each row
        execute function update_updated_at_column();
    `

    const steps = [
      { name: 'Create table', sql: createTableSQL },
      { name: 'Create status index', sql: createIndexStatus },
      { name: 'Create created_at index', sql: createIndexCreatedAt },
      { name: 'Enable RLS', sql: enableRLS },
      { name: 'Create insert policy', sql: createPolicyInsert },
      { name: 'Create select policy', sql: createPolicySelect },
      { name: 'Create update policy', sql: createPolicyUpdate },
      { name: 'Create update function', sql: createFunction },
      { name: 'Create trigger', sql: createTrigger }
    ]

    const results = []

    for (const step of steps) {
      try {
        const { error } = await supabase.rpc('exec', { sql: step.sql })
        results.push({
          step: step.name,
          success: !error,
          error: error?.message || null
        })
      } catch (err: any) {
        // Try direct query method
        results.push({
          step: step.name,
          success: false,
          error: err.message,
          note: 'RPC method not available, please run SQL manually'
        })
      }
    }

    return NextResponse.json({
      message: 'Migration execution attempted',
      results,
      instruction: 'If RPC method failed, please run the SQL manually in Supabase Dashboard SQL Editor'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
