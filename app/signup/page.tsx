'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import SignupQuestionnaire from '@/components/auth/signup-questionnaire'
import { SignupFormData } from '@/types/student'
import Image from 'next/image'
import Link from 'next/link'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const { signUpWithStudentInfo } = useAuth()
  const router = useRouter()

  const handleSignupComplete = async (formData: SignupFormData) => {
    setLoading(true)

    const { error } = await signUpWithStudentInfo(formData)

    if (error) {
      setLoading(false)
      return { error }
    }

    // Redirect to success page or dashboard
    router.push('/signup/success')
    return { error: null }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cocinarte-yellow/20 via-cocinarte-white to-cocinarte-orange/20 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/cocinarte/cocinarteLogo.png"
              alt="Cocinarte"
              width={200}
              height={64}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cocinarte-navy mb-2">
            Welcome to Cocinarte!
          </h1>
          <p className="text-gray-600">
            Let's get your child enrolled in our cooking classes. This will only take a few minutes.
          </p>
        </div>

        {/* Questionnaire */}
        <SignupQuestionnaire onComplete={handleSignupComplete} loading={loading} />

        {/* Already have an account */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-cocinarte-orange hover:text-cocinarte-red font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
