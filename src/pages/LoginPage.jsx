import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { supabase } from '@/lib/supabase'
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react'

export function LoginPage() {
  const { login, bootstrap, canBootstrap } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(location.state?.bootstrap || canBootstrap))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (isBootstrapping) {
      if (!fullName.trim()) {
        setError('Please enter your full name.')
        setLoading(false)
        return
      }

      // 1. Try signing in first (in case this email is already registered in Supabase Auth)
      let sessionActive = false
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (!signInErr && signInData?.session) {
        sessionActive = true
      } else {
        // 2. Not signed in, try signing up as a new user in Supabase Auth
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        })

        if (signUpErr) {
          setError(signUpErr.message || 'Unable to register admin credentials.')
          setLoading(false)
          return
        }

        if (signUpData?.session) {
          sessionActive = true
        } else if (signUpData?.user && !signUpData?.session) {
          setError('Admin user registered! If Supabase email confirmation is enabled, please verify your email before proceeding, or check your Supabase Auth dashboard.')
          setLoading(false)
          return
        }
      }

      if (!sessionActive) {
        setError('Authentication session could not be established. Please check your credentials.')
        setLoading(false)
        return
      }

      // 3. Promote authenticated user to first Super Admin via RPC
      const bootRes = await bootstrap(fullName.trim())
      setLoading(false)

      if (!bootRes.success) {
        setError(bootRes.error || 'Failed to initialize Super Admin.')
        return
      }

      navigate('/dashboard', { replace: true })
      return
    }

    const res = await login(email, password)
    setLoading(false)

    if (res.error) {
      setError(res.error.message || 'Invalid admin credentials.')
      return
    }

    const from = location.state?.from?.pathname || '/dashboard'
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500 text-black font-black text-2xl shadow-xl shadow-orange-500/20 mb-2">
            C
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CARDOM ADMIN</h1>
          <p className="text-xs text-zinc-400 font-mono">Centralized Mission & Operations Control</p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl bg-[#121212] border border-[#242424] p-8 shadow-2xl space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#181818] p-1 border border-[#282828]">
            <button
              type="button"
              onClick={() => {
                setIsBootstrapping(false)
                setError(null)
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isBootstrapping
                  ? 'bg-orange-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBootstrapping(true)
                setError(null)
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isBootstrapping
                  ? 'bg-orange-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              First-Time Setup
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
              {!isBootstrapping && error.toLowerCase().includes('credential') && (
                <p className="text-[11px] text-zinc-400 pl-6">
                  First time setting up? Switch to the{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsBootstrapping(true)
                      setError(null)
                    }}
                    className="text-orange-400 hover:underline font-bold"
                  >
                    First-Time Setup
                  </button>{' '}
                  tab above to create and initialize the first Super Admin account.
                </p>
              )}
            </div>
          )}

          {isBootstrapping && (
            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">First-Time Super Admin Bootstrap</p>
                <p className="text-zinc-400 mt-0.5 leading-relaxed">
                  Enter your details below. If you already have a Cardom account, enter its credentials; otherwise, a new Super Admin account will be created automatically.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isBootstrapping && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="E.g. Lead Administrator"
                    className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cardom.com"
                  className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isBootstrapping ? 'Initialize Super Admin' : 'Sign In to Mission Control'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {canBootstrap && !isBootstrapping && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsBootstrapping(true)}
                className="text-xs text-orange-400 hover:underline cursor-pointer"
              >
                Zero admins detected — Bootstrap first Super Admin
              </button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            Protected by Supabase RLS & Role-Based Security
          </p>
        </div>
      </div>
    </div>
  )
}
