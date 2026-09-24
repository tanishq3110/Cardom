import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/sections/Footer'
import { cn } from '@/lib/utils'

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ label, id, type = 'text', value, onChange, placeholder, error, rightEl }) {
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
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'on'}
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

// ─── LoginPage ────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { signIn, requestPasswordReset } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [isForgotView, setIsForgotView] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return setError('Please fill in all fields.')
    setError('')
    setLoading(true)

    const { error: err } = await signIn({ email, password })
    setLoading(false)

    if (err) return setError(err)
    navigate(redirectTo)
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.trim()) return setError('Please enter your email address.')
    setError('')
    setSuccess('')
    setLoading(true)

    const { error: err } = await requestPasswordReset(email.trim())
    setLoading(false)

    if (err) {
      return setError(err)
    }
    setSuccess('Password reset link sent! Check your inbox and click the link to reset your password.')
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
          {/* Card */}
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

            {isForgotView ? (
              <>
                <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
                <p className="text-sm text-zinc-400 mb-8">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <form onSubmit={handleForgotSubmit} className="space-y-5" noValidate>
                  <Field
                    label="Email address"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />

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

                  {/* Success banner */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/[0.1] border border-emerald-500/25 text-emerald-400 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{success}</span>
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
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending Reset Link…</>
                    ) : (
                      <><span>Send Reset Link</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotView(false)
                      setError('')
                      setSuccess('')
                    }}
                    className="w-full text-center text-sm text-zinc-400 hover:text-white transition-colors pt-2"
                  >
                    Back to Sign In
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                <p className="text-sm text-zinc-400 mb-8">Sign in to your Cardom account</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <Field
                    label="Email address"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-xs font-semibold text-zinc-300 tracking-wide">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotView(true)
                          setError('')
                          setSuccess('')
                        }}
                        className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={cn(
                          'w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600',
                          'bg-[#111111] border transition-all duration-200 outline-none pr-12',
                          'focus:ring-1',
                          error
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-white/[0.08] focus:border-orange-500 focus:ring-orange-500/20',
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors"
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
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
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                      : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </form>

                {/* Footer link */}
                <p className="mt-6 text-center text-sm text-zinc-500">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                    Create one
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

