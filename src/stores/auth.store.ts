import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppUser } from '@/types'
import { supabase, isMockMode } from '@/lib/supabase'
import { MOCK_ME } from '@/data/mock'

interface AuthState {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  profileComplete: boolean

  setUser: (user: AppUser | null) => void
  signInWithEmail: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  loadSession: () => Promise<void>
  updateProfile: (data: Partial<AppUser>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      profileComplete: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          profileComplete: !!(user?.firstName && user?.dept),
        }),

      signInWithEmail: async (email: string) => {
        if (isMockMode) {
          // Mock login — simulate magic link success
          set({ user: MOCK_ME, isAuthenticated: true, profileComplete: true })
          return {}
        }
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/Bolao-Suprema/#/profile`,
          },
        })
        return error ? { error: error.message } : {}
      },

      signOut: async () => {
        if (!isMockMode) await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false, profileComplete: false })
      },

      loadSession: async () => {
        if (isMockMode) {
          // In mock mode, restore persisted user or stay logged out
          const stored = get().user
          set({ user: stored, isAuthenticated: !!stored, isLoading: false })
          return
        }
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
          set({
            user: profile ?? null,
            isAuthenticated: true,
            profileComplete: !!(profile?.firstName && profile?.dept),
            isLoading: false,
          })
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      updateProfile: async (data: Partial<AppUser>) => {
        const current = get().user
        if (!current) return
        const updated = { ...current, ...data }
        set({ user: updated, profileComplete: !!(updated.firstName && updated.dept) })
        if (!isMockMode) {
          await supabase.from('users').upsert({ id: current.id, ...data })
        }
      },
    }),
    {
      name: 'bolao-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
