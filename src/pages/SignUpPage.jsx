import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight,
  AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { cn } from '@/lib/utils'

// ─── Field ───────────────────────────────────────────────────────────────────
function Field({ label, id, type = 'text', value, onChange, placeholder, error, autoComplete, rightEl }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-zinc-300 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600',
            'bg-[#111111] border transition-all duration-200 outline-none',
            'focus:ring-1',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/[0.08] focus:border-orange-500 focus:ring-orange-500/20',
            rightEl && 'pr-12',
          )}
        />
        {rightEl && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {rightEl}
          </div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── PasswordStrength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null
  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length >= 6 ? 1 : 0
  const labels = ['Too short', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-400', 'bg-emerald-400']
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= strength ? colors[strength] : 'bg-white/[0.08]',
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', strength === 0 ? 'text-red-400' : strength === 1 ? 'text-yellow-400' : strength === 2 ? 'text-blue-400' : 'text-emerald-400')}>
        {labels[strength]}
      </p>
    </div>
  )
}

// ─── SignUpPage ───────────────────────────────────────────────────────────────
export function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!fullName.trim())    errs.fullName = 'Please enter your full name.'
    if (!email.trim())       errs.email    = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.'
    if (!password)           errs.password = 'Please choose a password.'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length) return setFieldErrors(errs)
    setFieldErrors({})
    setLoading(true)

    const { error: err } = await signUp({ fullName, email, password })
    setLoading(false)

    if (err) return setError(err)

    // Supabase may require email confirmation — show success state
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-dvh bg-[#080808] flex flex-col text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="rounded-2xl border border-emerald-500/20 bg-[#0d0d0d] p-10 text-center shadow-2xl shadow-black/60">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5 text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account created!</h2>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Welcome to Cardom. Check your email to confirm your address, then sign in.
              </p>
              <Link
                to="/login"
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold',
                  'bg-orange-500 text-white hover:bg-orange-600 transition-colors',
                )}
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
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

            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-sm text-zinc-400 mb-8">Join Cardom — your automotive platform</p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Field
                label="Full name"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                autoComplete="name"
                error={fieldErrors.fullName}
              />

              <Field
                label="Email address"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                error={fieldErrors.email}
              />

              <div className="space-y-2">
                <Field
                  label="Password"
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  error={fieldErrors.password}
                  rightEl={
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <PasswordStrength password={password} />
              </div>

              {/* Error banner */}
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
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                )}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                  : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>

              <p className="text-xs text-zinc-600 text-center">
                By creating an account you agree to our{' '}
                <Link to="/terms" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

