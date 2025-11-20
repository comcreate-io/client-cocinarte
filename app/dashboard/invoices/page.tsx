"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import InvoicesClient from "@/components/dashboard/invoices-client"

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <InvoicesClient />
    </DashboardLayout>
  )
}
