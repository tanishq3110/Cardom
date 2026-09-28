import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const PartnerAuthContext = createContext(null)

export function PartnerAuthProvider({ children }) {
  const [partnerUser, setPartnerUser] = useState(null)
  const [partnerLoading, setPartnerLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setPartnerUser(session?.user ?? null)
      setPartnerLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setPartnerUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const partnerSignIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const partnerSignUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  const partnerSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <PartnerAuthContext.Provider value={{ partnerUser, partnerLoading, partnerSignIn, partnerSignUp, partnerSignOut }}>
      {children}
    </PartnerAuthContext.Provider>
  )
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext)
  if (!ctx) throw new Error('usePartnerAuth must be used within PartnerAuthProvider')
  return ctx
}
