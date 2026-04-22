import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTableViaClient() {
  try {
    console.log('Attempting to create table via Supabase client...');
    
    // Try to create the table by attempting to insert a record
    // This will fail if the table doesn't exist, but we can use that to our advantage
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

    console.log('Testing if table exists...');
    const { data, error } = await supabase
      .from('clases')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Table does not exist. Creating it via SQL...');
      
      // Use the management API to execute SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ 
          sql: `CREATE TABLE IF NOT EXISTS clases (
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
          );`
        })
      });

      if (!response.ok) {
        console.log('Direct SQL execution not available. Using alternative method...');
        
        // Try using the Supabase management API
        const mgmtResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ 
            sql: `CREATE TABLE IF NOT EXISTS clases (
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
            );`
          })
        });

        if (!mgmtResponse.ok) {
          console.log('❌ Cannot create table programmatically.');
          console.log('Please create the table manually in your Supabase dashboard.');
          console.log('\nGo to: https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu');
          console.log('Navigate to SQL Editor and run the SQL from create-clases-table.sql');
          return;
        }
      }

      console.log('✅ Table creation attempted via API');
    } else {
      console.log('✅ Table already exists!');
    }

    // Now try to insert sample data
    console.log('Inserting sample data...');
    const sampleData = [
      {
        title: 'Spanish for Beginners',
        description: 'Learn basic Spanish vocabulary and grammar',
        date: '2024-02-15',
        time: '10:00:00',
        minStudents: 3,
        maxStudents: 8,
        price: 25.00,
        classDuration: 60
      },
      {
        title: 'Advanced Conversation',
        description: 'Practice Spanish conversation with native speakers',
        date: '2024-02-16',
        time: '18:00:00',
        minStudents: 2,
        maxStudents: 6,
        price: 35.00,
        classDuration: 90
      }
    ];

    const { data: insertData, error: insertError } = await supabase
      .from('clases')
      .insert(sampleData);

    if (insertError) {
      console.log('Could not insert sample data:', insertError.message);
      console.log('This might mean the table still needs to be created manually.');
    } else {
      console.log('✅ Sample data inserted successfully!');
      console.log('Inserted records:', insertData);
    }

  } catch (error) {
    console.error('Error:', error);
    console.log('\nPlease create the table manually:');
    console.log('1. Go to https://supabase.com/dashboard/project/mwipqlvteowoyipbozyu');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the SQL from scripts/create-clases-table.sql');
  }
}

createTableViaClient();
