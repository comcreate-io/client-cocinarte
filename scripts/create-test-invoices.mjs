import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwipqlvteowoyipbozyu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXBxbHZ0ZW93b3lpcGJvenl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQzMDAyMSwiZXhwIjoyMDc1MDA2MDIxfQ.QjIjGc7k_Ef3KmLy-8XTSoON-UukQyyNl693kji6Evo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestInvoices() {
  console.log('Creating test invoices...\n');

  // Set created_by to null since we don't have admin access
  const createdBy = null;

  const testInvoices = [
    {
      recipient_name: 'Maria González',
      recipient_email: 'maria.gonzalez@example.com',
      recipient_phone: '+1-555-0101',
      recipient_company: 'González Family',
      recipient_address: '123 Main Street, Miami, FL 33101',
      invoice_date: '2025-01-15',
      due_date: '2025-02-15',
      line_items: [
        {
          description: 'Kids Cooking Class - Basic Skills (8 sessions)',
          quantity: 1,
          unit_price: 240.00,
          amount: 240.00
        },
        {
          description: 'Cooking Kit and Supplies',
          quantity: 1,
          unit_price: 45.00,
          amount: 45.00
        }
      ],
      subtotal: 285.00,
      tax_rate: 7.00,
      tax_amount: 19.95,
      total_amount: 304.95,
      payment_status: 'pending',
      notes: 'Thank you for enrolling your child in our cooking program!',
      terms: 'Payment is due within 30 days. Late payments may incur additional fees.',
      created_by: createdBy
    },
    {
      recipient_name: 'Juan Rodríguez',
      recipient_email: 'juan.rodriguez@example.com',
      recipient_phone: '+1-555-0202',
      recipient_company: null,
      recipient_address: '456 Oak Avenue, Miami, FL 33102',
      invoice_date: '2025-01-10',
      due_date: '2025-02-10',
      line_items: [
        {
          description: 'Advanced Pastry Workshop (4 sessions)',
          quantity: 1,
          unit_price: 180.00,
          amount: 180.00
        },
        {
          description: 'Premium Ingredient Package',
          quantity: 1,
          unit_price: 65.00,
          amount: 65.00
        }
      ],
      subtotal: 245.00,
      tax_rate: 7.00,
      tax_amount: 17.15,
      total_amount: 262.15,
      payment_status: 'paid',
      payment_method: 'stripe',
      paid_at: new Date('2025-01-12T14:30:00Z').toISOString(),
      stripe_payment_intent_id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
      email_sent: true,
      email_sent_at: new Date('2025-01-10T09:00:00Z').toISOString(),
      notes: 'Looking forward to having you in our advanced class!',
      terms: 'Payment is due within 30 days.',
      created_by: createdBy
    },
    {
      recipient_name: 'Sofia Martinez',
      recipient_email: 'sofia.martinez@example.com',
      recipient_phone: '+1-555-0303',
      recipient_company: 'Martinez Catering LLC',
      recipient_address: '789 Pine Road, Miami, FL 33103',
      invoice_date: '2025-01-20',
      due_date: '2025-02-20',
      line_items: [
        {
          description: 'Birthday Party Cooking Experience (10 children)',
          quantity: 1,
          unit_price: 450.00,
          amount: 450.00
        },
        {
          description: 'Custom Birthday Cake',
          quantity: 1,
          unit_price: 85.00,
          amount: 85.00
        },
        {
          description: 'Party Decorations and Supplies',
          quantity: 1,
          unit_price: 75.00,
          amount: 75.00
        }
      ],
      subtotal: 610.00,
      tax_rate: 7.00,
      tax_amount: 42.70,
      total_amount: 652.70,
      payment_status: 'pending',
      email_sent: true,
      email_sent_at: new Date('2025-01-20T10:15:00Z').toISOString(),
      notes: "We're excited to make your child's birthday party special!",
      terms: 'Full payment required 7 days before the party date. Cancellations within 48 hours are non-refundable.',
      created_by: createdBy
    },
    {
      recipient_name: 'Carlos Fernández',
      recipient_email: 'carlos.fernandez@example.com',
      recipient_phone: '+1-555-0404',
      recipient_company: null,
      recipient_address: '321 Elm Street, Miami, FL 33104',
      invoice_date: '2025-01-05',
      due_date: '2025-01-20',
      line_items: [
        {
          description: 'Teen Culinary Program (12 weeks)',
          quantity: 1,
          unit_price: 720.00,
          amount: 720.00
        },
        {
          description: 'Chef Uniform and Tools',
          quantity: 1,
          unit_price: 95.00,
          amount: 95.00
        }
      ],
      subtotal: 815.00,
      tax_rate: 7.00,
      tax_amount: 57.05,
      total_amount: 872.05,
      payment_status: 'overdue',
      email_sent: true,
      email_sent_at: new Date('2025-01-05T08:00:00Z').toISOString(),
      notes: 'Comprehensive culinary training for aspiring young chefs.',
      terms: 'Payment is due within 15 days. Late payments subject to 5% late fee.',
      created_by: createdBy
    },
    {
      recipient_name: 'Ana López',
      recipient_email: 'ana.lopez@example.com',
      recipient_phone: '+1-555-0505',
      recipient_company: 'López Events',
      recipient_address: '654 Maple Drive, Miami, FL 33105',
      invoice_date: '2024-12-28',
      due_date: '2025-01-15',
      line_items: [
        {
          description: 'Corporate Team Building - Cooking Challenge',
          quantity: 15,
          unit_price: 75.00,
          amount: 1125.00
        },
        {
          description: 'Private Venue Rental (3 hours)',
          quantity: 1,
          unit_price: 350.00,
          amount: 350.00
        },
        {
          description: 'Premium Wine Pairing',
          quantity: 15,
          unit_price: 25.00,
          amount: 375.00
        }
      ],
      subtotal: 1850.00,
      tax_rate: 7.00,
      tax_amount: 129.50,
      total_amount: 1979.50,
      payment_status: 'paid',
      payment_method: 'stripe',
      paid_at: new Date('2025-01-10T16:45:00Z').toISOString(),
      stripe_payment_intent_id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
      email_sent: true,
      email_sent_at: new Date('2024-12-28T11:30:00Z').toISOString(),
      notes: 'Perfect for team building and corporate events!',
      terms: 'Payment is due within 18 days. Group discounts available for 20+ participants.',
      created_by: createdBy
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const invoice of testInvoices) {
    // Generate invoice number using the database function
    const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
      .rpc('generate_invoice_number');

    if (invoiceNumberError) {
      console.error(`❌ Error generating invoice number for ${invoice.recipient_name}:`, invoiceNumberError.message);
      errorCount++;
      continue;
    }

    // Add the generated invoice number to the invoice data
    const invoiceWithNumber = {
      ...invoice,
      invoice_number: invoiceNumberData
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceWithNumber)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating invoice for ${invoice.recipient_name}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Created invoice ${data.invoice_number} for ${invoice.recipient_name}`);
      console.log(`   Status: ${data.payment_status} | Total: $${data.total_amount}`);
      console.log('');
      successCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Successfully created: ${successCount} invoices`);
  console.log(`❌ Failed: ${errorCount} invoices`);
  console.log('\n📊 Test Invoice Breakdown:');
  console.log('   - 2 Pending invoices');
  console.log('   - 2 Paid invoices');
  console.log('   - 1 Overdue invoice');
  console.log('   - Total value: $4,071.35');
}

createTestInvoices().catch(console.error);
