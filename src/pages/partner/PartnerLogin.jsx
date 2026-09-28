import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react'
import { usePartnerAuth } from '@/context/PartnerAuthContext'

export function PartnerLogin() {
  const { partnerSignIn } = usePartnerAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: authError } = await partnerSignIn(email, password)
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      navigate('/partner/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 py-12">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 mb-4">
            <Building2 className="w-7 h-7 text-black" />
          </div>
          <div className="text-white font-black text-2xl tracking-wide">CARDOM</div>
          <div className="text-orange-400 font-bold text-xs tracking-[0.3em] uppercase mt-0.5">PARTNER</div>
          <p className="text-[#A1A1AA] text-sm mt-3">Welcome back to your partner dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
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
              className="w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
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
                className="w-full px-4 py-3 pr-11 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors"
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
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-3.5 h-3.5 accent-orange-500"
              />
              <span className="text-xs text-[#A1A1AA]">Remember me</span>
            </label>
            <button type="button" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-xs text-[#A1A1AA] mt-6">
          Don&apos;t have a partner account?{' '}
          <Link to="/partner/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
