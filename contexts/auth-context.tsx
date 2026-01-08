'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { SignupFormData, SignupFormDataMultiChild, StudentRegistrationData } from '@/types/student'

interface ConsentData {
  socialMediaConsent: boolean
  liabilityConsent: boolean
  signatureDataUrl: string | null
}

type SignupFormDataWithConsent = SignupFormDataMultiChild & { consentData?: Record<string, ConsentData> }

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signUpWithStudentInfo: (formData: SignupFormData | SignupFormDataWithConsent) => Promise<{ error: any }>
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

  const signUpWithStudentInfo = async (formData: SignupFormData | SignupFormDataWithConsent) => {
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
      // Handle single-child format (from signup questionnaire)
      if ('childInfo' in formData && formData.childInfo) {
        const childData = {
          parent_id: parentRecord.id,
          child_full_name: formData.childInfo.child_full_name,
          child_age: formData.childInfo.child_age,
          child_preferred_name: formData.childInfo.child_preferred_name,
          has_cooking_experience: formData.childInfo.has_cooking_experience,
          cooking_experience_details: formData.childInfo.cooking_experience_details,
          allergies: 'healthSafety' in formData ? formData.healthSafety?.allergies : undefined,
          dietary_restrictions: 'healthSafety' in formData ? formData.healthSafety?.dietary_restrictions : undefined,
          medical_conditions: 'healthSafety' in formData ? formData.healthSafety?.medical_conditions : undefined,
          emergency_medications: 'healthSafety' in formData ? formData.healthSafety?.emergency_medications : undefined,
          additional_notes: 'healthSafety' in formData ? formData.healthSafety?.additional_notes : undefined,
          authorized_pickup_persons: 'pickupInfo' in formData ? formData.pickupInfo?.authorized_pickup_persons : undefined,
          custody_restrictions: 'pickupInfo' in formData ? formData.pickupInfo?.custody_restrictions : undefined,
          media_permission: 'mediaPermission' in formData ? (formData.mediaPermission?.media_permission ?? false) : false,
          terms_accepted: 'termsAcceptance' in formData ? (formData.termsAcceptance?.terms_accepted ?? false) : false,
          terms_accepted_date: 'termsAcceptance' in formData ? formData.termsAcceptance?.terms_accepted_date : undefined,
        }

        const { error: childError } = await supabase
          .from('children')
          .insert([childData])

        if (childError) {
          console.error('Failed to create child record:', childError)
          return { error: childError }
        }
      }
      // Handle multi-child format (from multi-child questionnaire)
      else if ('children' in formData && formData.children && formData.children.length > 0) {
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

        const { data: insertedChildren, error: childrenError } = await supabase
          .from('children')
          .insert(childrenData)
          .select()

        if (childrenError) {
          console.error('Failed to create children records:', childrenError)
          return { error: childrenError }
        }

        // 4. Create consent forms if consent data was provided
        const consentData = (formData as SignupFormDataWithConsent).consentData
        if (consentData && insertedChildren) {
          console.log('Creating consent forms for children:', insertedChildren.length)
          console.log('Consent data keys:', Object.keys(consentData))

          for (const child of insertedChildren) {
            const childConsent = consentData[child.child_full_name]
            console.log(`Looking for consent for "${child.child_full_name}":`, childConsent ? 'Found' : 'Not found')

            if (childConsent?.signatureDataUrl && childConsent?.liabilityConsent) {
              try {
                console.log(`Saving consent for ${child.child_full_name}...`)
                const response = await fetch('/api/consent/sign', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    child_id: child.id,
                    parent_id: parentRecord.id,
                    social_media_consent: childConsent.socialMediaConsent ?? false,
                    liability_consent: childConsent.liabilityConsent,
                    parent_name_signed: formData.parentInfo.parent_guardian_names,
                    child_name_signed: child.child_full_name,
                    signature_data_url: childConsent.signatureDataUrl,
                  }),
                })
                const result = await response.json()
                if (!result.success) {
                  console.error(`Consent form failed for ${child.child_full_name}:`, result.error)
                } else {
                  console.log(`Consent form saved for ${child.child_full_name}`)
                }
              } catch (consentError) {
                console.error('Failed to create consent form:', consentError)
                // Don't fail the whole signup, just log the error
              }
            } else {
              console.log(`Skipping consent for ${child.child_full_name}: signatureDataUrl=${!!childConsent?.signatureDataUrl}, liabilityConsent=${childConsent?.liabilityConsent}`)
            }
          }
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
