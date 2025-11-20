import pkg from 'pg';
const { Client } = pkg;

const connectionConfig = {
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.mwipqlvteowoyipbozyu',
  password: 'xwW1e714uxcNuZWk',
  ssl: {
    rejectUnauthorized: false
  }
};

const client = new Client(connectionConfig);

async function checkSchema() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Get all columns from students table
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'students'
      ORDER BY ordinal_position;
    `);

    console.log('\nStudents table columns:');
    console.log('========================');
    result.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
