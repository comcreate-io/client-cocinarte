import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCouponsTable() {
  try {
    console.log('Creating coupons table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code VARCHAR(6) NOT NULL UNIQUE,
        discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
        is_used BOOLEAN DEFAULT FALSE,
        used_by_user_id UUID,
        used_at TIMESTAMP WITH TIME ZONE,
        recipient_email VARCHAR(255),
        sent_at TIMESTAMP WITH TIME ZONE,
        created_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
      CREATE INDEX IF NOT EXISTS idx_coupons_is_used ON coupons(is_used);
      CREATE INDEX IF NOT EXISTS idx_coupons_recipient_email ON coupons(recipient_email);
      CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at DESC);

      CREATE TRIGGER update_coupons_updated_at
          BEFORE UPDATE ON coupons
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createTableSQL })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Direct SQL execution not available or failed.');
      console.log(errorText);
      console.log('\nPlease run the SQL script manually in your Supabase dashboard:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the following SQL:\n');
      console.log(createTableSQL);
      return;
    }

    console.log('✅ Coupons table created or already exists.');

  } catch (error) {
    console.error('❌ Error creating coupons table:', error);
    console.log('\nAlternative: Please run the SQL script manually:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL from above');
    console.log('4. Execute the SQL');
  }
}

createCouponsTable();
