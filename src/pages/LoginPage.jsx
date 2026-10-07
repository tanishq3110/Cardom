import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/context/AdminAuthContext'
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

      // First sign in or sign up, then call bootstrap
      const loginRes = await login(email, password)
      if (loginRes.error) {
        setError(loginRes.error.message || 'Unable to authenticate with provided credentials.')
        setLoading(false)
        return
      }

      const bootRes = await bootstrap(fullName.trim())
      if (!bootRes.success) {
        setError(bootRes.error || 'Failed to initialize Super Admin.')
        setLoading(false)
        return
      }

      navigate('/dashboard')
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
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isBootstrapping && (
            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Initial System Bootstrap</p>
                <p className="text-zinc-400 mt-0.5 leading-relaxed">
                  No Super Administrator exists yet. Enter your credentials to claim the initial Super Admin account for this Cardom installation.
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
