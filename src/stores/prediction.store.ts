import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Prediction } from '@/types'

interface PredictionState {
  predictions: Record<string, Prediction> // matchId → Prediction
  drafts: Record<string, { home: number; away: number }> // matchId → draft

  setDraft: (matchId: string, home: number, away: number) => void
  clearDraft: (matchId: string) => void
  confirmPrediction: (prediction: Prediction) => void
  getPrediction: (matchId: string) => Prediction | undefined
  getDraft: (matchId: string) => { home: number; away: number } | undefined
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      predictions: {},
      drafts: {},

      setDraft: (matchId, home, away) =>
        set((s) => ({ drafts: { ...s.drafts, [matchId]: { home, away } } })),

      clearDraft: (matchId) =>
        set((s) => {
          const drafts = { ...s.drafts }
          delete drafts[matchId]
          return { drafts }
        }),

      confirmPrediction: (prediction) =>
        set((s) => {
          const predictions = { ...s.predictions, [prediction.matchId]: prediction }
          const drafts = { ...s.drafts }
          delete drafts[prediction.matchId]
          return { predictions, drafts }
        }),

      getPrediction: (matchId) => get().predictions[matchId],
      getDraft: (matchId) => get().drafts[matchId],
    }),
    { name: 'bolao-predictions' }
  )
)
