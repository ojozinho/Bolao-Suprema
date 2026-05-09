import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BracketRound, TeamCode } from '@/types'

interface BracketState {
  picks: Record<string, TeamCode> // slotId → pickedWinner
  lockedRounds: BracketRound[]

  setPick: (slotId: string, winner: TeamCode) => void
  clearPick: (slotId: string) => void
  lockRound: (round: BracketRound) => void
  isRoundLocked: (round: BracketRound) => boolean
  getPick: (slotId: string) => TeamCode | undefined

  /** Returns the predicted home/away for a QF/SF/Final slot based on R16 picks */
  resolveSlotTeams: (
    slotId: string,
    allSlots: Array<{ slotId: string; round: BracketRound; position: number; homeTeam: { code: string } | null; awayTeam: { code: string } | null; winner: string | null }>
  ) => { home: TeamCode | null; away: TeamCode | null }
}

// Bracket adjacency: which R16 slots feed which QF slots
const R16_TO_QF: Record<number, { qfPosition: number; side: 'home' | 'away' }> = {
  1: { qfPosition: 1, side: 'home' },
  2: { qfPosition: 1, side: 'away' },
  3: { qfPosition: 2, side: 'home' },
  4: { qfPosition: 2, side: 'away' },
  5: { qfPosition: 3, side: 'home' },
  6: { qfPosition: 3, side: 'away' },
  7: { qfPosition: 4, side: 'home' },
  8: { qfPosition: 4, side: 'away' },
}

const QF_TO_SF: Record<number, { sfPosition: number; side: 'home' | 'away' }> = {
  1: { sfPosition: 1, side: 'home' },
  2: { sfPosition: 1, side: 'away' },
  3: { sfPosition: 2, side: 'home' },
  4: { sfPosition: 2, side: 'away' },
}

const SF_TO_FINAL: Record<number, { side: 'home' | 'away' }> = {
  1: { side: 'home' },
  2: { side: 'away' },
}

export const useBracketStore = create<BracketState>()(
  persist(
    (set, get) => ({
      picks: {},
      lockedRounds: [],

      setPick: (slotId, winner) =>
        set((s) => ({ picks: { ...s.picks, [slotId]: winner } })),

      clearPick: (slotId) =>
        set((s) => {
          const picks = { ...s.picks }
          delete picks[slotId]
          return { picks }
        }),

      lockRound: (round) =>
        set((s) => ({
          lockedRounds: s.lockedRounds.includes(round)
            ? s.lockedRounds
            : [...s.lockedRounds, round],
        })),

      isRoundLocked: (round) => get().lockedRounds.includes(round),
      getPick: (slotId) => get().picks[slotId],

      resolveSlotTeams: (slotId, allSlots) => {
        const { picks } = get()

        const getSlot = (id: string) => allSlots.find((s) => s.slotId === id)

        // For a QF slot, find the two R16 picks that feed it
        if (slotId.startsWith('qf_')) {
          const position = parseInt(slotId.replace('qf_', ''))
          const r16Homes = Object.entries(R16_TO_QF)
            .filter(([, v]) => v.qfPosition === position && v.side === 'home')
            .map(([k]) => `r16_${k}`)
          const r16Aways = Object.entries(R16_TO_QF)
            .filter(([, v]) => v.qfPosition === position && v.side === 'away')
            .map(([k]) => `r16_${k}`)

          const homeSlotId = r16Homes[0]
          const awaySlotId = r16Aways[0]
          const homeSlot = getSlot(homeSlotId)
          const awaySlot = getSlot(awaySlotId)

          // Use real winner if known, else use user's pick
          const home = (homeSlot?.winner || picks[homeSlotId]) ?? null
          const away = (awaySlot?.winner || picks[awaySlotId]) ?? null
          return { home: home as TeamCode | null, away: away as TeamCode | null }
        }

        if (slotId.startsWith('sf_')) {
          const position = parseInt(slotId.replace('sf_', ''))
          const qfHomes = Object.entries(QF_TO_SF)
            .filter(([, v]) => v.sfPosition === position && v.side === 'home')
            .map(([k]) => `qf_${k}`)
          const qfAways = Object.entries(QF_TO_SF)
            .filter(([, v]) => v.sfPosition === position && v.side === 'away')
            .map(([k]) => `qf_${k}`)

          const homeQfId = qfHomes[0]
          const awayQfId = qfAways[0]
          const homeQf = getSlot(homeQfId)
          const awayQf = getSlot(awayQfId)

          const home = (homeQf?.winner || picks[homeQfId]) ?? null
          const away = (awayQf?.winner || picks[awayQfId]) ?? null
          return { home: home as TeamCode | null, away: away as TeamCode | null }
        }

        if (slotId === 'final_1') {
          const sf1 = getSlot('sf_1')
          const sf2 = getSlot('sf_2')
          const home = (sf1?.winner || picks['sf_1']) ?? null
          const away = (sf2?.winner || picks['sf_2']) ?? null
          return { home: home as TeamCode | null, away: away as TeamCode | null }
        }

        return { home: null, away: null }
      },
    }),
    { name: 'bolao-bracket' }
  )
)
