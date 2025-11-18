import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function createStudentProfile() {
  // You can modify these values
  const email = process.argv[2] || 'your-email@example.com'
  const parentName = process.argv[3] || 'Parent Name'
  const childName = process.argv[4] || 'Child Name'
  const phone = process.argv[5] || ''
  const address = process.argv[6] || ''

  console.log('Creating student profile for:', email)

  const { data, error } = await supabase
    .from('students')
    .insert({
      email: email,
      parent_name: parentName,
      child_name: childName,
      phone: phone || undefined,
      address: address || undefined
    })
    .select()

  if (error) {
    console.error('❌ Error creating student profile:', error)
    process.exit(1)
  }

  console.log('✅ Student profile created successfully!')
  console.log('Student details:', data)
}

console.log('Usage: npx tsx scripts/create-student-profile.ts <email> <parent_name> <child_name> [phone] [address]')
console.log('')

createStudentProfile()
