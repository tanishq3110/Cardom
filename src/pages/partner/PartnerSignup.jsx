import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react'
import { usePartnerAuth } from '@/context/PartnerAuthContext'

const PARTNER_TYPES = ['Car Dealer', 'Service Center', 'Insurance Partner', 'Finance Partner']

export function PartnerSignup() {
  const { partnerSignUp } = usePartnerAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    partnerType: 'Car Dealer',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!form.terms) {
      setError('Please accept the terms to continue.')
      return
    }
    setLoading(true)
    setError(null)
    const { error: authError } = await partnerSignUp(form.email, form.password)
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      navigate('/partner/dashboard')
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-orange-500 transition-colors'
  const labelCls = 'block text-xs font-semibold text-[#A1A1AA] mb-1.5 uppercase tracking-wide'

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4 py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500 mb-3">
            <Building2 className="w-6 h-6 text-black" />
          </div>
          <div className="text-white font-black text-xl tracking-wide">CARDOM PARTNER</div>
          <p className="text-[#A1A1AA] text-sm mt-1">Create your partner account</p>
        </div>

        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Business Name *</label>
                <input type="text" required placeholder="ABC Motors" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Contact Person *</label>
                <input type="text" required placeholder="Rahul Sharma" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Business Email *</label>
                <input type="email" required placeholder="partner@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Partner Type *</label>
              <select value={form.partnerType} onChange={(e) => set('partnerType', e.target.value)} className={inputCls + ' bg-[#181818]'}>
                {PARTNER_TYPES.map((t) => <option key={t} value={t} className="bg-[#181818]">{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Min 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} className={inputCls + ' pr-11'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} required placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} className={inputCls + ' pr-11'} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} className="w-3.5 h-3.5 mt-0.5 accent-orange-500" />
              <span className="text-xs text-[#A1A1AA] leading-relaxed">
                I agree to Cardom Partner&apos;s{' '}
                <span className="text-orange-400">Terms of Service</span>{' '}and{' '}
                <span className="text-orange-400">Privacy Policy</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Create Partner Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#A1A1AA] mt-4">
          Already have an account?{' '}
          <Link to="/partner/login" className="text-orange-400 hover:text-orange-300 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
