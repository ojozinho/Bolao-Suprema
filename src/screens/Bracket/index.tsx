import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag } from '@/components/shared/Flag'
import { Eyebrow } from '@/components/shared/Eyebrow'
import { useBracketStore } from '@/stores/bracket.store'
import { MOCK_BRACKET_SLOTS } from '@/data/mock'
import { TEAMS } from '@/data/teams'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { cn } from '@/lib/utils'
import type { BracketSlot, BracketRound, TeamCode } from '@/types'

const ROUNDS: { id: BracketRound; label: string; count: number }[] = [
  { id: 'r16', label: 'OITAVAS', count: 8 },
  { id: 'qf', label: 'QUARTAS', count: 4 },
  { id: 'sf', label: 'SEMI', count: 2 },
  { id: 'final', label: 'FINAL', count: 1 },
]

export function BracketScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <BracketDesktop /> : <BracketMobile />
}

// ─── Shared slot card ─────────────────────────────────────────────────────────

interface SlotCardProps {
  slot: BracketSlot
  userPick?: TeamCode
  onPick: (slotId: string, team: TeamCode) => void
  isLocked: boolean
  compact?: boolean
}

function SlotCard({ slot, userPick, onPick, isLocked, compact = false }: SlotCardProps) {
  const { homeTeam, awayTeam, homeScore, awayScore, status, winner } = slot
  const isDone = status === 'done' || status === 'pens'
  const isLive = status === 'live'
  const isWait = status === 'wait'

  const pickTeam = (team: typeof homeTeam) => {
    if (!team || isLocked || isDone) return
    onPick(slot.slotId, team.code)
  }

  const statusColor = isLive ? 'text-red' : isDone ? 'text-green' : 'text-ink-4'
  const statusLabel = isLive ? `● ${slot.liveMinute}` : isDone ? '✓ FIM' : isWait ? '◎ TBD' : '○ PRÓXIMO'

  return (
    <div
      className={cn(
        'border-2 bg-paper transition-all duration-150',
        isLive ? 'border-red shadow-card-live' : 'border-ink shadow-card',
        compact ? 'min-w-[160px]' : 'min-w-[200px]'
      )}
    >
      {/* Status bar */}
      <div className={cn('px-2 py-1 flex items-center justify-between border-b border-hairline', compact ? 'px-2' : 'px-3')}>
        <span className={cn('font-mono font-bold', compact ? 'text-[8px]' : 'text-[10px]', statusColor)}>
          {statusLabel}
        </span>
        {slot.slotId.startsWith('r16') && (
          <span className="font-mono text-[8px] text-ink-4">
            {slot.slotId.replace('r16_', 'M')}
          </span>
        )}
      </div>

      {/* Teams */}
      {[homeTeam, awayTeam].map((team, i) => {
        if (!team) {
          return (
            <div key={i} className={cn('flex items-center gap-2 border-hairline', i === 0 ? 'border-b' : '', compact ? 'px-2 py-2' : 'px-3 py-2.5')}>
              <div className={cn('rounded-full bg-stripe flex-shrink-0', compact ? 'w-5 h-5' : 'w-7 h-7')} />
              <span className="font-mono text-ink-4" style={{ fontSize: compact ? 9 : 11 }}>TBD</span>
            </div>
          )
        }

        const score = i === 0 ? homeScore : awayScore
        const isWinner = winner === team.code
        const isPicked = userPick === team.code
        const canPick = !isLocked && !isDone && !isWait

        return (
          <button
            key={i}
            onClick={() => canPick && pickTeam(team)}
            disabled={!canPick}
            className={cn(
              'w-full flex items-center gap-2 transition-all duration-100',
              i === 0 ? 'border-b border-hairline' : '',
              compact ? 'px-2 py-2' : 'px-3 py-2.5',
              canPick && 'hover:bg-yellow/20 cursor-pointer',
              isPicked && !isDone && 'bg-yellow',
              isWinner && isDone && 'bg-green text-paper',
              !isWinner && isDone && winner && 'opacity-40'
            )}
          >
            <Flag team={team} size={compact ? 18 : 22} />
            <span
              className={cn('font-mono font-bold flex-1 text-left truncate', compact ? 'text-[10px]' : 'text-[12px]')}
            >
              {compact ? team.code : team.name}
            </span>
            {score !== null && (
              <span className={cn('font-display', compact ? 'text-lg' : 'text-xl', isWinner ? 'text-paper' : 'text-ink')}>
                {score}
              </span>
            )}
            {isPicked && !isDone && (
              <span className="font-mono text-[9px] font-bold text-ink">★</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Desktop — cinematic tournament tree ──────────────────────────────────────

function BracketDesktop() {
  const { picks, setPick, lockRound, isRoundLocked, resolveSlotTeams } = useBracketStore()
  const [focusedSlot, setFocusedSlot] = useState<string | null>(null)

  const allSlots = MOCK_BRACKET_SLOTS
  const r16 = allSlots.filter(s => s.round === 'r16')
  const qf = allSlots.filter(s => s.round === 'qf')
  const sf = allSlots.filter(s => s.round === 'sf')
  const final = allSlots.filter(s => s.round === 'final')

  const handlePick = (slotId: string, team: TeamCode) => {
    setPick(slotId, team)
    // Cascade: clear downstream picks that depend on this slot
    if (slotId.startsWith('r16_')) {
      const pos = parseInt(slotId.replace('r16_', ''))
      const qfPos = Math.ceil(pos / 2)
      setPick(`qf_${qfPos}`, undefined as unknown as TeamCode) // clear
      const sfPos = Math.ceil(qfPos / 2)
      setPick(`sf_${sfPos}`, undefined as unknown as TeamCode)
      setPick('final_1', undefined as unknown as TeamCode)
    }
  }

  const getResolvedSlot = (slot: BracketSlot): BracketSlot => {
    if (!slot.slotId.startsWith('r16_')) {
      const { home, away } = resolveSlotTeams(slot.slotId, allSlots)
      return {
        ...slot,
        homeTeam: home ? (TEAMS[home] ?? null) : slot.homeTeam,
        awayTeam: away ? (TEAMS[away] ?? null) : slot.awayTeam,
      }
    }
    return slot
  }

  const championCode = picks['final_1'] ?? allSlots.find(s => s.slotId === 'final_1')?.winner
  const champion = championCode ? TEAMS[championCode] : null

  return (
    <div className="min-h-dvh bg-paper overflow-x-auto">
      <div className="min-w-[1100px] px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Eyebrow num="05">CHAVE · COPA DO MUNDO 2026</Eyebrow>
            <p className="font-serif-it text-green-deep text-lg mt-1">monte seu bracket · pick'em</p>
          </div>
          {!isRoundLocked('r16') && (
            <button onClick={() => lockRound('r16')} className="btn-yellow">
              CONFIRMAR OITAVAS →
            </button>
          )}
        </div>

        {/* Bracket tree */}
        <div className="flex gap-5 items-start">
          {/* R16 */}
          <div className="flex-shrink-0">
            <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-3">OITAVAS DE FINAL</p>
            <div className="flex flex-col gap-2">
              {r16.map(slot => (
                <div key={slot.slotId} onClick={() => setFocusedSlot(focusedSlot === slot.slotId ? null : slot.slotId)}>
                  <SlotCard
                    slot={slot}
                    userPick={picks[slot.slotId]}
                    onPick={handlePick}
                    isLocked={isRoundLocked('r16')}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Connector lines (visual) */}
          <div className="flex-shrink-0 flex flex-col justify-around self-stretch py-6 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 border-r-2 border-t-2 border-b-2 border-hairline" style={{ borderRadius: '0 8px 8px 0', minHeight: 80 }} />
            ))}
          </div>

          {/* QF */}
          <div className="flex-shrink-0">
            <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-3">QUARTAS DE FINAL</p>
            <div className="flex flex-col gap-5 mt-8">
              {qf.map(slot => {
                const resolved = getResolvedSlot(slot)
                return (
                  <SlotCard
                    key={slot.slotId}
                    slot={resolved}
                    userPick={picks[slot.slotId]}
                    onPick={handlePick}
                    isLocked={isRoundLocked('qf')}
                    compact
                  />
                )
              })}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col justify-around self-stretch py-14 gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex-1 border-r-2 border-t-2 border-b-2 border-hairline" style={{ borderRadius: '0 8px 8px 0', minHeight: 120 }} />
            ))}
          </div>

          {/* SF */}
          <div className="flex-shrink-0">
            <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-3">SEMIFINAIS</p>
            <div className="flex flex-col gap-12 mt-24">
              {sf.map(slot => {
                const resolved = getResolvedSlot(slot)
                return (
                  <SlotCard
                    key={slot.slotId}
                    slot={resolved}
                    userPick={picks[slot.slotId]}
                    onPick={handlePick}
                    isLocked={isRoundLocked('sf')}
                    compact
                  />
                )
              })}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col justify-center self-stretch">
            <div className="border-r-2 border-t-2 border-b-2 border-hairline h-48" style={{ borderRadius: '0 8px 8px 0' }} />
          </div>

          {/* Final */}
          <div className="flex-shrink-0">
            <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-3">FINAL · CAMPEÃO</p>
            <div className="mt-36">
              {final.map(slot => {
                const resolved = getResolvedSlot(slot)
                return (
                  <div key={slot.slotId} className="flex flex-col gap-4">
                    <SlotCard
                      slot={resolved}
                      userPick={picks[slot.slotId]}
                      onPick={handlePick}
                      isLocked={isRoundLocked('final')}
                    />
                    {champion && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-ink text-paper p-4 border-2 border-ink shadow-card-yellow flex items-center gap-3"
                      >
                        <Flag team={champion} size={36} ring />
                        <div>
                          <div className="font-mono text-[9px] text-paper/50 tracking-eyebrow">A TAÇA VAI PRA…</div>
                          <div className="font-display text-2xl text-yellow">{champion.name.toUpperCase()}</div>
                        </div>
                        <span className="font-display text-4xl ml-auto">🏆</span>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Points legend */}
        <div className="mt-8 pt-6 border-t border-hairline grid grid-cols-4 gap-4">
          {[
            { pts: '+3', label: 'Acerto de vencedor', icon: '✓' },
            { pts: '+5', label: 'Placar exato', icon: '★' },
            { pts: '+10', label: 'Progressão no bracket', icon: '→' },
            { pts: '+50', label: 'Campeão correto', icon: '🏆' },
          ].map(rule => (
            <div key={rule.label} className="flex items-center gap-3 border border-hairline p-3">
              <div className="font-display text-3xl text-green">{rule.pts}</div>
              <div>
                <div className="font-mono text-[10px] font-bold">{rule.icon} {rule.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mobile — Round selector + vertical list ──────────────────────────────────

function BracketMobile() {
  const [activeRound, setActiveRound] = useState<BracketRound>('r16')
  const { picks, setPick, lockRound, isRoundLocked, resolveSlotTeams } = useBracketStore()

  const allSlots = MOCK_BRACKET_SLOTS
  const currentSlots = allSlots.filter(s => s.round === activeRound)
  const championCode = picks['final_1'] ?? allSlots.find(s => s.slotId === 'final_1')?.winner
  const champion = championCode ? TEAMS[championCode] : null

  const getResolvedSlot = (slot: BracketSlot): BracketSlot => {
    if (!slot.slotId.startsWith('r16_')) {
      const { home, away } = resolveSlotTeams(slot.slotId, allSlots)
      return {
        ...slot,
        homeTeam: home ? (TEAMS[home] ?? null) : slot.homeTeam,
        awayTeam: away ? (TEAMS[away] ?? null) : slot.awayTeam,
      }
    }
    return slot
  }

  return (
    <div className="min-h-dvh bg-paper">
      {/* Round tabs */}
      <div className="sticky top-0 z-10 bg-paper border-b border-line grid grid-cols-4">
        {ROUNDS.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveRound(r.id)}
            className={cn(
              'py-3 font-mono text-[10px] font-bold tracking-eyebrow border-r last:border-r-0 border-hairline transition-colors',
              activeRound === r.id ? 'bg-ink text-paper' : 'text-ink-3 hover:bg-hairline'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRound}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {currentSlots.map(slot => {
              const resolved = getResolvedSlot(slot)
              return (
                <SlotCard
                  key={slot.slotId}
                  slot={resolved}
                  userPick={picks[slot.slotId]}
                  onPick={setPick}
                  isLocked={isRoundLocked(activeRound)}
                />
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Champion banner */}
        {activeRound === 'final' && champion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ink text-paper p-5 flex items-center gap-4 border-2 border-ink shadow-card-yellow"
          >
            <Flag team={champion} size={52} ring />
            <div>
              <div className="font-mono text-[10px] text-paper/50 tracking-eyebrow">A TAÇA VAI PRA…</div>
              <div className="font-display text-3xl text-yellow">{champion.name.toUpperCase()}</div>
              <div className="font-mono text-[10px] text-paper/50 mt-1">+50 PTS se acertar</div>
            </div>
          </motion.div>
        )}

        {/* Lock round button */}
        {!isRoundLocked(activeRound) && (
          <button onClick={() => lockRound(activeRound)} className="btn-yellow w-full justify-center mt-4">
            CONFIRMAR {ROUNDS.find(r => r.id === activeRound)?.label} →
          </button>
        )}
        {isRoundLocked(activeRound) && (
          <div className="flex items-center justify-center gap-2 py-3 border border-green text-green">
            <span className="font-mono text-[11px] font-bold tracking-eyebrow">✓ {ROUNDS.find(r => r.id === activeRound)?.label} CONFIRMADAS</span>
          </div>
        )}
      </div>
    </div>
  )
}
