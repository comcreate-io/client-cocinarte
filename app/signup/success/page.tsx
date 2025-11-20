'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Mail, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cocinarte-yellow/20 via-cocinarte-white to-cocinarte-orange/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/cocinarte/cocinarteLogo.png"
            alt="Cocinarte"
            width={200}
            height={64}
            className="object-contain"
          />
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-cocinarte-navy">
              Welcome to Cocinarte!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your account has been created successfully
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Check your email</p>
                  <p>
                    We've sent you a confirmation email. Please verify your email address to complete
                    the registration process.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-cocinarte-navy">What's Next?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Verify your email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Browse our available cooking classes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Book your child's first class</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-4">
              <Link href="/" className="block">
                <Button className="w-full bg-cocinarte-red hover:bg-cocinarte-orange">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </Link>

              <Link href="/login" className="block">
                <Button variant="outline" className="w-full border-cocinarte-orange text-cocinarte-orange hover:bg-cocinarte-orange/10">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Questions?{' '}
            <a
              href="mailto:info@cocinarte.com"
              className="text-cocinarte-orange hover:text-cocinarte-red transition-colors"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
