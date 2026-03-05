import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking tables...\n');

  // Check parents table
  console.log('1. Checking parents table:');
  const { data: parents, error: parentsError } = await supabase
    .from('parents')
    .select('id, parent_guardian_names, parent_email')
    .limit(5);

  if (parentsError) {
    console.log('   Error:', parentsError.message);
  } else {
    console.log('   Found', parents?.length || 0, 'parents (showing first 5)');
    if (parents?.length > 0) {
      parents.forEach(p => console.log('   -', p.parent_email, '|', p.parent_guardian_names));
    }
  }

  // Check email_contacts table
  console.log('\n2. Checking email_contacts table:');
  const { data: contacts, error: contactsError } = await supabase
    .from('email_contacts')
    .select('*')
    .limit(5);

  if (contactsError) {
    console.log('   Error:', contactsError.message);
    console.log('   >>> TABLE MAY NOT EXIST - Run the SQL migration! <<<');
  } else {
    console.log('   Found', contacts?.length || 0, 'contacts (showing first 5)');
    if (contacts?.length > 0) {
      contacts.forEach(c => console.log('   -', c.email, '|', c.first_name, c.last_name));
    }
  }

  // Check email_templates table
  console.log('\n3. Checking email_templates table:');
  const { data: templates, error: templatesError } = await supabase
    .from('email_templates')
    .select('*')
    .limit(5);

  if (templatesError) {
    console.log('   Error:', templatesError.message);
    console.log('   >>> TABLE MAY NOT EXIST - Run the SQL migration! <<<');
  } else {
    console.log('   Found', templates?.length || 0, 'templates');
  }

  // Check email_sends table
  console.log('\n4. Checking email_sends table:');
  const { data: sends, error: sendsError } = await supabase
    .from('email_sends')
    .select('*')
    .limit(5);

  if (sendsError) {
    console.log('   Error:', sendsError.message);
    console.log('   >>> TABLE MAY NOT EXIST - Run the SQL migration! <<<');
  } else {
    console.log('   Found', sends?.length || 0, 'sends');
  }
}

checkTables();
