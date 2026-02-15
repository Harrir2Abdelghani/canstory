import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AdminUser {
  id: string
  email: string
  full_name: string
  phone: string | null
  wilaya: string
  commune: string
  avatar_url: string | null
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
}

export const adminService = {
  async getCurrentAdmin(): Promise<AdminUser> {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      throw new Error('Not authenticated')
    }

    // Try to fetch from database first
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (data) {
        return data
      }
    } catch (dbError) {
      console.log('Database fetch failed, using auth data fallback')
    }

    // Fallback: return user data from auth metadata
    const adminUser: AdminUser = {
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Admin',
      phone: authUser.user_metadata?.phone || null,
      wilaya: authUser.user_metadata?.wilaya || 'Algiers',
      commune: authUser.user_metadata?.commune || 'Algiers',
      avatar_url: authUser.user_metadata?.avatar_url || null,
      is_active: true,
      role: 'admin',
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return adminUser
  },

  async updateAdminProfile(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        wilaya: updates.wilaya,
        commune: updates.commune,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateAdminPassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Password update error:', error)
      throw new Error(error.message || 'Erreur lors du changement de mot de passe')
    }
  },

  async deleteAdminAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
