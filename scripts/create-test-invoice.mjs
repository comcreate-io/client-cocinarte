import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwipqlvteowoyipbozyu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aXBxbHZ0ZW93b3lpcGJvenl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQzMDAyMSwiZXhwIjoyMDc1MDA2MDIxfQ.QjIjGc7k_Ef3KmLy-8XTSoON-UukQyyNl693kji6Evo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createInvoice() {
  console.log('Creating new invoice...\n');

  // Generate invoice number
  const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
    .rpc('generate_invoice_number');

  if (invoiceNumberError) {
    console.error('❌ Error generating invoice number:', invoiceNumberError.message);
    return;
  }

  const invoice = {
    invoice_number: invoiceNumberData,
    recipient_name: 'Diego Rodriguez',
    recipient_email: 'diego@comcreate.org',
    recipient_phone: '+1-305-555-0100',
    recipient_company: 'ComCreate Digital Agency',
    recipient_address: '100 Biscayne Blvd, Miami, FL 33132',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    line_items: [
      {
        description: 'Kids Summer Cooking Camp (5 days)',
        quantity: 1,
        unit_price: 425.00,
        amount: 425.00
      },
      {
        description: 'Teen Baking Masterclass Series (6 sessions)',
        quantity: 1,
        unit_price: 280.00,
        amount: 280.00
      },
      {
        description: 'Professional Chef Tools Kit',
        quantity: 2,
        unit_price: 65.00,
        amount: 130.00
      },
      {
        description: 'Recipe Book & Course Materials',
        quantity: 2,
        unit_price: 35.00,
        amount: 70.00
      }
    ],
    subtotal: 905.00,
    tax_rate: 7.00,
    tax_amount: 63.35,
    total_amount: 968.35,
    payment_status: 'pending',
    notes: 'Thank you for enrolling in our culinary programs! We\'re excited to help your family explore the joy of cooking. Classes begin next month.',
    terms: 'Payment is due within 30 days of invoice date. Please contact us at support@cocinarte.com if you have any questions or need to arrange a payment plan.',
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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 INVOICE DETAILS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📋 Invoice Number: ${data.invoice_number}`);
  console.log(`👤 Recipient: ${data.recipient_name}`);
  console.log(`📧 Email: ${data.recipient_email}`);
  console.log(`🏢 Company: ${data.recipient_company}`);
  console.log(`📍 Address: ${data.recipient_address}`);
  console.log(`📅 Invoice Date: ${data.invoice_date}`);
  console.log(`📅 Due Date: ${data.due_date}`);
  console.log(`\n💳 Payment Status: ${data.payment_status.toUpperCase()}`);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log('📦 LINE ITEMS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  data.line_items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.description}`);
    console.log(`   Qty: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${item.amount.toFixed(2)}\n`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 TOTALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`   Subtotal: $${data.subtotal.toFixed(2)}`);
  console.log(`   Tax (${data.tax_rate}%): $${data.tax_amount.toFixed(2)}`);
  console.log(`   ─────────────────────────`);
  console.log(`   TOTAL: $${data.total_amount.toFixed(2)}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Invoice is ready to be sent!');
  console.log(`📬 You can send it from: /dashboard/invoices`);
  console.log(`🔗 Direct payment link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${data.id}/pay`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

createInvoice().catch(console.error);
