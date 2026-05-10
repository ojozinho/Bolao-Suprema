import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Prediction } from '@/types'
import { supabase, isMockMode } from '@/lib/supabase'

interface PredictionState {
  predictions: Record<string, Prediction> // matchId → Prediction
  drafts: Record<string, { home: number; away: number }> // matchId → draft

  // apostas gerais (antes do início do torneio)
  championPick: string | null  // campeão — 25 pts
  vicePick: string | null      // vice-campeão — 15 pts
  scorerPick: string | null    // artilheiro (nome do jogador) — 10 pts + desempate

  _userId: string | undefined

  setUserId: (id: string | undefined) => void
  syncFromSupabase: (userId: string) => Promise<void>

  setDraft: (matchId: string, home: number, away: number) => void
  clearDraft: (matchId: string) => void
  confirmPrediction: (prediction: Prediction) => void
  removePrediction: (matchId: string) => void
  clearAllPredictions: () => void
  getPrediction: (matchId: string) => Prediction | undefined
  getDraft: (matchId: string) => { home: number; away: number } | undefined
  setChampionPick: (teamCode: string) => void
  setVicePick: (teamCode: string) => void
  setScorerPick: (playerName: string) => void
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      predictions: {},
      drafts: {},
      championPick: null,
      vicePick: null,
      scorerPick: null,
      _userId: undefined,

      setUserId: (id) => set({ _userId: id }),

      // ── Sync from Supabase on login ─────────────────────────────────────────

      syncFromSupabase: async (userId) => {
        if (isMockMode) return
        const { data } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', userId)
          .not('match_code', 'is', null)

        if (!data?.length) return

        const predictions: Record<string, Prediction> = { ...get().predictions }
        for (const row of data) {
          if (!row.match_code) continue
          predictions[row.match_code] = {
            id:           row.id,
            userId:       row.user_id,
            matchId:      row.match_code,
            homeScore:    row.home_score,
            awayScore:    row.away_score,
            submittedAt:  row.submitted_at,
            pointsEarned: row.points_earned ?? undefined,
          }
        }
        set({ predictions })

        // Sync general picks from users table
        const { data: user } = await supabase
          .from('users')
          .select('champion_pick, vice_pick, scorer_pick')
          .eq('id', userId)
          .single()

        if (user) {
          set({
            championPick: user.champion_pick ?? get().championPick,
            vicePick:     user.vice_pick     ?? get().vicePick,
            scorerPick:   user.scorer_pick   ?? get().scorerPick,
          })
        }
      },

      // ── Drafts (local only) ─────────────────────────────────────────────────

      setDraft: (matchId, home, away) =>
        set((s) => ({ drafts: { ...s.drafts, [matchId]: { home, away } } })),

      clearDraft: (matchId) =>
        set((s) => {
          const drafts = { ...s.drafts }
          delete drafts[matchId]
          return { drafts }
        }),

      // ── confirmPrediction: local + Supabase upsert ──────────────────────────

      confirmPrediction: (prediction) => {
        set((s) => {
          const predictions = { ...s.predictions, [prediction.matchId]: prediction }
          const drafts = { ...s.drafts }
          delete drafts[prediction.matchId]
          return { predictions, drafts }
        })

        const userId = get()._userId
        if (!isMockMode && userId) {
          supabase.from('predictions').upsert(
            {
              user_id:   userId,
              match_code: prediction.matchId,
              home_score: prediction.homeScore,
              away_score: prediction.awayScore,
              submitted_at: prediction.submittedAt,
            },
            { onConflict: 'user_id,match_code' }
          ).then(({ error }) => {
            if (error) console.error('[Predictions] Upsert error:', error.message)
          })
        }
      },

      removePrediction: (matchId) =>
        set((s) => {
          const predictions = { ...s.predictions }
          delete predictions[matchId]
          return { predictions }
        }),

      clearAllPredictions: () =>
        set({ predictions: {}, drafts: {}, championPick: null, vicePick: null, scorerPick: null }),

      getPrediction: (matchId) => get().predictions[matchId],
      getDraft: (matchId) => get().drafts[matchId],

      // ── General picks: local + sync to users table ──────────────────────────

      setChampionPick: (teamCode) => {
        set({ championPick: teamCode })
        const uid = get()._userId
        if (!isMockMode && uid) {
          supabase.from('users').update({ champion_pick: teamCode }).eq('id', uid)
            .then(({ error }) => { if (error) console.error('[Predictions] champion_pick:', error.message) })
        }
      },

      setVicePick: (teamCode) => {
        set({ vicePick: teamCode })
        const uid = get()._userId
        if (!isMockMode && uid) {
          supabase.from('users').update({ vice_pick: teamCode }).eq('id', uid)
            .then(({ error }) => { if (error) console.error('[Predictions] vice_pick:', error.message) })
        }
      },

      setScorerPick: (playerName) => {
        set({ scorerPick: playerName })
        const uid = get()._userId
        if (!isMockMode && uid) {
          supabase.from('users').update({ scorer_pick: playerName }).eq('id', uid)
            .then(({ error }) => { if (error) console.error('[Predictions] scorer_pick:', error.message) })
        }
      },
    }),
    { name: 'bolao-predictions' }
  )
)
