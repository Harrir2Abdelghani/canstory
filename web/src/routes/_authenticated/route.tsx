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
          useAuthStore.getState().auth.setUser(normalizedUser)
          currentUser = normalizedUser
        } else {
          throw redirect({ to: '/sign-in', replace: true })
        }
      } catch (e) {
        if (e && typeof e === 'object' && 'to' in e) throw e
        throw redirect({ to: '/sign-in', replace: true })
      }
    }

    if (!currentUser || !isAdminRole(currentUser.role)) {
      throw redirect({ to: '/sign-in', replace: true })
    }
  },
  component: AuthenticatedLayout,
})
