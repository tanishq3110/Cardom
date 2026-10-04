import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchProfile, mapProfile } from '@/services/profileApi'
import { fetchFavorites, toggleFavorite } from '@/services/favoritesApi'
import { fetchUnreadInquiriesCount, subscribeToInquiries } from '@/services/inquiriesApi'
import { getUnreadNotificationCount, subscribeToUserNotifications } from '@/services/notificationsApi'
import {
  initializePushNotifications,
  savePushToken,
  deactivatePushToken,
  cleanupPushNotifications,
  getCurrentPushToken,
} from '@/services/pushNotificationsApi'

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

/**
 * AuthProvider — wraps the entire app and manages Supabase auth, user profile, and favorites state.
 * Provides: user, profile, loading, favoriteIds, isCarFavorite, toggleCarFavorite, refreshFavorites,
 *           signUp, signIn, signOut, refreshProfile
 */
export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null)
  const [profile, setProfile]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [favoriteIds, setFavoriteIds]   = useState([])
  const [togglingCarId, setTogglingCarId] = useState(null)
  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState(0)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  // ── Load user profile ───────────────────────────────────────────────────────
  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null)
      return
    }
    const { data } = await fetchProfile(currentUser.id)
    if (data) {
      setProfile(data)
    } else {
      setProfile(mapProfile(null, currentUser))
    }
  }, [])

  // ── Load user favorites ─────────────────────────────────────────────────────
  const loadFavorites = useCallback(async (currentUser) => {
    if (!currentUser) {
      setFavoriteIds([])
      return
    }
    const { carIds } = await fetchFavorites(currentUser.id)
    setFavoriteIds(carIds || [])
  }, [])

  // ── Load unread inquiries count ─────────────────────────────────────────────
  const loadUnreadInquiries = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUnreadInquiriesCount(0)
      return
    }
    const count = await fetchUnreadInquiriesCount(currentUser.id)
    setUnreadInquiriesCount(count || 0)
  }, [])

  // ── Load unread notifications count ─────────────────────────────────────────────
  const loadUnreadNotifications = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUnreadNotificationsCount(0)
      return
    }
    const count = await getUnreadNotificationCount()
    setUnreadNotificationsCount(count || 0)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user)
    }
  }, [user, loadProfile])

  const refreshFavorites = useCallback(async () => {
    if (user) {
      await loadFavorites(user)
    }
  }, [user, loadFavorites])

  const refreshUnreadInquiries = useCallback(async () => {
    if (user) {
      await loadUnreadInquiries(user)
    }
  }, [user, loadUnreadInquiries])

  // ── Initialize: restore session from storage on mount ──────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        loadProfile(currentUser)
        loadFavorites(currentUser)
        loadUnreadInquiries(currentUser)
        loadUnreadNotifications(currentUser)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }
      if (currentUser) {
        loadProfile(currentUser)
        loadFavorites(currentUser)
        loadUnreadInquiries(currentUser)
        loadUnreadNotifications(currentUser)
      } else {
        setProfile(null)
        setFavoriteIds([])
        setUnreadInquiriesCount(0)
        setUnreadNotificationsCount(0)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile, loadFavorites, loadUnreadInquiries, loadUnreadNotifications])

  // ── Password Recovery Flag ──────────────────────────────────────────────────
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  // ── Email Verification Status ───────────────────────────────────────────────
  const isEmailVerified = Boolean(user?.email_confirmed_at)

  // ── Refresh User (re-checks email_confirmed_at without full page reload) ───
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: freshUser }, error } = await supabase.auth.getUser()
      if (!error && freshUser) {
        setUser(freshUser)
        await loadProfile(freshUser)
        return { user: freshUser, error: null }
      }
      return { user: null, error: error ? formatAuthError(error) : null }
    } catch (err) {
      return { user: null, error: err.message }
    }
  }, [loadProfile])

  // ── Request Password Reset (Forgot Password) ────────────────────────────────
  const requestPasswordReset = useCallback(async (email) => {
    if (!email || !email.trim()) {
      return { error: 'Please enter your email address.' }
    }
    try {
      const redirectUrl = `${window.location.origin}/reset-password`
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      })
      if (error) return { error: formatAuthError(error) }
      return { data, error: null }
    } catch (err) {
      return { error: formatAuthError(err) }
    }
  }, [])

  // ── Update Password (Reset Password) ────────────────────────────────────────
  const updatePassword = useCallback(async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long.' }
    }
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) return { error: formatAuthError(error) }
      setIsPasswordRecovery(false)
      return { data, error: null }
    } catch (err) {
      return { error: formatAuthError(err) }
    }
  }, [])

  // ── Resend Verification Email ───────────────────────────────────────────────
  const resendVerificationEmail = useCallback(async (emailOverride) => {
    const targetEmail = (emailOverride || user?.email || '').trim()
    if (!targetEmail) {
      return { error: 'No email address found to send verification.' }
    }
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
      })
      if (error) return { error: formatAuthError(error) }
      return { data, error: null }
    } catch (err) {
      return { error: formatAuthError(err) }
    }
  }, [user?.email])

  // ── Realtime subscription for inquiries notifications ─────────────────────────
  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = subscribeToInquiries({
      userId: user.id,
      onChange: () => {
        loadUnreadInquiries(user)
      },
    })

    return () => {
      unsubscribe()
    }
  }, [user?.id, loadUnreadInquiries])

  // ── Realtime subscription for notifications ─────────────────────────
  useEffect(() => {
    if (!user?.id) return
    const unsub = subscribeToUserNotifications(user.id, () => {
      setUnreadNotificationsCount(prev => prev + 1)
    })
    return () => unsub()
  }, [user?.id])

  // ── Native Push Notifications (FCM) registration ────────────────────
  useEffect(() => {
    if (!user?.id) return

    initializePushNotifications(
      (token) => {
        savePushToken(token, 'user')
      },
      (data) => {
        // Notification action handling can also be coordinated with Router
        console.log('[AuthContext] Push notification tapped with payload:', data)
      }
    )

    return () => {
      cleanupPushNotifications()
    }
  }, [user?.id])

  // ── Check if a car is favorited ─────────────────────────────────────────────
  const isCarFavorite = useCallback((carId) => {
    if (!carId) return false
    return favoriteIds.includes(String(carId))
  }, [favoriteIds])

  // ── Toggle car favorite with optimistic update & in-flight guard ─────────────
  const toggleCarFavorite = useCallback(async (carId) => {
    if (!user) {
      return { requireLogin: true }
    }
    if (!carId) return { error: 'Invalid car ID' }
    const sId = String(carId)

    // Prevent duplicate in-flight requests for the same car
    if (togglingCarId === sId) return { inFlight: true }
    setTogglingCarId(sId)

    const isCurrentlyFav = favoriteIds.includes(sId)

    // Optimistic UI update
    setFavoriteIds((prev) =>
      isCurrentlyFav ? prev.filter((id) => id !== sId) : [...prev, sId]
    )

    const { isFavorited, error } = await toggleFavorite(user.id, sId, isCurrentlyFav)

    setTogglingCarId(null)

    if (error) {
      // Revert optimistic update on failure
      console.warn('[Cardom Favorites] toggle error, reverting:', error.message)
      setFavoriteIds((prev) =>
        isCurrentlyFav
          ? (prev.includes(sId) ? prev : [...prev, sId])
          : prev.filter((id) => id !== sId)
      )
      return { error: error.message }
    }

    return { isFavorited }
  }, [user, favoriteIds, togglingCarId])

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const signUp = useCallback(async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) return { error: formatAuthError(error) }
    return { data, error: null }
  }, [])

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: formatAuthError(error) }
    return { data, error: null }
  }, [])

  // ── Sign Out ────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      const token = getCurrentPushToken()
      await deactivatePushToken(token, 'user')
    } catch (e) {
      console.warn('[Cardom Auth] Failed to deactivate push token:', e)
    }
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[Cardom Auth] signOut error:', error.message)
    setProfile(null)
    setFavoriteIds([])
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        favoriteIds,
        isCarFavorite,
        toggleCarFavorite,
        refreshFavorites,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        unreadInquiriesCount,
        refreshUnreadInquiries,
        setUnreadInquiriesCount,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        refreshUnreadNotifications: () => loadUnreadNotifications(user),
        isEmailVerified,
        isPasswordRecovery,
        refreshUser,
        requestPasswordReset,
        updatePassword,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth — hook for consuming auth and favorites state in any component.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    return {
      user: null,
      profile: null,
      loading: false,
      favoriteIds: [],
      unreadInquiriesCount: 0,
      unreadNotificationsCount: 0,
      isEmailVerified: false,
      isPasswordRecovery: false,
      isCarFavorite: () => false,
      toggleCarFavorite: async () => ({ requireLogin: true }),
      refreshFavorites: async () => {},
      refreshUnreadInquiries: async () => {},
      setUnreadInquiriesCount: () => {},
      setUnreadNotificationsCount: () => {},
      refreshUnreadNotifications: async () => {},
      signUp: async () => ({ error: 'AuthProvider missing' }),
      signIn: async () => ({ error: 'AuthProvider missing' }),
      signOut: async () => {},
      refreshProfile: async () => {},
      refreshUser: async () => ({ user: null, error: 'AuthProvider missing' }),
      requestPasswordReset: async () => ({ error: 'AuthProvider missing' }),
      updatePassword: async () => ({ error: 'AuthProvider missing' }),
      resendVerificationEmail: async () => ({ error: 'AuthProvider missing' }),
    }
  }
  return ctx
}

// ─── Error normaliser ─────────────────────────────────────────────────────────
function formatAuthError(error) {
  const msg = error?.message?.toLowerCase() ?? ''

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Please sign in instead.'
  }
  if (msg.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your internet connection.'
  }

  return error?.message || 'Something went wrong. Please try again.'
}
