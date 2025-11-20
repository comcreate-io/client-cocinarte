"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import SignupQuestionnaireMultiChild from '../auth/signup-questionnaire-multi-child'
import { SignupFormData } from '@/types/student'

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function CocinarteAuthPopup({ isOpen, onClose }: AuthPopupProps) {
  const [authStep, setAuthStep] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [parentName, setParentName] = useState('')
  const [childName, setChildName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  
  const { signIn, signUp, signUpWithStudentInfo } = useAuth()

  const resetAuthForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setParentName('')
    setChildName('')
    setPhone('')
    setAddress('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAuthError('')
    setAuthMessage('')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setAuthError(error.message)
      } else {
        setAuthMessage('Successfully signed in!')
        setTimeout(() => {
          onClose()
          resetAuthForm()
        }, 1500)
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.')
    }
    
    setAuthLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    // Validate password confirmation
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match')
      setAuthLoading(false)
      return
    }

    // Validate required fields
    if (!parentName || !childName || !email || !phone || !address) {
      setAuthError('Please fill in all required fields')
      setAuthLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)

      if (error) {
        setAuthError(error.message)
      } else {
        setAuthMessage('Account created successfully!')
        setTimeout(() => {
          onClose()
          resetAuthForm()
        }, 2000)
      }
    } catch (error) {
      setAuthError('Error creating account. Please try again.')
    }

    setAuthLoading(false)
  }

  const handleQuestionnaireComplete = async (formData: SignupFormData) => {
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    try {
      const { error } = await signUpWithStudentInfo(formData)

      if (error) {
        setAuthError(error.message || 'Failed to create account')
        setAuthLoading(false)
        return { error }
      }

      setAuthMessage('Account created successfully!')
      setTimeout(() => {
        onClose()
        resetAuthForm()
      }, 2000)

      return { error: null }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred')
      setAuthLoading(false)
      return { error: err }
    }
  }

  const renderLoginForm = () => (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
              <LogIn className="h-5 w-5 text-cocinarte-navy" />
            </div>
            Sign In
          </CardTitle>
          <CardDescription className="text-slate-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-sm font-semibold text-slate-700">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-semibold text-slate-700">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {authMessage && (
              <Alert>
                <AlertDescription>{authMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={authLoading}
                className="flex-1 h-12 bg-cocinarte-navy hover:bg-cocinarte-navy/90 text-white"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => setAuthStep('signup')}
                className="text-cocinarte-navy hover:underline font-semibold"
              >
                Sign up here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSignupForm = () => (
    <div className="space-y-6">
      {/* Back to Sign In Link */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAuthStep('login')}
          className="text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Sign In
        </Button>
      </div>

      {/* Comprehensive Signup Questionnaire */}
      <SignupQuestionnaireMultiChild
        onComplete={handleQuestionnaireComplete}
        loading={authLoading}
      />

      {authError && (
        <Alert variant="destructive">
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      {authMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{authMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-cocinarte-navy text-white p-6 rounded-t-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <LogIn className="h-8 w-8" />
              </div>
              {authStep === 'login' ? 'Sign In' : 'Create Account'}
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              {authStep === 'login' 
                ? 'Welcome back! Sign in to your account to book cooking classes.'
                : 'Join us today! Create an account to start booking cooking classes.'
              }
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6">
          {authStep === 'login' ? renderLoginForm() : renderSignupForm()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
