import DashboardLayoutComponent from '@/components/dashboard/dashboard-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
}
