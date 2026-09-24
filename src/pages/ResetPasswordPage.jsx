import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Zap, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { cn } from '@/lib/utils'

export function ResetPasswordPage() {
  const { user, isPasswordRecovery, updatePassword, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw1, setShowPw1] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Supabase can put access_token in the URL hash, e.g. #access_token=...&type=recovery
  const hasRecoveryHash = typeof window !== 'undefined' && window.location.hash.includes('type=recovery')
  const isValidSession = Boolean(user || isPasswordRecovery || hasRecoveryHash)

  useEffect(() => {
    // If auth state finishes loading and there is definitely no user, recovery flag, or hash
    if (!authLoading && !isValidSession) {
      setError('Your password reset link is invalid or has expired. Please request a new one.')
    }
  }, [authLoading, isValidSession])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      return setError('Please enter and confirm your new password.')
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long.')
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match. Please ensure both fields are identical.')
    }

    setLoading(true)
    const { error: err } = await updatePassword(newPassword)
    setLoading(false)

    if (err) {
      return setError(err)
    }

    setSuccess(true)
    setTimeout(() => {
      navigate('/account')
    }, 2500)
  }

  return (
    <div className="min-h-dvh bg-[#080808] flex flex-col text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-16">
        {/* Background glow */}
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 shadow-2xl shadow-black/60">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-[0_0_14px_rgba(249,115,22,0.4)]">
                <Zap className="w-4 h-4 text-white fill-white" strokeWidth={0} />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Card<span className="text-orange-500">om</span>
              </span>
            </div>

            {success ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Password Updated!</h1>
                <p className="text-sm text-zinc-400">
                  Your password has been changed successfully. Redirecting you to your account…
                </p>
                <div className="pt-2">
                  <Link
                    to="/account"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    Go to Account
                  </Link>
                </div>
              </div>
            ) : !isValidSession && !authLoading ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Link Expired</h1>
                <p className="text-sm text-zinc-400">
                  This password reset link is invalid or has expired. Please request a new link to reset your password.
                </p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="w-5 h-5 text-orange-400" />
                  <h1 className="text-2xl font-bold text-white">Set New Password</h1>
                </div>
                <p className="text-sm text-zinc-400 mb-8">
                  Create a new secure password for your Cardom account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="newPassword" className="block text-xs font-semibold text-zinc-300 tracking-wide">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPw1 ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        className={cn(
                          'w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600',
                          'bg-[#111111] border transition-all duration-200 outline-none pr-12',
                          'focus:ring-1 border-white/[0.08] focus:border-orange-500 focus:ring-orange-500/20'
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
                        <button
                          type="button"
                          onClick={() => setShowPw1((v) => !v)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors"
                          aria-label={showPw1 ? 'Hide password' : 'Show password'}
                        >
                          {showPw1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-300 tracking-wide">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showPw2 ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className={cn(
                          'w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600',
                          'bg-[#111111] border transition-all duration-200 outline-none pr-12',
                          'focus:ring-1 border-white/[0.08] focus:border-orange-500 focus:ring-orange-500/20'
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
                        <button
                          type="button"
                          onClick={() => setShowPw2((v) => !v)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors"
                          aria-label={showPw2 ? 'Hide password' : 'Show password'}
                        >
                          {showPw2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error Banner */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.07] border border-red-500/20 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      'w-full flex items-center justify-center gap-2',
                      'px-5 py-3 rounded-xl text-sm font-semibold',
                      'bg-orange-500 text-white',
                      'hover:bg-orange-600 transition-all duration-200',
                      'hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]',
                      'disabled:opacity-60 disabled:cursor-not-allowed'
                    )}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Updating Password…</>
                    ) : (
                      <><span>Update Password</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <Link
                      to="/login"
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Cancel and Return to Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

