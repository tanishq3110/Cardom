import { supabase } from '@/lib/supabase'

/**
 * Authenticates an administrator via Supabase Auth
 */
export async function loginAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) return { data: null, error }

    // Check admin authorization via secure RPC
    const check = await checkAdminAccess()
    if (!check.is_admin && !check.can_bootstrap) {
      await supabase.auth.signOut()
      return { data: null, error: new Error('Access denied: You do not have administrator privileges.') }
    }

    return { data: { ...data, adminInfo: check }, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Signs out the current admin
 */
export async function logoutAdmin() {
  return await supabase.auth.signOut()
}

/**
 * Checks if the currently authenticated user has admin access
 */
export async function checkAdminAccess() {
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return { is_admin: false, error: 'Unauthenticated' }

    // Try RPC first
    const { data, error } = await supabase.rpc('admin_check_access')
    if (!error && data) {
      return data
    }

    // Direct fallback if RPC is not yet applied
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profile && profile.is_active) {
      return {
        is_admin: true,
        role: profile.role,
        full_name: profile.full_name,
        email: profile.email,
        can_bootstrap: false,
      }
    }

    // Check if zero admin profiles exist
    const { count } = await supabase
      .from('admin_profiles')
      .select('*', { count: 'exact', head: true })

    if (count === 0) {
      return { is_admin: false, can_bootstrap: true }
    }

    return { is_admin: false, error: 'Unauthorized' }
  } catch (err) {
    console.error('[adminAuthApi] checkAdminAccess error:', err)
    return { is_admin: false, error: err.message }
  }
}

/**
 * Bootstraps the very first Super Admin when the system is initialized
 */
export async function bootstrapFirstAdmin(fullName = 'Super Admin') {
  try {
    const { data, error } = await supabase.rpc('admin_bootstrap_first_admin', {
      p_full_name: fullName,
    })
    if (error) {
      // Fallback direct insert if RPC fails
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Unauthenticated')

      const { data: inserted, error: insertErr } = await supabase
        .from('admin_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          role: 'SUPER_ADMIN',
          is_active: true,
        })
        .select()
        .single()

      if (insertErr) throw insertErr
      return { success: true, profile: inserted }
    }
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * List all admin profiles (for Super Admin management)
 */
export async function getAdminProfiles() {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}
