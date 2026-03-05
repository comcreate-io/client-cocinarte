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

async function syncParents() {
  console.log('Syncing parents to email contacts...\n');

  // Get all parents
  const { data: parents, error: parentsError } = await supabase
    .from('parents')
    .select('parent_guardian_names, parent_email');

  if (parentsError) {
    console.error('Error fetching parents:', parentsError.message);
    return;
  }

  console.log('Found', parents.length, 'parents in database');

  // Get existing email contacts
  const { data: existingContacts, error: contactsError } = await supabase
    .from('email_contacts')
    .select('email');

  if (contactsError) {
    console.error('Error fetching contacts:', contactsError.message);
    return;
  }

  const existingEmails = new Set(
    (existingContacts || []).map(c => c.email.toLowerCase())
  );

  console.log('Found', existingEmails.size, 'existing email contacts');

  // Filter out parents that are already in email_contacts
  const newContacts = parents
    .filter(p => p.parent_email && !existingEmails.has(p.parent_email.toLowerCase()))
    .map(p => {
      const names = (p.parent_guardian_names || '').split(' ');
      return {
        first_name: names[0] || '',
        last_name: names.slice(1).join(' ') || '',
        email: p.parent_email.toLowerCase(),
      };
    });

  console.log('New contacts to add:', newContacts.length);

  if (newContacts.length === 0) {
    console.log('\nNo new contacts to sync');
    return;
  }

  console.log('\nInserting contacts:');
  newContacts.forEach(c => console.log(' -', c.email, '|', c.first_name, c.last_name));

  // Insert new contacts
  const { data: inserted, error: insertError } = await supabase
    .from('email_contacts')
    .insert(newContacts)
    .select();

  if (insertError) {
    console.error('\nError inserting contacts:', insertError.message);
    return;
  }

  console.log('\nSuccessfully synced', inserted.length, 'contacts!');
}

syncParents();
