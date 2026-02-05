'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Lock, CheckCircle, X, Check, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Password strength checker
function usePasswordStrength(password: string) {
  return useMemo(() => {
    const checks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    }
    const strength = Object.values(checks).filter(Boolean).length
    return { checks, strength, isStrong: strength >= 4 }
  }, [password])
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const passwordStrength = usePasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!passwordStrength.isStrong) {
      toast.error('Please create a stronger password')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSuccess(true)
      toast.success('Password updated successfully!')
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="relative text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
            <p className="text-white/60 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>

            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-semibold py-5 rounded-xl shadow-lg shadow-green-500/25"
            >
              Continue to Login
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {/* Glassmorphism Card */}
      <div className="relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="relative">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25"
          >
            <ShieldCheck className="h-8 w-8 text-white" />
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2">Set new password</h1>
              <p className="text-white/50">Your new password must be different from previously used passwords</p>
            </motion.div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordRules(true)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              {/* Password Strength Indicator */}
              {showPasswordRules && password && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-4 bg-white/5 border border-white/10 rounded-xl space-y-3"
                >
                  {/* Strength Bar */}
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.strength >= level
                            ? passwordStrength.strength <= 2
                              ? 'bg-red-500'
                              : passwordStrength.strength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-2 transition-colors ${passwordStrength.checks.minLength ? 'text-green-400' : 'text-white/40'}`}>
                      {passwordStrength.checks.minLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      8+ characters
                    </div>
                    <div className={`flex items-center gap-2 transition-colors ${passwordStrength.checks.hasUppercase ? 'text-green-400' : 'text-white/40'}`}>
                      {passwordStrength.checks.hasUppercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      Uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 transition-colors ${passwordStrength.checks.hasLowercase ? 'text-green-400' : 'text-white/40'}`}>
                      {passwordStrength.checks.hasLowercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      Lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 transition-colors ${passwordStrength.checks.hasNumber ? 'text-green-400' : 'text-white/40'}`}>
                      {passwordStrength.checks.hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      Number
                    </div>
                    <div className={`flex items-center gap-2 transition-colors ${passwordStrength.checks.hasSpecial ? 'text-green-400' : 'text-white/40'}`}>
                      {passwordStrength.checks.hasSpecial ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      Special character
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/70">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                  <X className="w-3 h-3" /> Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-5 rounded-xl shadow-lg shadow-blue-500/25 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Reset Password
            </Button>
          </motion.form>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <Link
              href="/login"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Back to Login
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
