import { useState, useEffect } from 'react'
import { Mail, RefreshCw, X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function EmailVerificationBanner() {
  const { user, isEmailVerified, resendVerificationEmail, refreshUser } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [resending, setResending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const [statusType, setStatusType] = useState('') // 'success' | 'error' | ''

  // Initialize dismissed state from sessionStorage
  useEffect(() => {
    if (sessionStorage.getItem('cardom_dismiss_verify_banner') === 'true') {
      setDismissed(true)
    }
  }, [])

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // If user is not logged in, email is verified, or user dismissed for this session
  if (!user || isEmailVerified || dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('cardom_dismiss_verify_banner', 'true')
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    setMessage('')

    const { error } = await resendVerificationEmail(user.email)
    setResending(false)

    if (error) {
      setStatusType('error')
      setMessage(error)
    } else {
      setStatusType('success')
      setMessage('Verification link sent! Please check your inbox.')
      setCooldown(60)
    }
  }

  const handleCheckStatus = async () => {
    if (checking) return
    setChecking(true)
    setMessage('')

    const { user: freshUser, error } = await refreshUser()
    setChecking(false)

    if (error) {
      setStatusType('error')
      setMessage('Failed to check status. Please try again.')
    } else if (freshUser?.email_confirmed_at) {
      setStatusType('success')
      setMessage('Email verified successfully!')
    } else {
      setStatusType('error')
      setMessage('Email is not verified yet. Please check your inbox.')
    }
  }

  return (
    <div className="relative z-40 bg-amber-500/10 border-b border-amber-500/25 px-4 py-2.5 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Please verify your email address (<strong>{user.email}</strong>) to secure your account.
          </span>
          {message && (
            <span
              className={`font-semibold ml-2 ${
                statusType === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {message}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Mail className="w-3 h-3" />
            )}
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            I&apos;ve Verified
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-md text-amber-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            aria-label="Dismiss verification banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

