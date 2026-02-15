import { create } from 'zustand'

const USER_STORAGE_KEY = 'canstory_auth_user'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
  fullName?: string | null
  avatarUrl?: string | null
}

const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null

  try {
    const storedValue = window.localStorage.getItem(USER_STORAGE_KEY)
    if (!storedValue) return null
    return JSON.parse(storedValue) as AuthUser
  } catch (error) {
    console.warn('[AUTH] Failed to parse stored user, clearing cache.', error)
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

const persistUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return

  if (!user) {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const storedUser = getStoredUser()
  return {
    auth: {
      user: storedUser,
      setUser: (user) =>
        set((state) => {
          persistUser(user)
          return { ...state, auth: { ...state.auth, user } }
        }),
      reset: () =>
        set((state) => {
          persistUser(null)
          return {
            ...state,
            auth: { ...state.auth, user: null },
          }
        }),
    },
  }
})
