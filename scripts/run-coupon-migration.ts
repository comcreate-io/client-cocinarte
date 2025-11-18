import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('Running coupon table migration...')

  // Read the migration SQL
  const migrationSQL = `
-- Create coupons table for discount coupon system
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  class_id UUID,
  is_used BOOLEAN DEFAULT FALSE,
  used_by_user_id UUID,
  used_at TIMESTAMP WITH TIME ZONE,
  recipient_email VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_used ON coupons(is_used);
CREATE INDEX IF NOT EXISTS idx_coupons_class_id ON coupons(class_id);
CREATE INDEX IF NOT EXISTS idx_coupons_recipient_email ON coupons(recipient_email);
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at DESC);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed for your RLS policies)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read coupons (for validation)
CREATE POLICY "Allow authenticated users to read coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role full access to coupons (admin dashboard)
CREATE POLICY "Allow service role full access to coupons"
  ON coupons FOR ALL
  TO service_role
  USING (true);
  `

  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

  if (error) {
    console.error('❌ Error running migration:', error)
    console.log('\n⚠️  The RPC method might not be available. You need to run the migration manually.')
    console.log('\n📋 Copy the SQL from: supabase/migrations/20251118161410_create_coupons_table.sql')
    console.log('🔗 Run it in your Supabase Dashboard: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu/sql')
    process.exit(1)
  }

  console.log('✅ Migration completed successfully!')
  console.log('Result:', data)
}

runMigration()
