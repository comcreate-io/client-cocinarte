'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { SignupFormData, StudentRegistrationData } from '@/types/student'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signUpWithStudentInfo: (formData: SignupFormData) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signUpWithStudentInfo = async (formData: SignupFormData) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        return { error: authError }
      }

      if (!authData.user) {
        return { error: new Error('Failed to create user') }
      }

      // 2. Create parent record
      const parentData = {
        user_id: authData.user.id,
        parent_guardian_names: formData.parentInfo.parent_guardian_names,
        parent_phone: formData.parentInfo.parent_phone,
        parent_email: formData.parentInfo.parent_email,
        preferred_communication_method: formData.parentInfo.preferred_communication_method,
        emergency_contact_name: formData.parentInfo.emergency_contact_name,
        emergency_contact_phone: formData.parentInfo.emergency_contact_phone,
        emergency_contact_relationship: formData.parentInfo.emergency_contact_relationship,
        address: formData.parentInfo.address,
      }

      const { data: parentRecord, error: parentError } = await supabase
        .from('parents')
        .insert([parentData])
        .select()
        .single()

      if (parentError) {
        console.error('Failed to create parent record:', parentError)
        return { error: parentError }
      }

      // 3. Create child records
      if (formData.children && formData.children.length > 0) {
        const childrenData = formData.children.map(child => ({
          parent_id: parentRecord.id,
          child_full_name: child.child_full_name,
          child_age: child.child_age,
          child_preferred_name: child.child_preferred_name,
          has_cooking_experience: child.has_cooking_experience,
          cooking_experience_details: child.cooking_experience_details,
          allergies: child.allergies,
          dietary_restrictions: child.dietary_restrictions,
          medical_conditions: child.medical_conditions,
          emergency_medications: child.emergency_medications,
          additional_notes: child.additional_notes,
          authorized_pickup_persons: child.authorized_pickup_persons,
          custody_restrictions: child.custody_restrictions,
          media_permission: child.media_permission,
        }))

        const { error: childrenError } = await supabase
          .from('children')
          .insert(childrenData)

        if (childrenError) {
          console.error('Failed to create children records:', childrenError)
          return { error: childrenError }
        }
      }

      return { error: null }
    } catch (err) {
      console.error('Signup error:', err)
      return { error: err }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signUpWithStudentInfo,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
