import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function PartnerLogin() {
  const { signIn, requestPasswordReset } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: loginError } = await signIn(email, password)
    setLoading(false)

    if (loginError) {
      if (loginError.message.toLowerCase().includes('invalid login credentials')) {
        setError('Invalid email or password. Please verify your credentials.')
      } else if (loginError.message.toLowerCase().includes('email not confirmed')) {
        setError('Email not confirmed. Please check your inbox for verification link.')
      } else {
        setError(loginError.message || 'Login failed. Please try again.')
      }
      return
    }

    const destination = location.state?.from?.pathname || '/dashboard'
    navigate(destination, { replace: true })
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      setError('Please enter your email address.')
      return
    }
    setResetLoading(true)
    setError(null)
    const { error: resetErr } = await requestPasswordReset(resetEmail)
    setResetLoading(false)
    if (resetErr) {
      setError(resetErr.message)
    } else {
      setResetSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 shadow-xl shadow-orange-500/20 mb-3">
            <Building2 className="w-7 h-7 text-black" />
          </div>
          <div className="text-white font-black text-2xl tracking-wide">CARDOM</div>
          <div className="text-orange-400 font-bold text-xs tracking-[0.3em] uppercase mt-0.5">PARTNER</div>
          <p className="text-[#A1A1AA] text-sm mt-3">Professional automotive business dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl">
          {showForgot ? (
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
              <p className="text-xs text-[#A1A1AA] mb-4">
                Enter your business email address and we will send you a reset link.
              </p>

              {resetSent ? (
                <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-xs text-green-400 mb-4">
                  Password reset link sent! Check your inbox.
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5 uppercase tracking-wide">
                      Business Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="partner@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-[#202020] border border-[#2A2A2A] text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Reset Link
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setShowForgot(false); setResetSent(false); setError(null); }}
                className="mt-4 text-xs text-orange-400 hover:text-orange-300 font-semibold block text-center w-full cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5 uppercase tracking-wide">
                  Business Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="partner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#202020] border border-[#2A2A2A] text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-lg bg-[#202020] border border-[#2A2A2A] text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-[#333] accent-orange-500"
                  />
                  <span className="text-xs text-[#A1A1AA]">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-orange-500/10 cursor-pointer disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[#A1A1AA] mt-6">
          Don&apos;t have a partner account?{' '}
          <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
