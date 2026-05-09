import { useState } from 'react'
import { Eyebrow } from '@/components/shared/Eyebrow'
import { Avatar } from '@/components/shared/Avatar'
import { Flag } from '@/components/shared/Flag'
import { useAuthStore } from '@/stores/auth.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { MOCK_UPCOMING, MOCK_PAST, MOCK_RANKING } from '@/data/mock'
import { cn } from '@/lib/utils'

type MatchStatus = 'ABERTO' | 'AO VIVO' | 'ENCERRADO'

interface AdminMatch {
  id: string
  label: string
  date: string
  predictions: number
  result: string | null
  status: MatchStatus
}

const ADMIN_MATCHES: AdminMatch[] = [
  { id: 'm0', label: 'POR × URU', date: 'QUI 03 JUL · 16:00', predictions: 87, result: '1–1', status: 'AO VIVO' },
  { id: 'm1', label: 'GER × MEX', date: 'SAB 04 JUL · 18:00', predictions: 62, result: null, status: 'ABERTO' },
  { id: 'm2', label: 'NED × CAN', date: 'SAB 04 JUL · 20:00', predictions: 45, result: null, status: 'ABERTO' },
  { id: 'm3', label: 'FRA × ARG', date: 'TER 01 JUL · 20:00', predictions: 87, result: '3–3', status: 'ENCERRADO' },
  { id: 'm4', label: 'BRA × ESP', date: 'SEG 30 JUN · 16:00', predictions: 87, result: '2–1', status: 'ENCERRADO' },
]

const STATUS_STYLES: Record<MatchStatus, string> = {
  'ENCERRADO': 'bg-green/10 text-green',
  'AO VIVO': 'bg-red/10 text-red',
  'ABERTO': 'bg-yellow/50 text-ink',
}

export function AdminScreen() {
  const user = useAuthStore(s => s.user)
  const isDesktop = useIsDesktop()

  if (!user?.isAdmin) {
    return (
      <div className="flex h-dvh items-center justify-center bg-paper flex-col gap-4">
        <span className="font-display text-4xl">🚫</span>
        <p className="font-mono text-[12px] tracking-eyebrow text-ink-3">ACESSO RESTRITO · SOMENTE ADMIN</p>
      </div>
    )
  }

  return isDesktop ? <AdminDesktop /> : <AdminMobile />
}

const KPIS = [
  { val: '87', label: 'jogadores ativos', sub: '+4 essa semana' },
  { val: '412', label: 'palpites enviados', sub: '94% taxa' },
  { val: '8/8', label: 'jogos das oitavas', sub: '5 fechados' },
  { val: '1.284', label: 'pontos · líder', sub: 'LUCAS MENDES' },
  { val: '7', label: 'zerados', sub: 'palpites mico' },
]

// ─── Mobile ───────────────────────────────────────────────────────────────────

function AdminMobile() {
  return (
    <div className="min-h-dvh bg-paper pb-24">
      <div className="px-4 pt-5 pb-3 border-b border-line">
        <div className="flex items-center justify-between">
          <span className="font-display text-3xl">ADMIN</span>
          <span className="font-mono text-[10px] text-red tracking-eyebrow">só pra galera do RH</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 p-4">
        {KPIS.slice(0, 4).map(k => (
          <div key={k.label} className="border-2 border-ink p-3">
            <div className="font-display text-4xl">{k.val}</div>
            <div className="font-mono text-[10px] text-ink-3 mt-0.5">{k.label}</div>
            <div className="font-mono text-[9px] text-ink-4">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {ADMIN_MATCHES.slice(0, 3).map(m => (
          <div key={m.id} className="border-2 border-ink p-3 flex items-center justify-between">
            <div>
              <div className="font-mono text-[12px] font-bold">{m.label}</div>
              <div className="font-mono text-[10px] text-ink-3">{m.date} · {m.predictions} palpites</div>
            </div>
            <span className={cn('font-mono text-[10px] font-bold px-2 py-1', STATUS_STYLES[m.status])}>
              {m.status}
            </span>
          </div>
        ))}

        <button className="btn-yellow w-full justify-center">ABRIR PRÓXIMA RODADA →</button>
        <button className="btn-ink w-full justify-center">CUTUCAR 23 ATRASADOS</button>
      </div>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function AdminDesktop() {
  const [broadcast, setBroadcast] = useState('')
  const [editingResult, setEditingResult] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})

  return (
    <div className="min-h-dvh bg-paper">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Eyebrow>ADMIN · só pra galera do RH</Eyebrow>
            <h1 className="font-display text-4xl mt-1">PAINEL DE CONTROLE</h1>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost">EXPORTAR CSV</button>
            <button className="btn-yellow">ABRIR PRÓXIMA RODADA →</button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {KPIS.map(k => (
            <div key={k.label} className="border-2 border-ink p-4">
              <div className="font-display text-4xl">{k.val}</div>
              <div className="font-mono text-[11px] font-bold mt-1">{k.label}</div>
              <div className="font-mono text-[10px] text-ink-3">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-5">
          {/* Left — matches + rules */}
          <div className="space-y-5">
            {/* Match control table */}
            <div className="border-2 border-ink">
              <div className="px-5 py-3 border-b border-hairline flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-eyebrow text-ink-3">CONTROLE DE PARTIDAS</span>
              </div>
              <div className="grid grid-cols-[1fr_120px_80px_80px_80px] gap-2 px-5 py-2 border-b border-hairline font-mono text-[9px] tracking-eyebrow text-ink-4">
                <span>JOGO</span><span>DATA</span><span>PALPITES</span><span>RESULTADO</span><span>STATUS</span>
              </div>
              {ADMIN_MATCHES.map(m => (
                <div key={m.id} className="grid grid-cols-[1fr_120px_80px_80px_80px] gap-2 items-center px-5 py-3 border-b border-hairline">
                  <div className="font-mono text-[12px] font-bold">{m.label}</div>
                  <div className="font-mono text-[11px] text-ink-3">{m.date.split('·')[0].trim()}</div>
                  <div className="font-mono text-[12px] text-center">{m.predictions}</div>
                  <div>
                    {editingResult === m.id ? (
                      <input
                        defaultValue={results[m.id] ?? m.result ?? ''}
                        onBlur={e => { setResults(r => ({ ...r, [m.id]: e.target.value })); setEditingResult(null) }}
                        autoFocus
                        className="w-16 border border-ink px-1 py-0.5 font-mono text-[11px] text-center bg-yellow outline-none"
                      />
                    ) : (
                      <button onClick={() => setEditingResult(m.id)}
                        className="font-mono text-[12px] font-bold text-center w-full hover:bg-yellow px-1 py-0.5 transition-colors">
                        {results[m.id] ?? m.result ?? '—'}
                      </button>
                    )}
                  </div>
                  <span className={cn('font-mono text-[10px] font-bold px-2 py-1 text-center', STATUS_STYLES[m.status])}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Scoring rules */}
            <div className="border-2 border-ink p-5">
              <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-3">PONTUAÇÃO</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { pts: '3', label: 'Acerto vencedor' },
                  { pts: '5', label: 'Placar exato' },
                  { pts: '10', label: 'Bracket' },
                  { pts: '50', label: 'Campeão' },
                ].map(r => (
                  <div key={r.label} className="border border-hairline p-3 text-center">
                    <div className="font-display text-4xl text-green">+{r.pts}</div>
                    <div className="font-mono text-[10px] text-ink-3 mt-1">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Without prediction */}
            <div className="border-2 border-ink">
              <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-eyebrow text-ink-3">SEM PALPITE</span>
                <button className="btn-ghost px-3 py-1.5 text-[10px]">CUTUCAR TODOS</button>
              </div>
              <div className="divide-y divide-hairline">
                {MOCK_RANKING.slice(-4).map(r => (
                  <div key={r.userId} className="flex items-center gap-3 px-4 py-2.5">
                    <Avatar initials={r.initials} color={r.color} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[12px] font-bold truncate">{r.name}</div>
                      <div className="font-mono text-[10px] text-ink-3">{r.dept}</div>
                    </div>
                    <button className="font-mono text-[10px] text-red font-bold hover:underline">CUTUCAR</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Broadcast */}
            <div className="border-2 border-ink p-4">
              <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-3">AVISO PARA TODOS</p>
              <textarea
                value={broadcast}
                onChange={e => setBroadcast(e.target.value)}
                placeholder="Lembra galera: prazo de palpites fecha às 15h30..."
                rows={4}
                className="w-full border-2 border-hairline p-3 font-sans text-[13px] bg-transparent outline-none resize-none focus:border-ink"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => setBroadcast('')} className="btn-ghost flex-1 text-[10px]">CANCELAR</button>
                <button disabled={!broadcast.trim()} className="btn-yellow flex-1 text-[10px] disabled:opacity-40">
                  ENVIAR →
                </button>
              </div>
            </div>

            {/* Activity bars */}
            <div className="border-2 border-ink p-4">
              <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-3">ATIVIDADE (12H)</p>
              <div className="flex items-end gap-1 h-24">
                {[12, 28, 45, 67, 87, 54, 32, 18, 42, 76, 55, 33].map((h, i) => (
                  <div key={i} className="flex-1 transition-all" style={{ height: `${h}%`, background: i === 5 ? '#FFCB05' : '#0D0D0D' }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[9px] text-ink-4">00h</span>
                <span className="font-mono text-[9px] text-ink-4">12h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
