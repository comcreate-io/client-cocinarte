import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
  try {
    console.log('Creating clases table...');
    
    // First, let's try to create the table by attempting to insert a record
    // This will fail if the table doesn't exist, but we can catch that
    const testRecord = {
      title: 'Test Class',
      description: 'Test description',
      date: '2024-01-01',
      time: '10:00:00',
      minStudents: 1,
      maxStudents: 5,
      price: 10.00,
      classDuration: 30
    };

    const { data, error } = await supabase
      .from('clases')
      .insert([testRecord]);

    if (error) {
      console.log('Table does not exist yet. Creating it...');
      
      // Since we can't execute raw SQL directly, let's provide the SQL for manual execution
      console.log('\n=== MANUAL SETUP REQUIRED ===');
      console.log('Please execute the following SQL in your Supabase dashboard:');
      console.log('1. Go to https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the SQL below:');
      console.log('\n--- SQL TO EXECUTE ---');
      console.log(`
CREATE TABLE IF NOT EXISTS clases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  minStudents INTEGER NOT NULL DEFAULT 1,
  maxStudents INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  classDuration INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clases_date ON clases(date);
CREATE INDEX IF NOT EXISTS idx_clases_time ON clases(time);

-- Insert sample data
INSERT INTO clases (title, description, date, time, minStudents, maxStudents, price, classDuration) VALUES
('Spanish for Beginners', 'Learn basic Spanish vocabulary and grammar', '2024-02-15', '10:00:00', 3, 8, 25.00, 60),
('Advanced Conversation', 'Practice Spanish conversation with native speakers', '2024-02-16', '18:00:00', 2, 6, 35.00, 90),
('Spanish Grammar Workshop', 'Deep dive into Spanish grammar rules and exceptions', '2024-02-17', '14:00:00', 4, 10, 30.00, 75),
('Kids Spanish Fun', 'Interactive Spanish learning for children ages 6-12', '2024-02-18', '16:00:00', 5, 12, 20.00, 45);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clases_updated_at 
    BEFORE UPDATE ON clases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
      `);
      console.log('\n--- END SQL ---');
      console.log('\nAfter running the SQL, the table will be created with sample data.');
      return;
    }

    console.log('✅ Table already exists!');
    console.log('Sample data:', data);

  } catch (error) {
    console.error('Error:', error);
  }
}

createTable();
