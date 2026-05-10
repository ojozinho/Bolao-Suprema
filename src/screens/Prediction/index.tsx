import { useState, useMemo, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag } from '@/components/shared/Flag'
import { usePredictionStore } from '@/stores/prediction.store'
import { useBracketStore } from '@/stores/bracket.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { WC2026_MATCHES, WC2026_GROUPS } from '@/data/wc2026'
import { TEAMS } from '@/data/teams'
import { clamp, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type { Match, TeamCode } from '@/types'

type PredTab = 'groups' | 'champion' | 'bracket'

const GROUP_LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const

// ─── Standings engine ─────────────────────────────────────────────────────────

interface StandingRow {
  code: string
  pts: number
  gf: number
  ga: number
  gd: number
  w: number
  d: number
  l: number
  mp: number
}

function computeStandings(
  groupCode: string,
  predictions: Record<string, { homeScore: number; awayScore: number }>
): StandingRow[] {
  const groupDef = WC2026_GROUPS.find(g => g.id === groupCode)
  if (!groupDef) return []

  const rows: Record<string, StandingRow> = {}
  for (const code of groupDef.teams) {
    rows[code] = { code, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0, mp: 0 }
  }

  const matches = WC2026_MATCHES.filter(m => m.group === groupCode)

  for (const m of matches) {
    const pred = predictions[m.id]
    let hg: number | null = null
    let ag: number | null = null

    if (m.status === 'finished' || m.status === 'live') {
      hg = m.homeScore
      ag = m.awayScore
    } else if (pred) {
      hg = pred.homeScore
      ag = pred.awayScore
    }

    if (hg === null || ag === null) continue

    const home = rows[m.home.code]
    const away = rows[m.away.code]
    if (!home || !away) continue

    home.mp++
    away.mp++
    home.gf += hg
    home.ga += ag
    away.gf += ag
    away.ga += hg
    home.gd = home.gf - home.ga
    away.gd = away.gf - away.ga

    if (hg > ag) {
      home.pts += 3; home.w++; away.l++
    } else if (hg === ag) {
      home.pts += 1; away.pts += 1; home.d++; away.d++
    } else {
      away.pts += 3; away.w++; home.l++
    }
  }

  return Object.values(rows).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })
}

// ─── Bracket helpers ──────────────────────────────────────────────────────────

function computeGroupTop2(
  groupCode: string,
  predictions: Record<string, { homeScore: number; awayScore: number }>
): [string | null, string | null] {
  const groupDef = WC2026_GROUPS.find(g => g.id === groupCode)
  if (!groupDef) return [null, null]

  const rows: Record<string, { code: string; pts: number; gf: number; ga: number; gd: number }> = {}
  for (const code of groupDef.teams) {
    rows[code] = { code, pts: 0, gf: 0, ga: 0, gd: 0 }
  }

  const matches = WC2026_MATCHES.filter(m => m.group === groupCode)
  for (const m of matches) {
    const pred = predictions[m.id]
    if (!pred) continue
    const { homeScore: hg, awayScore: ag } = pred
    const home = rows[m.home.code]
    const away = rows[m.away.code]
    if (!home || !away) continue
    home.gf += hg; home.ga += ag; home.gd = home.gf - home.ga
    away.gf += ag; away.ga += hg; away.gd = away.gf - away.ga
    if (hg > ag) { home.pts += 3 }
    else if (hg === ag) { home.pts += 1; away.pts += 1 }
    else { away.pts += 3 }
  }

  const sorted = Object.values(rows).sort((a, b) =>
    b.pts !== a.pts ? b.pts - a.pts : b.gd !== a.gd ? b.gd - a.gd : b.gf - a.gf
  )
  return [sorted[0]?.code ?? null, sorted[1]?.code ?? null]
}

interface R16Def {
  slotId: string
  homeGroup: string
  homeRank: 1 | 2
  awayGroup: string
  awayRank: 1 | 2
  label: string
}

const R16_DEFS: R16Def[] = [
  { slotId: 'r16_1',  homeGroup: 'A', homeRank: 1, awayGroup: 'B', awayRank: 2, label: 'O1' },
  { slotId: 'r16_2',  homeGroup: 'C', homeRank: 1, awayGroup: 'D', awayRank: 2, label: 'O2' },
  { slotId: 'r16_3',  homeGroup: 'E', homeRank: 1, awayGroup: 'F', awayRank: 2, label: 'O3' },
  { slotId: 'r16_4',  homeGroup: 'G', homeRank: 1, awayGroup: 'H', awayRank: 2, label: 'O4' },
  { slotId: 'r16_5',  homeGroup: 'I', homeRank: 1, awayGroup: 'J', awayRank: 2, label: 'O5' },
  { slotId: 'r16_6',  homeGroup: 'K', homeRank: 1, awayGroup: 'L', awayRank: 2, label: 'O6' },
  { slotId: 'r16_7',  homeGroup: 'B', homeRank: 1, awayGroup: 'A', awayRank: 2, label: 'O7' },
  { slotId: 'r16_8',  homeGroup: 'D', homeRank: 1, awayGroup: 'C', awayRank: 2, label: 'O8' },
  { slotId: 'r16_9',  homeGroup: 'F', homeRank: 1, awayGroup: 'E', awayRank: 2, label: 'O9' },
  { slotId: 'r16_10', homeGroup: 'H', homeRank: 1, awayGroup: 'G', awayRank: 2, label: 'O10' },
  { slotId: 'r16_11', homeGroup: 'J', homeRank: 1, awayGroup: 'I', awayRank: 2, label: 'O11' },
  { slotId: 'r16_12', homeGroup: 'L', homeRank: 1, awayGroup: 'K', awayRank: 2, label: 'O12' },
  { slotId: 'r16_13', homeGroup: 'A', homeRank: 2, awayGroup: 'C', awayRank: 2, label: 'O13' },
  { slotId: 'r16_14', homeGroup: 'B', homeRank: 2, awayGroup: 'D', awayRank: 2, label: 'O14' },
  { slotId: 'r16_15', homeGroup: 'E', homeRank: 2, awayGroup: 'G', awayRank: 2, label: 'O15' },
  { slotId: 'r16_16', homeGroup: 'I', homeRank: 2, awayGroup: 'K', awayRank: 2, label: 'O16' },
]

const QF_DEFS = [
  { id: 'qf_1', label: 'Q1', homeR16: 'r16_1',  awayR16: 'r16_2'  },
  { id: 'qf_2', label: 'Q2', homeR16: 'r16_3',  awayR16: 'r16_4'  },
  { id: 'qf_3', label: 'Q3', homeR16: 'r16_5',  awayR16: 'r16_6'  },
  { id: 'qf_4', label: 'Q4', homeR16: 'r16_7',  awayR16: 'r16_8'  },
  { id: 'qf_5', label: 'Q5', homeR16: 'r16_9',  awayR16: 'r16_10' },
  { id: 'qf_6', label: 'Q6', homeR16: 'r16_11', awayR16: 'r16_12' },
  { id: 'qf_7', label: 'Q7', homeR16: 'r16_13', awayR16: 'r16_14' },
  { id: 'qf_8', label: 'Q8', homeR16: 'r16_15', awayR16: 'r16_16' },
]

const SF_DEFS = [
  { id: 'sf_1', label: 'SF1', homeQF: 'qf_1', awayQF: 'qf_2' },
  { id: 'sf_2', label: 'SF2', homeQF: 'qf_3', awayQF: 'qf_4' },
  { id: 'sf_3', label: 'SF3', homeQF: 'qf_5', awayQF: 'qf_6' },
  { id: 'sf_4', label: 'SF4', homeQF: 'qf_7', awayQF: 'qf_8' },
]

function useBracketR16Teams(
  predMap: Record<string, { homeScore: number; awayScore: number }>
): Record<string, { home: string | null; away: string | null }> {
  return useMemo(() => {
    const groupTop2: Record<string, [string | null, string | null]> = {}
    for (const g of GROUP_LABELS) {
      groupTop2[g] = computeGroupTop2(g, predMap)
    }
    const result: Record<string, { home: string | null; away: string | null }> = {}
    for (const def of R16_DEFS) {
      result[def.slotId] = {
        home: def.homeRank === 1 ? (groupTop2[def.homeGroup]?.[0] ?? null) : (groupTop2[def.homeGroup]?.[1] ?? null),
        away: def.awayRank === 1 ? (groupTop2[def.awayGroup]?.[0] ?? null) : (groupTop2[def.awayGroup]?.[1] ?? null),
      }
    }
    return result
  }, [predMap])
}

function resolveBracketTeams(
  slotId: string,
  r16Teams: Record<string, { home: string | null; away: string | null }>,
  picks: Record<string, string>
): { home: string | null; away: string | null } {
  if (slotId.startsWith('r16_')) return r16Teams[slotId] ?? { home: null, away: null }
  const qf = QF_DEFS.find(s => s.id === slotId)
  if (qf) return { home: picks[qf.homeR16] ?? null, away: picks[qf.awayR16] ?? null }
  const sf = SF_DEFS.find(s => s.id === slotId)
  if (sf) return { home: picks[sf.homeQF] ?? null, away: picks[sf.awayQF] ?? null }
  if (slotId === 'final_1') return { home: picks['sf_1'] ?? null, away: picks['sf_2'] ?? null }
  if (slotId === 'third_1') return { home: picks['sf_3'] ?? null, away: picks['sf_4'] ?? null }
  return { home: null, away: null }
}

// ─── Score stepper ────────────────────────────────────────────────────────────

function ScoreControl({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onChange(clamp(value + 1, 0, 9))}
        className="w-9 h-9 flex items-center justify-center border-2 border-ink font-mono text-sm font-bold hover:bg-yellow transition-colors"
      >+</button>
      <div className="score-cell active w-9 h-9">{value}</div>
      <button
        onClick={() => onChange(clamp(value - 1, 0, 9))}
        disabled={value === 0}
        className="w-9 h-9 flex items-center justify-center border-2 border-ink font-mono text-sm font-bold hover:bg-yellow transition-colors disabled:opacity-30"
      >–</button>
    </div>
  )
}

// ─── Match row (expandable inline picker) ─────────────────────────────────────

function MatchRow({ match, onScoreChange }: { match: Match; onScoreChange?: () => void }) {
  const { predictions, drafts, confirmPrediction, setDraft } = usePredictionStore()
  const userId = useAuthStore(s => s.user?.id ?? 'me')
  const existing = predictions[match.id]
  const draft = drafts[match.id]

  const [expanded, setExpanded] = useState(false)
  const [home, setHome] = useState(draft?.home ?? existing?.homeScore ?? 0)
  const [away, setAway] = useState(draft?.away ?? existing?.awayScore ?? 0)

  const isPickable = match.status === 'open' || match.status === 'scheduled'
  const isLocked = match.status === 'locked'
  const isLive = match.status === 'live'
  const isDone = match.status === 'finished'
  const hasPick = !!existing

  const handleHomeChange = (v: number) => { setHome(v); onScoreChange?.() }
  const handleAwayChange = (v: number) => { setAway(v); onScoreChange?.() }

  const handleConfirm = () => {
    confirmPrediction({
      id: `pred-${match.id}`,
      userId,
      matchId: match.id,
      homeScore: home,
      awayScore: away,
      submittedAt: new Date().toISOString(),
    })
    setExpanded(false)
    onScoreChange?.()
  }

  const handleSaveDraft = () => {
    setDraft(match.id, home, away)
    setExpanded(false)
    onScoreChange?.()
  }

  const toggle = () => { if (isPickable) setExpanded(v => !v) }

  return (
    <div className="border-b border-hairline last:border-0">
      {/* ── collapsed row ── */}
      <button
        onClick={toggle}
        className={cn(
          'w-full px-4 py-3 flex items-center gap-2 text-left transition-colors',
          isPickable ? 'hover:bg-hairline cursor-pointer' : 'cursor-default',
          hasPick ? 'bg-green/5' : '',
        )}
      >
        {/* home */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Flag team={match.home} size={20} />
          <span className="font-mono text-[11px] font-bold truncate">{match.home.code}</span>
        </div>

        {/* score / info */}
        <div className="flex items-center gap-1.5 flex-shrink-0 mx-1">
          {isLive && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse-live" />
              <span className="font-display text-base leading-none">{match.homeScore}</span>
              <span className="font-mono text-[10px] text-ink-4">-</span>
              <span className="font-display text-base leading-none">{match.awayScore}</span>
              <span className="font-mono text-[9px] text-red font-bold ml-0.5">{match.liveMinute}</span>
            </div>
          )}
          {isDone && (
            <div className="flex items-center gap-1">
              <span className="font-display text-base leading-none text-ink-3">{match.homeScore}</span>
              <span className="font-mono text-[10px] text-ink-4">-</span>
              <span className="font-display text-base leading-none text-ink-3">{match.awayScore}</span>
              <span className="font-mono text-[8px] text-ink-4 ml-1">FIM</span>
            </div>
          )}
          {(isLocked) && (
            <span className="font-mono text-[9px] text-ink-4 flex items-center gap-1">
              <span>🔒</span>
              {hasPick ? (
                <span className="text-green">{existing.homeScore}–{existing.awayScore}</span>
              ) : (
                <span>SEM PALPITE</span>
              )}
            </span>
          )}
          {!isLive && !isDone && !isLocked && hasPick && (
            <div className="flex items-center gap-1">
              <span className="font-display text-base leading-none text-green">{existing.homeScore}</span>
              <span className="font-mono text-[10px] text-ink-4">-</span>
              <span className="font-display text-base leading-none text-green">{existing.awayScore}</span>
              <span className="font-mono text-[9px] text-green ml-0.5">✓</span>
            </div>
          )}
          {!isLive && !isDone && !isLocked && !hasPick && (
            <span className="font-mono text-[9px] text-ink-3 whitespace-nowrap">
              {match.date.split(' ').slice(1).join(' ')} · {match.time}
            </span>
          )}
        </div>

        {/* away */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className="font-mono text-[11px] font-bold truncate">{match.away.code}</span>
          <Flag team={match.away} size={20} />
        </div>

        {isPickable && (
          <span className="font-mono text-[9px] text-ink-4 ml-2 flex-shrink-0">
            {expanded ? '▲' : hasPick ? '✎' : '▼'}
          </span>
        )}
      </button>

      {/* ── expanded picker ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="picker"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 400 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-5 bg-paper-deep border-t border-hairline">
              <p className="font-mono text-[9px] tracking-eyebrow text-ink-3 mb-1 text-center">
                PALPITE · PLACAR EXATO
              </p>
              <p className="font-mono text-[8px] text-ink-4 mb-4 text-center">{match.venue}</p>
              <div className="flex items-center justify-center gap-5">
                <div className="flex flex-col items-center gap-2 min-w-0">
                  <Flag team={match.home} size={40} />
                  <span className="font-mono text-[10px] font-bold">{match.home.name.split(' ')[0].toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreControl value={home} onChange={handleHomeChange} />
                  <span className="font-serif-it text-2xl text-ink-3">×</span>
                  <ScoreControl value={away} onChange={handleAwayChange} />
                </div>
                <div className="flex flex-col items-center gap-2 min-w-0">
                  <Flag team={match.away} size={40} />
                  <span className="font-mono text-[10px] font-bold">{match.away.name.split(' ')[0].toUpperCase()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleSaveDraft} className="btn-ghost flex-1 text-[11px] py-2.5">
                  RASCUNHO
                </button>
                <button onClick={handleConfirm} className="btn-yellow text-[11px] py-2.5" style={{ flex: 2 }}>
                  CONFIRMAR ✓
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Mini-standings table (quem passa?) ───────────────────────────────────────

function MiniStandings({ standings, totalMatches, filledMatches }: {
  standings: StandingRow[]
  totalMatches: number
  filledMatches: number
}) {
  if (filledMatches === 0) return null

  const classified = standings.slice(0, 2)
  const eliminated = standings.slice(2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-4 mb-4 border-2 border-ink overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 py-2 bg-ink flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-eyebrow text-paper/70">QUEM PASSA?</span>
          <span className="font-mono text-[8px] text-yellow font-bold">
            {filledMatches === totalMatches ? 'GRUPO COMPLETO' : `${filledMatches}/${totalMatches} jogos`}
          </span>
        </div>
        <span className="font-mono text-[8px] text-paper/40">baseado nos seus palpites</span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-3 py-1.5 border-b border-hairline bg-paper-deep">
        <span className="font-mono text-[8px] text-ink-4">SELEÇÃO</span>
        <span className="font-mono text-[8px] text-ink-4 w-6 text-center">PTS</span>
        <span className="font-mono text-[8px] text-ink-4 w-6 text-center">GF</span>
        <span className="font-mono text-[8px] text-ink-4 w-6 text-center">GC</span>
        <span className="font-mono text-[8px] text-ink-4 w-8 text-center">SG</span>
      </div>

      {/* Classified */}
      {classified.map((row, i) => (
        <div
          key={row.code}
          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-3 py-2 border-b border-hairline bg-green/5 items-center"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-green font-bold">{i + 1}°</span>
            <Flag team={TEAMS[row.code]} size={16} />
            <span className="font-mono text-[10px] font-bold">{row.code}</span>
            <span className="font-mono text-[7px] text-green font-bold bg-green/10 px-1 py-0.5">PASSA</span>
          </div>
          <span className="font-display text-sm text-ink w-6 text-center">{row.pts}</span>
          <span className="font-mono text-[9px] text-ink-3 w-6 text-center">{row.gf}</span>
          <span className="font-mono text-[9px] text-ink-3 w-6 text-center">{row.ga}</span>
          <span className={cn('font-mono text-[9px] w-8 text-center', row.gd > 0 ? 'text-green' : row.gd < 0 ? 'text-red' : 'text-ink-4')}>
            {row.gd > 0 ? `+${row.gd}` : row.gd}
          </span>
        </div>
      ))}

      {/* Separator */}
      <div className="px-3 py-1 bg-hairline flex items-center gap-2">
        <div className="flex-1 h-px bg-ink-4/30" />
        <span className="font-mono text-[7px] text-ink-4 tracking-eyebrow">ELIMINADOS</span>
        <div className="flex-1 h-px bg-ink-4/30" />
      </div>

      {/* Eliminated */}
      {eliminated.map((row, i) => (
        <div
          key={row.code}
          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-3 py-2 border-b border-hairline last:border-0 opacity-50 items-center"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-ink-4">{i + 3}°</span>
            <Flag team={TEAMS[row.code]} size={16} />
            <span className="font-mono text-[10px]">{row.code}</span>
          </div>
          <span className="font-display text-sm text-ink-3 w-6 text-center">{row.pts}</span>
          <span className="font-mono text-[9px] text-ink-3 w-6 text-center">{row.gf}</span>
          <span className="font-mono text-[9px] text-ink-3 w-6 text-center">{row.ga}</span>
          <span className="font-mono text-[9px] text-ink-3 w-8 text-center">
            {row.gd > 0 ? `+${row.gd}` : row.gd}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

// ─── Groups tab ───────────────────────────────────────────────────────────────

function GroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<string>('A')
  const { predictions } = usePredictionStore()
  const [tick, setTick] = useState(0)

  const countPerGroup = useMemo(() => {
    const map: Record<string, number> = {}
    for (const g of GROUP_LABELS) {
      map[g] = WC2026_MATCHES.filter(m => m.group === g && predictions[m.id]).length
    }
    return map
  }, [predictions, tick])

  const groupMatches = useMemo(
    () => WC2026_MATCHES.filter(m => m.group === selectedGroup),
    [selectedGroup]
  )

  const totalInGroup = groupMatches.length
  const doneInGroup = countPerGroup[selectedGroup] ?? 0

  const byMatchday = useMemo(() => {
    const map: Record<number, Match[]> = { 1: [], 2: [], 3: [] }
    for (const m of groupMatches) {
      const md = parseInt(m.stageLabel.split('MD')[1] ?? '1')
      ;(map[md] ?? (map[md] = [])).push(m)
    }
    return map
  }, [groupMatches])

  const groupDef = WC2026_GROUPS.find(g => g.id === selectedGroup)

  const standings = useMemo(() => {
    const predMap: Record<string, { homeScore: number; awayScore: number }> = {}
    for (const [matchId, pred] of Object.entries(predictions)) {
      predMap[matchId] = { homeScore: pred.homeScore, awayScore: pred.awayScore }
    }
    return computeStandings(selectedGroup, predMap)
  }, [selectedGroup, predictions, tick])

  const filledMatches = groupMatches.filter(m => {
    if (m.status === 'finished' || m.status === 'live') return true
    return !!predictions[m.id]
  }).length

  const handleScoreChange = useCallback(() => setTick(t => t + 1), [])

  return (
    <div className="pb-24">
      {/* Group pill selector */}
      <div className="px-3 py-3 border-b border-hairline bg-paper sticky top-[44px] z-10 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {GROUP_LABELS.map(g => {
            const done = countPerGroup[g] === 6
            const active = g === selectedGroup
            return (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={[
                  'flex flex-col items-center px-3 py-2 border-2 transition-colors min-w-[44px]',
                  active ? 'bg-ink border-ink text-paper' :
                  done ? 'border-green text-green bg-green/5' :
                  'border-hairline text-ink-3 hover:border-ink hover:text-ink',
                ].join(' ')}
              >
                <span className="font-display text-sm leading-none">{g}</span>
                <span className="font-mono text-[7px] mt-0.5 opacity-60">
                  {countPerGroup[g] ?? 0}/6
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Group header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl">GRUPO {selectedGroup}</span>
          <div className="flex gap-1">
            {groupDef?.teams.map(code => (
              <Flag key={code} team={TEAMS[code]} size={18} />
            ))}
          </div>
        </div>
        <span className="font-mono text-[10px] text-ink-3">
          {doneInGroup}/{totalInGroup} palpites
        </span>
      </div>

      {/* Matchdays */}
      {[1, 2, 3].map(md => {
        const matches = byMatchday[md] ?? []
        if (!matches.length) return null
        return (
          <div key={md}>
            <div className="px-4 py-2 border-t border-hairline mt-2">
              <span className="font-mono text-[9px] tracking-eyebrow text-ink-3">
                RODADA {md}
              </span>
            </div>
            {matches.map(m => (
              <MatchRow key={m.id} match={m} onScoreChange={handleScoreChange} />
            ))}
          </div>
        )
      })}

      {/* Progress bar */}
      {doneInGroup > 0 && (
        <div className="mx-4 mt-4 mb-4">
          <div className="h-1 bg-hairline overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(doneInGroup / totalInGroup) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-green"
            />
          </div>
          <p className="font-mono text-[9px] text-ink-3 mt-1">
            {doneInGroup} de {totalInGroup} jogos do Grupo {selectedGroup} palpitados
          </p>
        </div>
      )}

      {/* Mini standings preview */}
      <MiniStandings
        standings={standings}
        totalMatches={totalInGroup}
        filledMatches={filledMatches}
      />

      {/* CTA when group complete */}
      {doneInGroup === totalInGroup && standings.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 p-3 border-2 border-yellow bg-yellow/10 flex items-center gap-3"
        >
          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-ink-3">GRUPO COMPLETO</p>
            <p className="font-display text-base leading-none">
              {standings[0]?.code} e {standings[1]?.code} avançam no seu palpite
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Team picker grid (shared by champion + vice) ────────────────────────────

function TeamPickerGrid({
  label, pts, pick, onPick,
}: { label: string; pts: number; pick: string | null; onPick: (code: string) => void }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-display text-2xl leading-none">{label}</span>
        <span className="font-mono text-[9px] text-ink-3">+{pts} pontos</span>
      </div>
      {pick && (
        <div className="mb-3 flex items-center gap-2.5 p-2.5 border-2 border-ink bg-yellow">
          <Flag team={TEAMS[pick]} size={28} />
          <div className="flex-1">
            <p className="font-mono text-[8px] tracking-eyebrow text-ink-3">ESCOLHIDO</p>
            <p className="font-display text-base leading-none">{TEAMS[pick]?.name.toUpperCase()}</p>
          </div>
          <span className="font-mono text-[10px] text-green font-bold">✓</span>
        </div>
      )}
      <div className="space-y-3">
        {WC2026_GROUPS.map(group => (
          <div key={group.id}>
            <p className="font-mono text-[8px] tracking-eyebrow text-ink-4 mb-1.5">GRUPO {group.id}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {group.teams.map(code => {
                const team = TEAMS[code]
                if (!team) return null
                const selected = pick === code
                return (
                  <motion.button
                    key={code}
                    onClick={() => onPick(code)}
                    whileTap={{ scale: 0.95 }}
                    className={[
                      'flex flex-col items-center gap-1 py-2 px-1 border-2 transition-colors',
                      selected ? 'border-ink bg-yellow' : 'border-hairline hover:border-ink',
                    ].join(' ')}
                  >
                    <Flag team={team} size={24} />
                    <span className="font-mono text-[7px] font-bold">{code}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Champion tab (campeão + vice + artilheiro) ───────────────────────────────

const GENERAL_DEADLINE = new Date('2026-06-11T18:00:00Z')

function ChampionTab() {
  const { championPick, vicePick, scorerPick, setChampionPick, setVicePick, setScorerPick } = usePredictionStore()
  const [scorerInput, setScorerInput] = useState(scorerPick ?? '')
  const [section, setSection] = useState<'champion' | 'vice' | 'scorer'>('champion')

  const now = new Date()
  const isDeadlinePassed = now >= GENERAL_DEADLINE
  const allSet = championPick && vicePick && scorerPick

  const deadlineStr = '11 Jun · 16:00'

  return (
    <div className="px-4 py-6 pb-24">
      <div className="mb-5">
        <div className="font-display text-4xl leading-none text-ink">APOSTAS GERAIS</div>
        <div className="font-serif-it text-xl text-green-deep leading-snug mt-0.5">
          obrigatórias antes da primeira partida
        </div>
        <div className={cn(
          'mt-2 inline-flex items-center gap-2 px-3 py-1.5 border font-mono text-[10px]',
          isDeadlinePassed
            ? 'border-red/40 bg-red/5 text-red'
            : 'border-yellow/40 bg-yellow/5 text-ink-3'
        )}>
          {isDeadlinePassed ? '🔒 ENCERRADO' : '⏳ PRAZO:'} {deadlineStr}
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { id: 'champion' as const, label: 'CAMPEÃO',   pts: 25, done: !!championPick },
          { id: 'vice' as const,     label: 'VICE',       pts: 15, done: !!vicePick },
          { id: 'scorer' as const,   label: 'ARTILHEIRO', pts: 10, done: !!scorerPick },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => !isDeadlinePassed && setSection(s.id)}
            disabled={isDeadlinePassed && !s.done}
            className={[
              'flex-1 py-2.5 border-2 transition-colors',
              section === s.id ? 'border-ink bg-ink text-paper' :
              s.done ? 'border-green bg-green/5' : 'border-hairline hover:border-ink',
              isDeadlinePassed ? 'opacity-60 cursor-default' : '',
            ].join(' ')}
          >
            <div className="font-mono text-[8px] tracking-eyebrow">{s.label}</div>
            <div className="font-mono text-[8px] text-current/60">+{s.pts} pts</div>
            {s.done && <div className="font-mono text-[8px] text-green">✓</div>}
          </button>
        ))}
      </div>

      {isDeadlinePassed && (
        <div className="mb-5 p-3 border border-red/30 bg-red/5">
          <p className="font-mono text-[10px] text-red">
            Apostas gerais encerradas. As apostas travaram no início da competição.
          </p>
        </div>
      )}

      {!isDeadlinePassed && section === 'champion' && (
        <TeamPickerGrid label="CAMPEÃO" pts={25} pick={championPick} onPick={setChampionPick} />
      )}
      {!isDeadlinePassed && section === 'vice' && (
        <TeamPickerGrid label="VICE-CAMPEÃO" pts={15} pick={vicePick} onPick={setVicePick} />
      )}
      {!isDeadlinePassed && section === 'scorer' && (
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-display text-2xl leading-none">ARTILHEIRO</span>
            <span className="font-mono text-[9px] text-ink-3">+10 pts · critério de desempate</span>
          </div>
          <p className="font-mono text-[10px] text-ink-3 mb-4">
            Quem você acha que vai ser o artilheiro da Copa 2026? Esse palpite é critério de desempate — muito importante!
          </p>
          <div className="border-2 border-ink p-4">
            <p className="font-mono text-[9px] tracking-eyebrow text-ink-3 mb-2">NOME DO JOGADOR</p>
            <input
              value={scorerInput}
              onChange={e => setScorerInput(e.target.value)}
              placeholder="ex: Mbappé, Vinicius Jr, Haaland..."
              className="w-full bg-paper-deep border border-line px-3 py-2.5 font-sans text-[14px] outline-none focus:border-ink placeholder:text-ink-4"
            />
            <button
              onClick={() => { if (scorerInput.trim()) setScorerPick(scorerInput.trim()) }}
              disabled={!scorerInput.trim() || scorerInput.trim() === scorerPick}
              className="mt-3 btn-yellow w-full text-[11px] disabled:opacity-40"
            >
              {scorerPick ? `ALTERAR — ${scorerPick}` : 'CONFIRMAR ARTILHEIRO ✓'}
            </button>
            {scorerPick && (
              <p className="font-mono text-[10px] text-green mt-2 text-center">
                Salvo: {scorerPick} ✓
              </p>
            )}
          </div>
          <p className="font-mono text-[9px] text-ink-4 mt-3">
            Reg. 7: em caso de empate, vale quem mais gols fez entre os artilheiros escolhidos pelos empatados.
          </p>
        </div>
      )}

      {isDeadlinePassed && (
        <div className="space-y-3">
          {championPick && (
            <div className="flex items-center gap-3 p-3 border border-hairline">
              <Flag team={TEAMS[championPick]} size={32} />
              <div>
                <p className="font-mono text-[8px] tracking-eyebrow text-ink-4">CAMPEÃO</p>
                <p className="font-display text-lg">{TEAMS[championPick]?.name.toUpperCase()}</p>
              </div>
              <span className="ml-auto font-mono text-[9px] text-green">✓ +25pts</span>
            </div>
          )}
          {vicePick && (
            <div className="flex items-center gap-3 p-3 border border-hairline">
              <Flag team={TEAMS[vicePick]} size={32} />
              <div>
                <p className="font-mono text-[8px] tracking-eyebrow text-ink-4">VICE</p>
                <p className="font-display text-lg">{TEAMS[vicePick]?.name.toUpperCase()}</p>
              </div>
              <span className="ml-auto font-mono text-[9px] text-green">✓ +15pts</span>
            </div>
          )}
          {scorerPick && (
            <div className="flex items-center gap-3 p-3 border border-hairline">
              <div className="w-8 h-8 flex items-center justify-center border-2 border-hairline font-display text-lg">⚽</div>
              <div>
                <p className="font-mono text-[8px] tracking-eyebrow text-ink-4">ARTILHEIRO</p>
                <p className="font-display text-lg">{scorerPick.toUpperCase()}</p>
              </div>
              <span className="ml-auto font-mono text-[9px] text-green">✓ +10pts</span>
            </div>
          )}
        </div>
      )}

      {allSet && !isDeadlinePassed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green/10 border-2 border-green text-center"
        >
          <p className="font-display text-xl text-green">APOSTAS GERAIS FEITAS ✓</p>
          <p className="font-mono text-[10px] text-green/70 mt-1">
            Campeão: {TEAMS[championPick]?.name} · Vice: {TEAMS[vicePick]?.name} · Artilheiro: {scorerPick}
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Bracket matchup card ─────────────────────────────────────────────────────

function MatchupCard({ slotId, home, away, pick, onPick, label, note }: {
  slotId: string
  home: string | null
  away: string | null
  pick: string | undefined
  onPick: (slotId: string, winner: string) => void
  label: string
  note?: string
}) {
  const homeTeam = home ? TEAMS[home] : null
  const awayTeam = away ? TEAMS[away] : null
  const canPick = !!home && !!away

  return (
    <div className={cn(
      'border-2 bg-paper',
      pick ? 'border-ink' : canPick ? 'border-ink' : 'border-hairline opacity-60'
    )}>
      <div className="px-2 py-1 bg-paper-deep border-b border-hairline flex items-center justify-between">
        <span className="font-mono text-[8px] text-ink-4 font-bold">{label}</span>
        {note && <span className="font-mono text-[7px] text-ink-4">{note}</span>}
      </div>
      {[
        { code: home, team: homeTeam },
        { code: away, team: awayTeam },
      ].map(({ code, team }, i) => (
        <button
          key={i}
          onClick={() => code && canPick && onPick(slotId, code)}
          disabled={!canPick || !code}
          className={cn(
            'w-full flex items-center gap-2 px-2.5 py-2 transition-colors',
            i === 0 ? 'border-b border-hairline' : '',
            pick === code ? 'bg-yellow' : canPick && code ? 'hover:bg-hairline cursor-pointer' : ''
          )}
        >
          {team && code ? (
            <>
              <Flag team={team} size={18} />
              <span className="font-mono text-[10px] font-bold flex-1 text-left truncate">{code}</span>
              {pick === code && <span className="font-mono text-[9px] font-bold text-ink">★</span>}
            </>
          ) : (
            <span className="font-mono text-[9px] text-ink-4 flex-1">TBD</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Bracket tab (mata-mata) ──────────────────────────────────────────────────

function BracketTab() {
  const { predictions } = usePredictionStore()
  const { picks, setPick } = useBracketStore()

  const predMap = useMemo(() => {
    const m: Record<string, { homeScore: number; awayScore: number }> = {}
    for (const [id, pred] of Object.entries(predictions)) {
      m[id] = { homeScore: pred.homeScore, awayScore: pred.awayScore }
    }
    return m
  }, [predictions])

  const r16Teams = useBracketR16Teams(predMap)
  const getTeams = (slotId: string) => resolveBracketTeams(slotId, r16Teams, picks)
  const handlePick = (slotId: string, winner: string) => setPick(slotId, winner as TeamCode)

  const hasGroupPreds = Object.keys(predictions).length > 0
  const champion = picks['final_1']

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 py-5 border-b border-hairline">
        <div className="font-display text-3xl leading-none">MINHA CHAVE</div>
        <div className="font-serif-it text-lg text-ink-3 mt-0.5">quem vai longe no mata-mata?</div>
        {!hasGroupPreds && (
          <div className="mt-3 p-3 border border-yellow/40 bg-yellow/5">
            <p className="font-mono text-[10px] text-ink-3">
              💡 Preencha os palpites dos grupos primeiro — as equipes das oitavas são calculadas automaticamente.
            </p>
          </div>
        )}
      </div>

      {/* R16 */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display text-xl">OITAVAS</span>
          <span className="font-serif-it text-sm text-ink-3">de final · 27 Jun</span>
        </div>
        <p className="font-mono text-[9px] text-ink-4 mb-4 tracking-eyebrow">
          EQUIPES BASEADAS NOS SEUS PALPITES DE GRUPO · CLIQUE PARA ESCOLHER O VENCEDOR
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {R16_DEFS.map(def => {
            const { home, away } = getTeams(def.slotId)
            return (
              <MatchupCard
                key={def.slotId}
                slotId={def.slotId}
                home={home}
                away={away}
                pick={picks[def.slotId]}
                onPick={handlePick}
                label={def.label}
                note={`${def.homeGroup}1×${def.awayGroup}2`}
              />
            )
          })}
        </div>
      </div>

      {/* QF */}
      <div className="px-4 pt-4 pb-3 border-t-2 border-hairline mt-2">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display text-xl">QUARTAS</span>
          <span className="font-serif-it text-sm text-ink-3">de final · 4 Jul</span>
        </div>
        <p className="font-mono text-[9px] text-ink-4 mb-4 tracking-eyebrow">
          VENCEDORES DAS OITAVAS
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QF_DEFS.map(slot => {
            const { home, away } = getTeams(slot.id)
            return (
              <MatchupCard
                key={slot.id}
                slotId={slot.id}
                home={home}
                away={away}
                pick={picks[slot.id]}
                onPick={handlePick}
                label={slot.label}
              />
            )
          })}
        </div>
      </div>

      {/* SF */}
      <div className="px-4 pt-4 pb-3 border-t-2 border-hairline mt-2">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display text-xl">SEMIFINAIS</span>
          <span className="font-serif-it text-sm text-ink-3">14 Jul</span>
        </div>
        <p className="font-mono text-[9px] text-ink-4 mb-4 tracking-eyebrow">
          VENCEDORES DAS QUARTAS
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SF_DEFS.map(slot => {
            const { home, away } = getTeams(slot.id)
            return (
              <MatchupCard
                key={slot.id}
                slotId={slot.id}
                home={home}
                away={away}
                pick={picks[slot.id]}
                onPick={handlePick}
                label={slot.label}
              />
            )
          })}
        </div>
      </div>

      {/* Final + 3rd */}
      <div className="px-4 pt-4 pb-4 border-t-2 border-hairline mt-2">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display text-xl">FINAL</span>
          <span className="font-serif-it text-sm text-ink-3">& 3° lugar · 19 Jul</span>
        </div>
        <p className="font-mono text-[9px] text-ink-4 mb-4 tracking-eyebrow">
          LOS ANGELES · FINAL DO MUNDO
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-mono text-[8px] tracking-eyebrow text-ink-4 mb-1.5">GRANDE FINAL</p>
            <MatchupCard
              slotId="final_1"
              home={getTeams('final_1').home}
              away={getTeams('final_1').away}
              pick={picks['final_1']}
              onPick={handlePick}
              label="FINAL"
            />
          </div>
          <div>
            <p className="font-mono text-[8px] tracking-eyebrow text-ink-4 mb-1.5">3° LUGAR</p>
            <MatchupCard
              slotId="third_1"
              home={getTeams('third_1').home}
              away={getTeams('third_1').away}
              pick={picks['third_1']}
              onPick={handlePick}
              label="3° LUG"
            />
          </div>
        </div>
      </div>

      {/* Champion banner */}
      {champion && TEAMS[champion] && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 p-4 bg-yellow border-2 border-ink text-center"
        >
          <p className="font-mono text-[8px] tracking-eyebrow text-ink-3 mb-2">MEU CAMPEÃO</p>
          <div className="flex items-center justify-center gap-3">
            <Flag team={TEAMS[champion]} size={40} />
            <span className="font-display text-3xl">{TEAMS[champion].name.toUpperCase()}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

function DesktopGroupView({
  selectedGroup,
  predictions,
}: {
  selectedGroup: string
  predictions: Record<string, { homeScore: number; awayScore: number }>
}) {
  const [tick, setTick] = useState(0)
  const handleScoreChange = useCallback(() => setTick(t => t + 1), [])

  const groupMatches = useMemo(
    () => WC2026_MATCHES.filter(m => m.group === selectedGroup),
    [selectedGroup]
  )

  const standings = useMemo(
    () => computeStandings(selectedGroup, predictions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedGroup, predictions, tick]
  )

  const filledMatches = groupMatches.filter(m => {
    if (m.status === 'finished' || m.status === 'live') return true
    return !!predictions[m.id]
  }).length

  const countPerGroup = useMemo(() => {
    return WC2026_MATCHES.filter(m => m.group === selectedGroup && predictions[m.id]).length
  }, [selectedGroup, predictions, tick])

  return (
    <div className="border-2 border-ink flex flex-col">
      <div className="px-5 py-4 border-b border-hairline flex items-center gap-3">
        <span className="font-display text-xl">GRUPO {selectedGroup}</span>
        <div className="flex gap-1">
          {WC2026_GROUPS.find(g => g.id === selectedGroup)?.teams.map(code => (
            <Flag key={code} team={TEAMS[code]} size={20} />
          ))}
        </div>
        <span className="ml-auto font-mono text-[10px] text-ink-3">
          {countPerGroup}/6 palpites
        </span>
      </div>

      {[1, 2, 3].map(md => {
        const matches = WC2026_MATCHES.filter(
          m => m.group === selectedGroup && m.stageLabel.endsWith(`MD${md}`)
        )
        if (!matches.length) return null
        return (
          <div key={md}>
            <div className="px-5 py-2.5 border-b border-hairline bg-paper-deep">
              <span className="font-mono text-[9px] tracking-eyebrow text-ink-3">RODADA {md}</span>
            </div>
            {matches.map(m => (
              <MatchRow key={m.id} match={m} onScoreChange={handleScoreChange} />
            ))}
          </div>
        )
      })}

      {filledMatches > 0 && (
        <div className="border-t-2 border-ink">
          <MiniStandings
            standings={standings}
            totalMatches={groupMatches.length}
            filledMatches={filledMatches}
          />
        </div>
      )}
    </div>
  )
}

function DesktopGroupSidebar({
  selectedGroup,
  onSelect,
  countPerGroup,
}: {
  selectedGroup: string
  onSelect: (g: string) => void
  countPerGroup: Record<string, number>
}) {
  return (
    <div className="border-2 border-ink">
      <div className="px-4 py-3 border-b border-hairline">
        <span className="font-mono text-[10px] tracking-eyebrow text-ink-3">GRUPOS</span>
      </div>
      <div className="divide-y divide-hairline">
        {GROUP_LABELS.map(g => {
          const done = countPerGroup[g] === 6
          const active = g === selectedGroup
          return (
            <button
              key={g}
              onClick={() => onSelect(g)}
              className={[
                'w-full px-4 py-3 flex items-center justify-between transition-colors',
                active ? 'bg-yellow' : 'hover:bg-hairline',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-base">GRUPO {g}</span>
                <div className="flex gap-0.5">
                  {WC2026_GROUPS.find(gr => gr.id === g)?.teams.map(code => (
                    <Flag key={code} team={TEAMS[code]} size={14} />
                  ))}
                </div>
              </div>
              <span className={['font-mono text-[9px]', done ? 'text-green' : 'text-ink-3'].join(' ')}>
                {countPerGroup[g] ?? 0}/6 {done ? '✓' : ''}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Root screen ──────────────────────────────────────────────────────────────

export function PredictionScreen() {
  const { matchId } = useParams<{ matchId?: string }>()
  const location = useLocation()
  const initialTab = (location.state as { tab?: PredTab } | null)?.tab ?? 'groups'
  const [tab, setTab] = useState<PredTab>(initialTab)

  const initialGroup = useMemo(() => {
    if (!matchId) return 'A'
    const m = WC2026_MATCHES.find(m => m.id === matchId)
    return m?.group ?? 'A'
  }, [matchId])

  const [selectedGroup, setSelectedGroup] = useState(initialGroup)
  const { predictions } = usePredictionStore()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()

  const predMap = useMemo(() => {
    const m: Record<string, { homeScore: number; awayScore: number }> = {}
    for (const [matchId, pred] of Object.entries(predictions)) {
      m[matchId] = { homeScore: pred.homeScore, awayScore: pred.awayScore }
    }
    return m
  }, [predictions])

  const countPerGroup = useMemo(() => {
    const map: Record<string, number> = {}
    for (const g of GROUP_LABELS) {
      map[g] = WC2026_MATCHES.filter(m => m.group === g && predictions[m.id]).length
    }
    return map
  }, [predictions])

  const totalDone = Object.values(predictions).length
  const totalMatches = WC2026_MATCHES.length

  const tabs = [
    { id: 'groups' as const,   label: 'GRUPOS' },
    { id: 'champion' as const, label: 'APOSTAS GERAIS' },
    { id: 'bracket' as const,  label: 'MATA-MATA' },
  ]

  return (
    <div className="min-h-dvh bg-paper">
      {/* ── Editorial header ── */}
      <div className="border-b border-hairline px-4 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-5xl md:text-7xl leading-none text-ink">PALPITA</div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif-it text-3xl md:text-5xl text-green-deep leading-none">tudo,</span>
              <span className="font-mono text-[10px] tracking-eyebrow text-ink-3 self-end mb-1">jogador.</span>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="font-display text-3xl text-ink">{totalDone}</div>
            <div className="font-mono text-[9px] text-ink-3">de {totalMatches} jogos</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-hairline flex sticky top-0 lg:top-14 bg-paper z-20">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'flex-1 py-3 font-mono text-[10px] font-bold tracking-eyebrow border-b-2 transition-colors',
              tab === t.id ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {tab === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {isDesktop ? (
              <div className="max-w-screen-xl mx-auto px-6 py-6 grid grid-cols-[260px_1fr] gap-6">
                <DesktopGroupSidebar
                  selectedGroup={selectedGroup}
                  onSelect={setSelectedGroup}
                  countPerGroup={countPerGroup}
                />
                <DesktopGroupView
                  selectedGroup={selectedGroup}
                  predictions={predMap}
                />
              </div>
            ) : (
              <GroupsTab />
            )}
          </motion.div>
        )}

        {tab === 'champion' && (
          <motion.div
            key="champion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <div className="md:max-w-2xl md:mx-auto">
              <ChampionTab />
            </div>
          </motion.div>
        )}

        {tab === 'bracket' && (
          <motion.div
            key="bracket"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <div className="max-w-screen-xl mx-auto">
              <BracketTab />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
