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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cocinarte-navy">My Account</h1>
            <p className="text-gray-600">Manage your profile and children</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="space-y-8">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-cocinarte-orange" />
                Account Information
              </CardTitle>
              <CardDescription>Your personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">Name</span>
                  </div>
                  <p className="text-lg">{parentData.parent_guardian_names}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="font-semibold">Email</span>
                  </div>
                  <p className="text-lg">{parentData.parent_email}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold">Phone</span>
                  </div>
                  <p className="text-lg">{parentData.parent_phone}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="font-semibold">Preferred Contact</span>
                  </div>
                  <Badge className="bg-cocinarte-orange">
                    {parentData.preferred_communication_method === 'email' ? 'Email' : 'Text'}
                  </Badge>
                </div>

                {parentData.address && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-600 font-semibold">Address</span>
                    <p className="text-lg">{parentData.address}</p>
                  </div>
                )}

                {parentData.emergency_contact_name && (
                  <div className="md:col-span-2 pt-4 border-t">
                    <h3 className="font-semibold mb-2">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name: </span>
                        <span>{parentData.emergency_contact_name}</span>
                      </div>
                      {parentData.emergency_contact_phone && (
                        <div>
                          <span className="text-gray-600">Phone: </span>
                          <span>{parentData.emergency_contact_phone}</span>
                        </div>
                      )}
                      {parentData.emergency_contact_relationship && (
                        <div>
                          <span className="text-gray-600">Relationship: </span>
                          <span>{parentData.emergency_contact_relationship}</span>
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
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-cocinarte-orange" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-cocinarte-orange/10 rounded-lg">
                  <div className="text-3xl font-bold text-cocinarte-orange">
                    {parentData.children.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {parentData.children.length === 1 ? 'Child' : 'Children'} Registered
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {parentData.children.filter(c => c.media_permission).length}
                  </div>
                  <div className="text-sm text-gray-600">Media Permissions</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {parentData.children.filter(c => c.has_cooking_experience).length}
                  </div>
                  <div className="text-sm text-gray-600">With Experience</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
