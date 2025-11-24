'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ParentsClientService } from '@/lib/supabase/parents-client'
import { ParentWithChildren } from '@/types/student'
import ChildrenManagement from '@/components/account/children-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, LogOut, Users } from 'lucide-react'

export default function AccountPage() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [parentData, setParentData] = useState<ParentWithChildren | null>(null)
  const [loading, setLoading] = useState(true)

  const parentsService = new ParentsClientService()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadParentData()
    }
  }, [user])

  const loadParentData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await parentsService.getParentWithChildrenByUserId(user.id)
      setParentData(data)
    } catch (err) {
      console.error('Failed to load parent data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cocinarte-orange"></div>
      </div>
    )
  }

  if (!user || !parentData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cocinarte-yellow/20 via-cocinarte-white to-cocinarte-orange/20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-cocinarte-navy">My Account</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your profile and children</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="gap-2 w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5 text-cocinarte-orange" />
                Account Information
              </CardTitle>
              <CardDescription className="text-sm">Your personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">Name</span>
                  </div>
                  <p className="text-base sm:text-lg break-words">{parentData.parent_guardian_names}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="font-semibold">Email</span>
                  </div>
                  <p className="text-base sm:text-lg break-all">{parentData.parent_email}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold">Phone</span>
                  </div>
                  <p className="text-base sm:text-lg">{parentData.parent_phone}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="font-semibold">Preferred Contact</span>
                  </div>
                  <Badge className="bg-cocinarte-orange text-xs sm:text-sm">
                    {parentData.preferred_communication_method === 'email' ? 'Email' : 'Text'}
                  </Badge>
                </div>

                {parentData.address && (
                  <div className="sm:col-span-2">
                    <span className="text-sm text-gray-600 font-semibold">Address</span>
                    <p className="text-base sm:text-lg mt-1">{parentData.address}</p>
                  </div>
                )}

                {parentData.emergency_contact_name && (
                  <div className="sm:col-span-2 pt-4 border-t">
                    <h3 className="font-semibold mb-3 text-base sm:text-lg">Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 block sm:inline">Name: </span>
                        <span className="font-medium">{parentData.emergency_contact_name}</span>
                      </div>
                      {parentData.emergency_contact_phone && (
                        <div>
                          <span className="text-gray-600 block sm:inline">Phone: </span>
                          <span className="font-medium">{parentData.emergency_contact_phone}</span>
                        </div>
                      )}
                      {parentData.emergency_contact_relationship && (
                        <div>
                          <span className="text-gray-600 block sm:inline">Relationship: </span>
                          <span className="font-medium">{parentData.emergency_contact_relationship}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Children Management */}
          <ChildrenManagement
            parentId={parentData.id}
            onUpdate={loadParentData}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 text-cocinarte-orange" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-4 sm:p-5 bg-cocinarte-orange/10 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-cocinarte-orange">
                    {parentData.children.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    {parentData.children.length === 1 ? 'Child' : 'Children'} Registered
                  </div>
                </div>

                <div className="text-center p-4 sm:p-5 bg-green-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {parentData.children.filter(c => c.media_permission).length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Media Permissions</div>
                </div>

                <div className="text-center p-4 sm:p-5 bg-blue-50 rounded-lg sm:col-span-2 md:col-span-1">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {parentData.children.filter(c => c.has_cooking_experience).length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">With Experience</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
