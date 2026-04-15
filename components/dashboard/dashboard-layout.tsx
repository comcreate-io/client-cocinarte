"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  CalendarDays,
  Ticket,
  Cake,
  FileText,
  Gift,
  Mail,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import SignOutButton from "@/components/auth/sign-out-button"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Classes",
    url: "/dashboard/classes",
    icon: BookOpen,
  },
  {
    title: "Bookings",
    url: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    title: "Event Requests",
    url: "/dashboard/party-requests",
    icon: Cake,
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: DollarSign,
  },
  {
    title: "Invoices",
    url: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: Users,
  },
  {
    title: "Coupons",
    url: "/dashboard/coupons",
    icon: Ticket,
  },
  {
    title: "Gift Cards",
    url: "/dashboard/gift-cards",
    icon: Gift,
  },
  {
    title: "Emails",
    url: "/dashboard/emails",
    icon: Mail,
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-[80px] w-[200px] items-center justify-center rounded overflow-hidden">
                <Image 
                  src="/cocinarte/cocinarteLogo.png" 
                  alt="Cocinarte Logo" 
                  width={32} 
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-2">
              <SignOutButton />
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col w-full overflow-x-hidden">
          <header className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4 lg:px-6">
            <SidebarTrigger className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold truncate">
                {navigationItems.find(item => pathname === item.url || pathname.startsWith(item.url + "/"))?.title || "Dashboard"}
              </h1>
            </div>
          </header>
          
          <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
