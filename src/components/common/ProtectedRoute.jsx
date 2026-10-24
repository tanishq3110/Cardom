import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { ShieldAlert, Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading, canBootstrap } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-zinc-400 font-mono tracking-wider">Verifying Admin Credentials...</p>
      </div>
    )
  }

  // Not signed in to Supabase auth at all
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If signed in but not an authorized admin, and bootstrapping is available
  if (!isAuthenticated && canBootstrap) {
    return <Navigate to="/login" state={{ bootstrap: true }} replace />
  }

  // Signed in but unauthorized
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Access Denied</h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-md">
          You are authenticated as <span className="text-white font-mono">{user.email}</span>, but your account does not have Cardom Administrator authorization.
        </p>
        <button
          onClick={() => window.location.href = '/admin/login'}
          className="mt-6 px-4 py-2 rounded-xl bg-[#202020] border border-[#303030] text-sm text-white hover:bg-[#282828] transition-colors"
        >
          Return to Admin Login
        </button>
      </div>
    )
  }

  return children
}
