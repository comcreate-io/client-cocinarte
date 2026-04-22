import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) { console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function createDiegoInvoice() {
  console.log('Creating invoice for Diego...\n');

  // Generate invoice number
  const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
    .rpc('generate_invoice_number');

  if (invoiceNumberError) {
    console.error('❌ Error generating invoice number:', invoiceNumberError.message);
    return;
  }

  const invoice = {
    invoice_number: invoiceNumberData,
    recipient_name: 'Diego Martinez',
    recipient_email: 'diego@comcreate.org',
    recipient_phone: '+1-555-1234',
    recipient_company: 'ComCreate',
    recipient_address: '123 Innovation Drive, Miami, FL 33130',
    invoice_date: '2025-01-20',
    due_date: '2025-02-20',
    line_items: [
      {
        description: 'Premium Kids Cooking Classes (12 sessions)',
        quantity: 1,
        unit_price: 360.00,
        amount: 360.00
      },
      {
        description: 'Advanced Culinary Workshop',
        quantity: 2,
        unit_price: 85.00,
        amount: 170.00
      },
      {
        description: 'Professional Cooking Kit',
        quantity: 1,
        unit_price: 125.00,
        amount: 125.00
      }
    ],
    subtotal: 655.00,
    tax_rate: 7.00,
    tax_amount: 45.85,
    total_amount: 700.85,
    payment_status: 'pending',
    notes: 'Thank you for choosing Cocinarte! We look forward to helping develop culinary skills.',
    terms: 'Payment is due within 30 days. Please contact us if you have any questions.',
    created_by: null
  };

  const { data, error } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating invoice:', error.message);
    return;
  }

  console.log('✅ Invoice created successfully!\n');
  console.log('=== Invoice Details ===');
  console.log(`Invoice Number: ${data.invoice_number}`);
  console.log(`Recipient: ${data.recipient_name}`);
  console.log(`Email: ${data.recipient_email}`);
  console.log(`Status: ${data.payment_status}`);
  console.log(`Total Amount: $${data.total_amount}`);
  console.log(`\nLine Items:`);
  data.line_items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.description}`);
    console.log(`     Qty: ${item.quantity} x $${item.unit_price} = $${item.amount}`);
  });
  console.log(`\nSubtotal: $${data.subtotal}`);
  console.log(`Tax (${data.tax_rate}%): $${data.tax_amount}`);
  console.log(`Total: $${data.total_amount}`);
  console.log(`\nDue Date: ${data.due_date}`);
}

createDiegoInvoice().catch(console.error);
