import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

const ADMIN_ROLES = ['admin', 'superadmin']

const isAdminRole = (role: string | string[] | undefined): boolean => {
  if (!role) return false
  const roles = Array.isArray(role) ? role : [role]
  return roles.some((r) => ADMIN_ROLES.includes(String(r).toLowerCase()))
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()

    let currentUser = auth.user
    if (!currentUser) {
      // If no user in store, check session via /me
      console.log('[AUTH_ROUTE] No local user, verifying session...')
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const meUrl = origin ? `${origin}/api/auth/me` : '/api/auth/me'
      try {
        const res = await fetch(meUrl, { credentials: 'include' })
        if (res.ok) {
          const { user } = await res.json()
          const normalizedUser = {
            accountNo: user.id,
            email: user.email,
            role: Array.isArray(user.role) ? user.role : [user.role || ''],
            exp: Date.now() + 24 * 60 * 60 * 1000,
            fullName: user.full_name ?? null,
            avatarUrl: user.avatar_url ?? null,
          }
          auth.setUser(normalizedUser)
          currentUser = normalizedUser
          console.log('[AUTH_ROUTE] Session verified, user loaded.')
        } else {
          console.warn('[AUTH_ROUTE] Session verification failed, redirecting to sign-in.')
          throw redirect({ to: '/sign-in', replace: true })
        }
      } catch (e) {
        if (e && typeof e === 'object' && 'to' in e) throw e
        console.error('[AUTH_ROUTE] Error verifying session:', e)
        throw redirect({ to: '/sign-in', replace: true })
      }
    } else {
      console.log('[AUTH_ROUTE] Using existing session for:', currentUser.email)
    }

    if (!currentUser || !isAdminRole(currentUser.role)) {
      throw redirect({ to: '/sign-in', replace: true })
    }
  },
  component: AuthenticatedLayout,
})
