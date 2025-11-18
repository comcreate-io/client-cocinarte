import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertTestClass() {
  const { data, error } = await supabase
    .from('clases')
    .insert({
      title: 'Test Class',
      description: 'This is a test class for coupon testing',
      date: '2025-11-24',
      time: '10:00:00',
      minStudents: 4,
      maxStudents: 10,
      enrolled: 0,
      price: 50.00,
      classDuration: 90,
      class_type: 'Mini Chefcitos',
      image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop'
    })
    .select()

  if (error) {
    console.error('Error inserting test class:', error)
    process.exit(1)
  }

  console.log('✅ Test class inserted successfully!')
  console.log('Class details:', data)
}

insertTestClass()
