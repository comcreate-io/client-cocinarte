import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Edit, Trash2, Mail, Phone, Calendar, BookOpen } from 'lucide-react'
import { StudentsClient } from '@/components/dashboard/students-client'
import { isAdminUser } from '@/lib/supabase/admin'

export default async function StudentsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is an admin
  const isAdmin = await isAdminUser(supabase, user.email)

  if (!isAdmin) {
    redirect('/?error=admin_only')
  }

  // Fetch parents with their children
  const { data: parents, error } = await supabase
    .from('parents')
    .select(`
      id,
      user_id,
      parent_guardian_names,
      parent_email,
      parent_phone,
      address,
      created_at,
      children (
        id,
        child_full_name,
        child_preferred_name,
        child_age,
        allergies,
        dietary_restrictions,
        has_cooking_experience,
        cooking_experience_details,
        medical_conditions,
        emergency_medications
      )
    `)
    .order('created_at', { ascending: false })

  const safeParents = parents ?? []

  // Count total children
  const totalChildren = safeParents.reduce((sum, parent: any) =>
    sum + (parent.children?.length || 0), 0
  )

  // Count new children this month
  const now = new Date()
  const newThisMonth = safeParents.filter((p: any) => {
    const created = p.created_at ? new Date(p.created_at as string) : null
    return (
      created &&
      created.getUTCFullYear() === now.getUTCFullYear() &&
      created.getUTCMonth() === now.getUTCMonth()
    )
  }).reduce((sum, parent: any) => sum + (parent.children?.length || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cocinarte Students</h1>
          <p className="text-muted-foreground">
            Manage Cocinarte cooking class students and enrollment.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Families</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeParents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChildren}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>
            Manage student information and enrollment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsClient initialParents={safeParents} />
        </CardContent>
      </Card>

    </div>
  )
}
