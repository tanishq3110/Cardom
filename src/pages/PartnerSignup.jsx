import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Building2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const PARTNER_TYPES = ['Car Dealer', 'Service Center', 'Insurance Partner', 'Finance Partner']

export function PartnerSignup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    registrationNumber: '',
    password: '',
    confirmPassword: '',
    partnerType: 'Car Dealer',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successInfo, setSuccessInfo] = useState(null)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.businessName.trim() || !form.contactName.trim() || !form.email.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!form.terms) {
      setError('Please accept the Partner Agreement and Terms to continue.')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: signupError } = await signUp({
      email: form.email,
      password: form.password,
      businessName: form.businessName,
      contactName: form.contactName,
      partnerCategory: form.partnerType,
      registrationNumber: form.registrationNumber,
      phone: form.phone,
    })

    setLoading(false)

    if (signupError) {
      if (signupError.message.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Please log in instead.')
      } else if (signupError.message.toLowerCase().includes('weak')) {
        setError('Password is too weak. Please use letters and numbers.')
      } else {
        setError(signupError.message || 'Signup failed. Please try again.')
      }
      return
    }

    if (data?.requiresConfirmation) {
      setSuccessInfo({
        title: 'Registration Submitted',
        message: 'Your partner account has been created. Please check your email to verify your address before logging in.',
        unconfirmed: true,
      })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-lg bg-[#202020] border border-[#2A2A2A] text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors'
  const labelCls = 'block text-xs font-semibold text-[#A1A1AA] mb-1.5 uppercase tracking-wide'

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500 shadow-xl shadow-orange-500/20 mb-3">
            <Building2 className="w-6 h-6 text-black" />
          </div>
          <div className="text-white font-black text-xl tracking-wide">CARDOM PARTNER</div>
          <p className="text-[#A1A1AA] text-sm mt-1">Join as an automotive partner</p>
        </div>

        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl">
          {successInfo ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">{successInfo.title}</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm mx-auto">
                {successInfo.message}
              </p>
              <div className="p-3 rounded-xl bg-[#202020] border border-[#2A2A2A] text-left text-xs space-y-1 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Business:</span>
                  <span className="font-semibold text-white">{form.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Category:</span>
                  <span className="text-orange-400">{form.partnerType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Status:</span>
                  <span className="text-amber-400">Verification Pending</span>
                </div>
              </div>
              <Link
                to="/login"
                className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm tracking-wide transition-colors block text-center mt-4"
              >
                PROCEED TO LOGIN
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Apex Motors"
                    value={form.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={form.contactName}
                    onChange={(e) => set('contactName', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Business Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@example.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Partner Type *</label>
                  <select
                    value={form.partnerType}
                    onChange={(e) => set('partnerType', e.target.value)}
                    className={inputCls + ' cursor-pointer'}
                  >
                    {PARTNER_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-[#202020] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Registration / GSTIN</label>
                  <input
                    type="text"
                    placeholder="27AABCU9603R1ZM"
                    value={form.registrationNumber}
                    onChange={(e) => set('registrationNumber', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      className={inputCls + ' pr-11'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                      className={inputCls + ' pr-11'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => set('terms', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#333] accent-orange-500"
                />
                <span className="text-xs text-[#A1A1AA] leading-relaxed select-none">
                  I agree to the{' '}
                  <span className="text-orange-400">Cardom Partner Agreement</span>{' '}and{' '}
                  <span className="text-orange-400">Privacy Policy</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'CREATING ACCOUNT...' : 'CREATE PARTNER ACCOUNT'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[#A1A1AA] mt-6">
          Already registered as a partner?{' '}
          <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
