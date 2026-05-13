import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppUser } from '@/types'
import { supabase, isMockMode, uploadFile } from '@/lib/supabase'
import { MOCK_ME } from '@/data/mock'
import { getInitials } from '@/lib/utils'
import { usePredictionStore } from './prediction.store'

function syncPredictions(userId: string) {
  const store = usePredictionStore.getState()
  store.setUserId(userId)
  store.syncFromSupabase(userId)
}

// ─── DB row → AppUser ─────────────────────────────────────────────────────────

interface UserRow {
  id: string; email: string; first_name: string; last_name: string
  dept: string; initials: string; color: string
  avatar_url?: string | null; banner_url?: string | null; bio?: string | null
  favorite_team?: string | null; favorite_player?: string | null
  favorite_player_img?: string | null
  champion_pick?: string | null; vice_pick?: string | null; scorer_pick?: string | null
  since: string; is_admin: boolean; is_marketing: boolean; created_at: string
}

function mapUser(row: UserRow): AppUser {
  return {
    id:                row.id,
    email:             row.email,
    firstName:         row.first_name  ?? '',
    lastName:          row.last_name   ?? '',
    dept:              row.dept        ?? '',
    initials:          row.initials    ?? '',
    color:             row.color       ?? '#00A651',
    avatarUrl:         row.avatar_url  ?? undefined,
    bannerUrl:         row.banner_url  ?? undefined,
    bio:               row.bio         ?? undefined,
    favoriteTeam:      row.favorite_team      ?? undefined,
    favoritePlayer:    row.favorite_player     ?? undefined,
    favoritePlayerImg: row.favorite_player_img ?? undefined,
    since:             row.since ?? String(new Date().getFullYear()),
    isAdmin:           row.is_admin    ?? false,
    isMarketing:       row.is_marketing ?? false,
    createdAt:         row.created_at  ?? new Date().toISOString(),
  }
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface AuthState {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  profileComplete: boolean

  setUser: (user: AppUser | null) => void
  sendOtp: (email: string) => Promise<{ error?: string }>
  verifyOtp: (email: string, token: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  loadSession: () => Promise<void>
  updateProfile: (data: Partial<AppUser>, photoFile?: File, bannerFile?: File) => Promise<void>
  refreshProfile: () => Promise<void>
}

// ─── Store ────────────────────────────────────────────────────────────────────

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
          isLoading: false,
        }),

      sendOtp: async (email) => {
        const normalized = email.trim().toLowerCase()
        if (!normalized.endsWith('@suprema.group')) {
          return { error: 'Use seu e-mail corporativo @suprema.group' }
        }
        if (isMockMode) return {}
        const { error } = await supabase.auth.signInWithOtp({
          email: normalized,
          options: { shouldCreateUser: true },
        })
        return error ? { error: error.message } : {}
      },

      verifyOtp: async (email, token) => {
        if (isMockMode) {
          set({ user: MOCK_ME, isAuthenticated: true, profileComplete: true, isLoading: false })
          syncPredictions(MOCK_ME.id)
          return {}
        }

        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: token.trim(),
          type: 'email',
        })
        if (error) return { error: 'Código inválido ou expirado.' }
        if (!data.user) return { error: 'Erro ao validar código.' }

        const { data: profile } = await supabase
          .from('users').select('*').eq('id', data.user.id).single()

        if (profile) {
          const user = mapUser(profile as UserRow)
          set({
            user,
            isAuthenticated: true,
            profileComplete: !!(user.firstName && user.dept),
            isLoading: false,
          })
          syncPredictions(user.id)
        } else {
          // First login — stub until profile is completed
          const stub: AppUser = {
            id: data.user.id,
            email: data.user.email ?? email,
            firstName: '',
            lastName: '',
            dept: '',
            initials: '',
            color: '#00A651',
            since: String(new Date().getFullYear()),
            isAdmin: false,
            isMarketing: false,
            createdAt: new Date().toISOString(),
          }
          set({ user: stub, isAuthenticated: true, profileComplete: false, isLoading: false })
        }
        return {}
      },

      signOut: async () => {
        if (!isMockMode) await supabase.auth.signOut()
        usePredictionStore.getState().clearAllPredictions()
        usePredictionStore.getState().setUserId(undefined)
        set({ user: null, isAuthenticated: false, profileComplete: false })
      },

      loadSession: async () => {
        if (isMockMode) {
          const stored = get().user
          set({
            user: stored,
            isAuthenticated: !!stored,
            profileComplete: !!(stored?.firstName && stored?.dept),
            isLoading: false,
          })
          return
        }
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const { data: profile } = await supabase
            .from('users').select('*').eq('id', data.session.user.id).single()
          const user = profile ? mapUser(profile as UserRow) : null
          set({
            user,
            isAuthenticated: true,
            profileComplete: !!(user?.firstName && user?.dept),
            isLoading: false,
          })
          if (user?.id) syncPredictions(user.id)
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      refreshProfile: async () => {
        const uid = get().user?.id
        if (!uid || isMockMode) return
        const { data } = await supabase.from('users').select('*').eq('id', uid).single()
        if (data) set({ user: mapUser(data as UserRow) })
      },

      updateProfile: async (data, photoFile, bannerFile) => {
        const current = get().user
        if (!current) return

        let avatarUrl = current.avatarUrl
        let bannerUrl = current.bannerUrl

        if (!isMockMode) {
          if (photoFile) avatarUrl = (await uploadFile(current.id, 'avatar', photoFile)) ?? avatarUrl
          if (bannerFile) bannerUrl = (await uploadFile(current.id, 'banner', bannerFile)) ?? bannerUrl
        }

        const updated: AppUser = { ...current, ...data, avatarUrl, bannerUrl }
        const initials = getInitials(`${updated.firstName} ${updated.lastName}`) || updated.initials
        updated.initials = initials

        set({
          user: updated,
          profileComplete: !!(updated.firstName && updated.dept),
        })

        if (!isMockMode) {
          await supabase.from('users').upsert({
            id: current.id,
            email: current.email,
            first_name: updated.firstName,
            last_name: updated.lastName,
            dept: updated.dept,
            initials,
            color: updated.color,
            avatar_url: avatarUrl,
            banner_url: bannerUrl,
            bio: updated.bio,
            favorite_team:       updated.favoriteTeam,
            favorite_player:     updated.favoritePlayer,
            favorite_player_img: updated.favoritePlayerImg ?? null,
            since:               updated.since,
          })
        }
      },
    }),
    {
      name: 'bolao-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
