import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getPartnerUnreadNotificationCount } from '@/services/partnerNotificationsApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [partnerProfile, setPartnerProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setPartnerProfile(null)
      return null
    }

    try {
      const { data, error } = await supabase
        .from('partner_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Could not fetch partner profile:', error.message)
        return null
      }

      setPartnerProfile(data)
      return data
    } catch (err) {
      console.error('Error fetching partner profile:', err)
      return null
    }
  }, [])

  const loadUnreadNotifications = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUnreadNotificationsCount(0)
      return
    }
    const count = await getPartnerUnreadNotificationCount()
    setUnreadNotificationsCount(count || 0)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await Promise.all([
            fetchProfile(currentUser.id),
            loadUnreadNotifications(currentUser),
          ])
        } else {
          setPartnerProfile(null)
          setUnreadNotificationsCount(0)
        }
      } catch (err) {
        console.error('Session initialization error:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await Promise.all([
          fetchProfile(currentUser.id),
          loadUnreadNotifications(currentUser),
        ])
      } else {
        setPartnerProfile(null)
        setUnreadNotificationsCount(0)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [fetchProfile, loadUnreadNotifications])

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await fetchProfile(user.id)
    }
    return null
  }, [user, fetchProfile])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        return { data: null, error }
      }

      if (data?.user) {
        const profile = await fetchProfile(data.user.id)
        return { data: { ...data, partnerProfile: profile }, error: null }
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  const signUp = async ({
    email,
    password,
    businessName,
    contactName,
    partnerCategory,
    registrationNumber = '',
    phone = '',
  }) => {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            business_name: businessName,
            role: 'partner',
          },
        },
      })

      if (authError) {
        return { data: null, error: authError }
      }

      const createdUser = authData?.user
      if (!createdUser) {
        return { data: null, error: new Error('User creation returned empty payload.') }
      }

      const requiresConfirmation = !authData.session

      // 2. Insert corresponding partner_profiles record
      const categoryKey = partnerCategory.toLowerCase().includes('service')
        ? 'service_center'
        : partnerCategory.toLowerCase().includes('dealer')
        ? 'car_dealer'
        : partnerCategory.toLowerCase().includes('insurance')
        ? 'insurance'
        : partnerCategory.toLowerCase().includes('finance')
        ? 'finance'
        : partnerCategory

      const profilePayload = {
        id: createdUser.id,
        business_name: businessName,
        authorized_contact_name: contactName,
        partner_category: categoryKey,
        registration_number: registrationNumber || null,
        phone: phone || null,
        email: email.trim(),
        status: 'pending',
        is_verified: false,
      }

      const { data: profileData, error: profileError } = await supabase
        .from('partner_profiles')
        .insert(profilePayload)
        .select()
        .single()

      if (profileError) {
        console.warn('Profile row insertion result:', profileError.message)
      } else {
        setPartnerProfile(profileData)
      }

      return {
        data: {
          user: createdUser,
          partnerProfile: profileData || profilePayload,
          requiresConfirmation,
        },
        error: null,
      }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Error during sign out:', err)
    } finally {
      setUser(null)
      setPartnerProfile(null)
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      })
      return { error }
    } catch (err) {
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        partnerProfile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        requestPasswordReset,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        refreshUnreadNotifications: () => loadUnreadNotifications(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
