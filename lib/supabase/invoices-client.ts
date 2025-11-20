import { createClient } from '@/lib/supabase/client'
import { Invoice, CreateInvoiceData, UpdateInvoiceData } from '@/lib/types/invoice'

export class InvoicesClientService {
  private supabase = createClient()

  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Invoice[]
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as Invoice
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as Invoice
  }

  async generateInvoiceNumber(): Promise<string> {
    const { data, error } = await this.supabase
      .rpc('generate_invoice_number')

    if (error) throw error
    return data as string
  }

  async createInvoice(invoiceData: CreateInvoiceData): Promise<Invoice> {
    // Generate invoice number if not provided
    let invoice_number = invoiceData.invoice_number
    if (!invoice_number) {
      invoice_number = await this.generateInvoiceNumber()
    }

    // Calculate amounts if not provided
    const line_items = invoiceData.line_items
    const subtotal = invoiceData.subtotal ?? line_items.reduce((sum, item) => sum + item.amount, 0)
    const tax_rate = invoiceData.tax_rate ?? 0
    const tax_amount = invoiceData.tax_amount ?? (subtotal * tax_rate / 100)
    const total_amount = invoiceData.total_amount ?? (subtotal + tax_amount)

    const invoice = {
      ...invoiceData,
      invoice_number,
      subtotal,
      tax_rate,
      tax_amount,
      total_amount,
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      payment_status: invoiceData.payment_status || 'pending',
      email_sent: false
    }

    const { data, error } = await this.supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single()

    if (error) throw error
    return data as Invoice
  }

  async updateInvoice(updateData: UpdateInvoiceData): Promise<Invoice> {
    const { id, ...updates } = updateData

    // Recalculate amounts if line_items changed
    if (updates.line_items) {
      const subtotal = updates.line_items.reduce((sum, item) => sum + item.amount, 0)
      const tax_rate = updates.tax_rate ?? 0
      const tax_amount = subtotal * tax_rate / 100
      const total_amount = subtotal + tax_amount

      updates.subtotal = subtotal
      updates.tax_amount = tax_amount
      updates.total_amount = total_amount
    }

    const { data, error } = await this.supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Invoice
  }

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async markInvoiceAsSent(id: string): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoices')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Invoice
  }

  async markInvoiceAsPaid(
    id: string,
    paymentMethod: 'stripe' | 'cash' | 'check' | 'bank_transfer' | 'other',
    stripePaymentIntentId?: string
  ): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoices')
      .update({
        payment_status: 'paid',
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: stripePaymentIntentId
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Invoice
  }

  async getInvoicesByStatus(status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'): Promise<Invoice[]> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('payment_status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Invoice[]
  }

  async getInvoicesByRecipientEmail(email: string): Promise<Invoice[]> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('recipient_email', email)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Invoice[]
  }
}
