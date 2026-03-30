'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/auth-context'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { isAdminUser } from '@/lib/supabase/admin'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Check if user is an admin
    const supabase = createClient()
    const isAdmin = await isAdminUser(supabase, email)
    
    if (!isAdmin) {
      setError('Access denied. Only admin users can access the dashboard.')
      // Sign out the user since they're not an admin
      await supabase.auth.signOut()
      setLoading(false)
      return
    }
    
    setMessage('Successfully signed in!')
    router.push('/dashboard')
    setLoading(false)
  }


  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8 w-[350px] h-[200px] mx-auto ">
          <Image
            src="/cocinarte/cocinarteLogo.png"
            alt="Cocinarte"
            width={200}
            height={64}
            className="object-contain w-full h-full"
          />
        </div>

        <Card className="bg-cocinarte-white/95 backdrop-blur-sm shadow-2xl ">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-600">
              Welcome to Cocinarte
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mb-4">
                <AlertDescription className="text-green-700">{message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cocinarte-navy font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-cocinarte-orange" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-cocinarte-orange/30 focus:border-cocinarte-orange focus:ring-cocinarte-orange"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cocinarte-navy font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-cocinarte-orange" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-cocinarte-orange/30 focus:border-cocinarte-orange focus:ring-cocinarte-orange"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-cocinarte-orange hover:text-cocinarte-red"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-cocinarte-red hover:bg-cocinarte-orange text-cocinarte-white font-semibold transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-cocinarte-white/80 text-sm">
            Need help? Contact us at{' '}
            <a href="mailto:cocinarte@casitaazulpdx.org" className="text-cocinarte-white hover:text-cocinarte-yellow transition-colors duration-200">
              cocinarte@casitaazulpdx.org
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
