"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText, Plus, Send, Eye, Trash2, DollarSign, Calendar,
  Mail, User, Building, Phone, MapPin, CheckCircle, Clock,
  AlertCircle, XCircle, X
} from "lucide-react"
import { Invoice, InvoiceLineItem } from "@/lib/types/invoice"
import { InvoicesClientService } from "@/lib/supabase/invoices-client"
import { useAuth } from "@/contexts/auth-context"

export default function InvoicesClient() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null)

  // Form state
  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [recipientCompany, setRecipientCompany] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", quantity: 1, unit_price: 0, amount: 0 }
  ])
  const [taxRate, setTaxRate] = useState(0)
  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState("Payment due within 30 days of invoice date.")

  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const service = new InvoicesClientService()
      const data = await service.getInvoices()
      setInvoices(data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateLineItemAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newLineItems = [...lineItems]
    newLineItems[index] = { ...newLineItems[index], [field]: value }

    // Recalculate amount if quantity or unit_price changed
    if (field === 'quantity' || field === 'unit_price') {
      newLineItems[index].amount = calculateLineItemAmount(
        newLineItems[index].quantity,
        newLineItems[index].unit_price
      )
    }

    setLineItems(newLineItems)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0, amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const resetForm = () => {
    setRecipientName("")
    setRecipientEmail("")
    setRecipientPhone("")
    setRecipientAddress("")
    setRecipientCompany("")
    setDueDate("")
    setLineItems([{ description: "", quantity: 1, unit_price: 0, amount: 0 }])
    setTaxRate(0)
    setNotes("")
    setTerms("Payment due within 30 days of invoice date.")
    setFormError("")
    setFormSuccess("")
  }

  const handleCreateInvoice = async () => {
    setFormError("")
    setFormSuccess("")

    // Validation
    if (!recipientName || !recipientEmail || !dueDate) {
      setFormError("Please fill in all required fields")
      return
    }

    if (lineItems.length === 0 || lineItems.some(item => !item.description || item.quantity <= 0)) {
      setFormError("Please add at least one valid line item")
      return
    }

    try {
      setCreating(true)
      const service = new InvoicesClientService()

      const invoiceData = {
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        recipient_phone: recipientPhone || undefined,
        recipient_address: recipientAddress || undefined,
        recipient_company: recipientCompany || undefined,
        due_date: dueDate,
        line_items: lineItems,
        tax_rate: taxRate,
        notes: notes || undefined,
        terms: terms || undefined,
        created_by: user?.id
      }

      const newInvoice = await service.createInvoice(invoiceData)
      setInvoices([newInvoice, ...invoices])
      setFormSuccess("Invoice created successfully!")

      setTimeout(() => {
        setShowCreateDialog(false)
        resetForm()
      }, 1500)
    } catch (error: any) {
      console.error("Error creating invoice:", error)
      setFormError(error.message || "Failed to create invoice")
    } finally {
      setCreating(false)
    }
  }

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      setSendingInvoice(invoiceId)

      const response = await fetch("/api/invoice/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId })
      })

      if (!response.ok) {
        throw new Error("Failed to send invoice")
      }

      // Update local state
      setInvoices(invoices.map(inv =>
        inv.id === invoiceId
          ? { ...inv, email_sent: true, email_sent_at: new Date().toISOString() }
          : inv
      ))

      alert("Invoice sent successfully!")
    } catch (error) {
      console.error("Error sending invoice:", error)
      alert("Failed to send invoice. Please try again.")
    } finally {
      setSendingInvoice(null)
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowViewDialog(true)
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    try {
      const service = new InvoicesClientService()
      await service.deleteInvoice(invoiceId)
      setInvoices(invoices.filter(inv => inv.id !== invoiceId))
    } catch (error) {
      console.error("Error deleting invoice:", error)
      alert("Failed to delete invoice")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      paid: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      overdue: { color: "bg-red-100 text-red-800", icon: AlertCircle },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
      refunded: { color: "bg-blue-100 text-blue-800", icon: DollarSign }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Create and manage customer invoices</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-cocinarte-red hover:bg-cocinarte-red/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cocinarte-red"></div>
          <span className="ml-2 text-gray-600">Loading invoices...</span>
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-600 mb-4">Create your first invoice to get started</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-cocinarte-red hover:bg-cocinarte-red/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                      {getStatusBadge(invoice.payment_status)}
                      {invoice.email_sent && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Mail className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Recipient</p>
                        <p className="font-semibold text-gray-900">{invoice.recipient_name}</p>
                        {invoice.recipient_company && (
                          <p className="text-sm text-gray-600">{invoice.recipient_company}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold text-gray-900 text-lg">{formatCurrency(invoice.total_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Invoice Date</p>
                        <p className="font-medium text-gray-900">{formatDate(invoice.invoice_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium text-gray-900">{formatDate(invoice.due_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!invoice.email_sent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendInvoice(invoice.id)}
                        disabled={sendingInvoice === invoice.id}
                      >
                        {sendingInvoice === invoice.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cocinarte-red"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {invoice.payment_status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-cocinarte-red" />
              Create New Invoice
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new invoice
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Recipient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient-name">Full Name *</Label>
                    <Input
                      id="recipient-name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient-email">Email *</Label>
                    <Input
                      id="recipient-email"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient-phone">Phone</Label>
                    <Input
                      id="recipient-phone"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient-company">Company</Label>
                    <Input
                      id="recipient-company"
                      value={recipientCompany}
                      onChange={(e) => setRecipientCompany(e.target.value)}
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="recipient-address">Address</Label>
                  <Textarea
                    id="recipient-address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="123 Main St, City, State, ZIP"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="due-date">Due Date *</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Line Items
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        placeholder="Service or product description"
                      />
                    </div>
                    <div className="w-24">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Amount</Label>
                      <Input
                        value={formatCurrency(item.amount)}
                        disabled
                      />
                    </div>
                    {lineItems.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeLineItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Tax Rate:</span>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(calculateTax())}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-cocinarte-red">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes and Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes for the recipient"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Payment Terms</Label>
                  <Textarea
                    id="terms"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Payment terms and conditions"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error/Success Messages */}
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            {formSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{formSuccess}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  resetForm()
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoice}
                disabled={creating}
                className="bg-cocinarte-red hover:bg-cocinarte-red/90"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">
                    {selectedInvoice.invoice_number}
                  </DialogTitle>
                  {getStatusBadge(selectedInvoice.payment_status)}
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Recipient Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                  <p className="font-medium">{selectedInvoice.recipient_name}</p>
                  {selectedInvoice.recipient_company && (
                    <p className="text-sm text-gray-600">{selectedInvoice.recipient_company}</p>
                  )}
                  <p className="text-sm text-gray-600">{selectedInvoice.recipient_email}</p>
                  {selectedInvoice.recipient_phone && (
                    <p className="text-sm text-gray-600">{selectedInvoice.recipient_phone}</p>
                  )}
                  {selectedInvoice.recipient_address && (
                    <p className="text-sm text-gray-600 mt-1">{selectedInvoice.recipient_address}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-semibold">{formatDate(selectedInvoice.invoice_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-semibold">{formatDate(selectedInvoice.due_date)}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold">Description</th>
                          <th className="text-right p-3 text-sm font-semibold">Qty</th>
                          <th className="text-right p-3 text-sm font-semibold">Price</th>
                          <th className="text-right p-3 text-sm font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.line_items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{item.description}</td>
                            <td className="p-3 text-right">{item.quantity}</td>
                            <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="p-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.tax_rate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({selectedInvoice.tax_rate}%):</span>
                      <span className="font-semibold">{formatCurrency(selectedInvoice.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-cocinarte-red">{formatCurrency(selectedInvoice.total_amount)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* Terms */}
                {selectedInvoice.terms && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Terms</h3>
                    <p className="text-sm text-gray-600">{selectedInvoice.terms}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
