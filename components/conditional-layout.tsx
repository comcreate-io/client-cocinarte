"use client"

import { usePathname } from "next/navigation"
import ModernHeader from "@/components/modern-header"
import Footer from "@/components/footer"
import StickyApplyButton from "@/components/sticky-apply-button"
import FloatingCTA from "@/components/floating-cta"

interface ConditionalLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

export default function ConditionalLayout({ children, showHeader = true }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if we're on the root page (Cocinarte homepage)
  const isRootPage = pathname === '/'
  
  // Check if we're on a Cocinarte page
  const isCocinartePage = pathname?.startsWith('/cocinarte')

  // Check if we're on the blog page (uses Cocinarte layout)
  const isBlogPage = pathname?.startsWith('/blog')
  
  // Check if we're on the landing page
  const isLandingPage = pathname?.startsWith('/landing')
  
  // Check if we're on the dashboard page
  const isDashboardPage = pathname?.startsWith('/dashboard')

  // Check if we're on the login page
  const isLoginPage = pathname?.startsWith('/login')

  // Check if we're on an invoice payment page
  const isInvoicePage = pathname?.startsWith('/invoice')

  // Check if we're on the terms page
  const isTermsPage = pathname?.startsWith('/terms')

  // Check if we're on the signup page
  const isSignupPage = pathname?.startsWith('/signup')

  // Check if we're on the camps page (uses Cocinarte layout)
  const isCampsPage = pathname?.startsWith('/camps')

  // Check if we're on the guest form page (uses Cocinarte layout)
  const isGuestFormPage = pathname?.startsWith('/guest-form')

  // Check if we're on the party dashboard or party form page (uses Cocinarte layout)
  const isPartyDashboardPage = pathname?.startsWith('/party-dashboard')
  const isPartyFormPage = pathname?.startsWith('/party-form')

  if (isRootPage || isCocinartePage || isBlogPage || isLandingPage || isDashboardPage || isLoginPage || isInvoicePage || isTermsPage || isSignupPage || isCampsPage || isGuestFormPage || isPartyDashboardPage || isPartyFormPage || !showHeader) {
    // For root page, Cocinarte pages, landing page, dashboard, login, invoice pages, or when showHeader is false, only render the children (no header/footer)
    return <>{children}</>
  }
  
  // For all other pages, render with header and footer
  return (
    <div style={{ marginTop: "70px" }}>
      <ModernHeader />
      {children}
      <Footer />
      <FloatingCTA />
    </div>
  )
}
