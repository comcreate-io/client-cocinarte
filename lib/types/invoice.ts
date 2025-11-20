export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export interface Invoice {
  id: string
  invoice_number: string

  // Recipient information
  recipient_name: string
  recipient_email: string
  recipient_phone?: string
  recipient_address?: string
  recipient_company?: string

  // Invoice details
  invoice_date: string // ISO date string
  due_date: string // ISO date string

  // Line items
  line_items: InvoiceLineItem[]

  // Amounts
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number

  // Payment information
  payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  payment_method?: 'stripe' | 'cash' | 'check' | 'bank_transfer' | 'other'
  paid_at?: string
  stripe_payment_intent_id?: string

  // Email tracking
  email_sent: boolean
  email_sent_at?: string

  // Notes and terms
  notes?: string
  terms?: string

  // Metadata
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateInvoiceData {
  invoice_number?: string // Optional, will be auto-generated if not provided

  // Recipient information
  recipient_name: string
  recipient_email: string
  recipient_phone?: string
  recipient_address?: string
  recipient_company?: string

  // Invoice details
  invoice_date?: string // Defaults to today
  due_date: string

  // Line items
  line_items: InvoiceLineItem[]

  // Amounts (will be calculated from line items if not provided)
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  total_amount?: number

  // Payment information
  payment_status?: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
  payment_method?: 'stripe' | 'cash' | 'check' | 'bank_transfer' | 'other'
  paid_at?: string
  stripe_payment_intent_id?: string

  // Notes and terms
  notes?: string
  terms?: string

  // Metadata
  created_by?: string
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  id: string
  email_sent?: boolean
  email_sent_at?: string
}

export interface SendInvoiceRequest {
  invoice_id: string
}

export interface InvoicePaymentRequest {
  invoice_id: string
  stripe_payment_intent_id: string
}
