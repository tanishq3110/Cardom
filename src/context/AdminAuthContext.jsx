import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { checkAdminAccess, loginAdmin, logoutAdmin, bootstrapFirstAdmin } from '@/services/adminAuthApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [adminProfile, setAdminProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [canBootstrap, setCanBootstrap] = useState(false)

  const refreshAdmin = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        const check = await checkAdminAccess()
        if (check.is_admin) {
          setAdminProfile(check)
          setRole(check.role)
          setCanBootstrap(false)
        } else if (check.can_bootstrap) {
          setAdminProfile(null)
          setRole(null)
          setCanBootstrap(true)
        } else {
          setAdminProfile(null)
          setRole(null)
          setCanBootstrap(false)
        }
      } else {
        setAdminProfile(null)
        setRole(null)
        setCanBootstrap(false)
      }
    } catch (err) {
      console.error('[AdminAuthProvider] refreshAdmin error:', err)
      setAdminProfile(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAdmin()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await refreshAdmin()
      } else {
        setUser(null)
        setAdminProfile(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshAdmin])

  const handleLogin = async (email, password) => {
    setLoading(true)
    const result = await loginAdmin(email, password)
    if (result.data) {
      await refreshAdmin()
    }
    setLoading(false)
    return result
  }

  const handleLogout = async () => {
    await logoutAdmin()
    setUser(null)
    setAdminProfile(null)
    setRole(null)
  }

  const handleBootstrap = async (fullName) => {
    const result = await bootstrapFirstAdmin(fullName)
    if (result.success) {
      await refreshAdmin()
    }
    return result
  }

  const value = {
    user,
    adminProfile,
    role,
    isAuthenticated: Boolean(user && adminProfile?.is_admin),
    isSuperAdmin: role === 'SUPER_ADMIN',
    canBootstrap,
    loading,
    login: handleLogin,
    logout: handleLogout,
    bootstrap: handleBootstrap,
    refreshAdmin,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
