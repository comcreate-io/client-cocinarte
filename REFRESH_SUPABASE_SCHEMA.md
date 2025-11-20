# Refresh Supabase Schema Cache

## Issue
The tables `parents`, `children`, and `party_requests` exist in the database but are not visible to the Supabase API. This is because the PostgREST schema cache needs to be refreshed.

## Solution

### Method 1: Restart PostgREST (Recommended)

1. Go to Supabase Dashboard
2. Navigate to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/settings/api
3. Scroll down to "API Settings"
4. Click "Restart PostgREST" or "Reload Schema Cache"

### Method 2: Use SQL to Refresh

1. Go to SQL Editor: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/sql/new
2. Run this command:

```sql
NOTIFY pgrst, 'reload schema';
```

3. Click "Run"

### Method 3: Wait (Not Recommended)

The cache will eventually refresh automatically (can take several minutes to hours).

## Verify It Worked

After refreshing, check if the tables are accessible:

1. Go to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/editor
2. You should see:
   - ✅ parents
   - ✅ children
   - ✅ party_requests
3. Click on each table to view/edit data

## Why This Happens

Supabase uses PostgREST to auto-generate REST APIs from your PostgreSQL schema. When you add new tables directly via SQL (not through Supabase migrations), PostgREST doesn't immediately know about them. The schema cache needs to be refreshed.

## After Refreshing

Your application will be able to:
- ✅ Create parent records
- ✅ Create children records
- ✅ Query parents with children
- ✅ Use the ChildrenManagement component
- ✅ Complete multi-child signup flow

## Quick Test

Run this to verify tables are accessible:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://mwipqlvteowoyipbozyu.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXBxbHZ0ZW93b3lpcGJvenl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzAwMjEsImV4cCI6MjA3NTAwNjAyMX0.NndYYg5QRHpHaETFRvx2dm2Sf-oI4a49zYUNJKqvgxA" \
npx tsx scripts/check-tables.ts
```

You should see all ✅ green checkmarks.
