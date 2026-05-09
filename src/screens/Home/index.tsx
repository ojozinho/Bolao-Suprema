import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flag } from '@/components/shared/Flag'
import { Avatar } from '@/components/shared/Avatar'
import { Marquee } from '@/components/shared/Marquee'
import { useAuthStore } from '@/stores/auth.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { MOCK_LIVE, MOCK_UPCOMING, MOCK_PAST, MOCK_RANKING } from '@/data/mock'
import { fmtPts } from '@/lib/utils'
import { asset } from '@/lib/utils'

const MARQUEE_ITEMS = MOCK_PAST.map(m => `${m.home.code} ${m.homeScore}–${m.awayScore} ${m.away.code}`)

export function HomeScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <HomeDesktop /> : <HomeMobile />
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function HomeMobile() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const me = MOCK_RANKING.find(r => r.isYou)

  return (
    <div className="min-h-dvh bg-paper">
      {/* Live match hero */}
      <section className="relative h-72 overflow-hidden">
        <img src={asset('assets/hero-jogadores.webp')} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/20 to-ink/70 pitch-turf" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 px-4">
          {/* Live badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="live-dot" />
            <span className="font-mono text-[10px] font-bold tracking-eyebrow text-paper">
              AO VIVO · {MOCK_LIVE.liveMinute}
            </span>
          </div>

          {/* Teams & Score */}
          <div className="flex items-center gap-4 w-full justify-center">
            <div className="flex flex-col items-center gap-1.5">
              <Flag team={MOCK_LIVE.home} size={40} ring />
              <span className="font-mono text-[10px] text-paper/80">{MOCK_LIVE.home.code}</span>
            </div>
            <div className="font-display text-[88px] leading-none text-paper tracking-tight">
              {MOCK_LIVE.homeScore}–{MOCK_LIVE.awayScore}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Flag team={MOCK_LIVE.away} size={40} ring />
              <span className="font-mono text-[10px] text-paper/80">{MOCK_LIVE.away.code}</span>
            </div>
          </div>

          {/* Your pick pill */}
          <div className="mt-2 px-3 py-1.5 bg-paper/10 backdrop-blur-sm border border-paper/20 flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-paper/60">SEU PALPITE</span>
            <span className="font-mono text-[12px] font-bold text-yellow">1–1</span>
          </div>
        </div>
      </section>

      <div className="px-4 space-y-3 pt-3">
        {/* You card */}
        {me && (
          <div className="bg-ink text-paper p-4 flex items-center gap-3">
            <Avatar initials={me.initials} color={me.color} size={44} />
            <div className="flex-1">
              <div className="font-mono text-[10px] text-paper/50 tracking-eyebrow">VOCÊ · {me.rank}º · +3 ESSA SEMANA</div>
              <div className="font-display text-3xl">{fmtPts(me.pts)} PTS</div>
            </div>
            <button onClick={() => navigate('/ranking')} className="font-mono text-[10px] font-bold text-yellow tracking-eyebrow">
              RANKING →
            </button>
          </div>
        )}

        {/* CTA palpite */}
        <div className="bg-yellow border-2 border-ink p-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-eyebrow text-ink-3">PRÓXIMOS JOGOS</div>
            <div className="font-display text-2xl">
              {MOCK_UPCOMING.length} JOGOS ESPERANDO
            </div>
          </div>
          <button onClick={() => navigate('/prediction')} className="btn-ink text-xs px-3 py-2">
            PALPITAR →
          </button>
        </div>

        {/* Upcoming matches */}
        <div>
          <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-2">PRÓXIMOS · OITAVAS</p>
          <div className="grid grid-cols-2 gap-2">
            {MOCK_UPCOMING.slice(0, 4).map(match => (
              <button key={match.id} onClick={() => navigate(`/prediction/${match.id}`)}
                className="border-2 border-ink p-3 flex items-center gap-2 hover:-translate-y-px transition-transform text-left">
                <Flag team={match.home} size={22} />
                <span className="font-mono text-[10px] font-bold">{match.home.code}</span>
                <span className="font-mono text-[10px] text-ink-4 mx-0.5">×</span>
                <span className="font-mono text-[10px] font-bold">{match.away.code}</span>
                <Flag team={match.away} size={22} />
              </button>
            ))}
          </div>
        </div>

        {/* Past results */}
        <div>
          <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-2">ÚLTIMOS RESULTADOS</p>
          <div className="space-y-1">
            {MOCK_PAST.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-hairline">
                <Flag team={m.home} size={18} />
                <span className="font-mono text-[11px] font-bold text-ink">{m.home.code}</span>
                <span className="font-display text-xl flex-1 text-center">{m.homeScore}–{m.awayScore}</span>
                <span className="font-mono text-[11px] font-bold text-ink">{m.away.code}</span>
                <Flag team={m.away} size={18} />
                {m.pts !== undefined && (
                  <span className={`font-mono text-[10px] font-bold ml-2 ${m.pts > 0 ? 'text-green' : 'text-ink-4'}`}>
                    {m.pts > 0 ? `+${m.pts}` : '—'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="mt-6 border-t border-line bg-ink">
        <Marquee items={MARQUEE_ITEMS} color="#FFCB05" bg="#0D0D0D" speed={35} />
      </div>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function HomeDesktop() {
  const navigate = useNavigate()
  const me = MOCK_RANKING.find(r => r.isYou)

  return (
    <div className="min-h-dvh bg-paper">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Hero row — 3 columns */}
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-5 mb-5">
          {/* Live match */}
          <div className="relative overflow-hidden min-h-[320px] border-2 border-ink">
            <img src={asset('assets/hero-jogadores.webp')} alt="" className="absolute inset-0 w-full h-full object-cover pitch-turf" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="live-dot" />
                <span className="font-mono text-[10px] font-bold tracking-eyebrow text-paper">AO VIVO · {MOCK_LIVE.liveMinute}</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center gap-2">
                  <Flag team={MOCK_LIVE.home} size={52} ring />
                  <span className="font-mono text-[11px] font-bold text-paper/80">{MOCK_LIVE.home.name.toUpperCase()}</span>
                </div>
                <div className="flex-1 text-center">
                  <div className="font-display text-[96px] leading-none text-paper">
                    {MOCK_LIVE.homeScore}–{MOCK_LIVE.awayScore}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Flag team={MOCK_LIVE.away} size={52} ring />
                  <span className="font-mono text-[11px] font-bold text-paper/80">{MOCK_LIVE.away.name.toUpperCase()}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-paper/10 border border-paper/20">
                  <span className="font-mono text-[10px] text-paper/60">SEU PALPITE</span>
                  <span className="font-mono text-sm font-bold text-yellow">1–1</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-paper/10 border border-paper/20">
                  <span className="font-mono text-[10px] text-paper/60">MAIS VOTADO</span>
                  <span className="font-mono text-sm font-bold text-paper">2–0</span>
                </div>
              </div>
            </div>
          </div>

          {/* You card */}
          {me && (
            <div className="bg-ink text-paper border-2 border-ink p-6 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-eyebrow text-paper/40 mb-4">SUA POSIÇÃO</div>
                <div className="font-display text-[80px] leading-none text-paper">{String(me.rank).padStart(2, '0')}º</div>
                <div className="font-mono text-[11px] text-paper/50 mt-1">{me.dept}</div>
              </div>
              <div>
                <div className="font-display text-4xl text-yellow">{fmtPts(me.pts)} PTS</div>
                <div className="grid grid-cols-3 gap-2 mt-4 border-t border-paper/10 pt-4">
                  <div>
                    <div className="font-display text-2xl">{me.correct}</div>
                    <div className="font-mono text-[9px] text-paper/40">ACERTOS</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl">{me.exact}</div>
                    <div className="font-mono text-[9px] text-paper/40">EXATOS</div>
                  </div>
                  <div>
                    <div className="font-display text-2xl">{me.streak}🔥</div>
                    <div className="font-mono text-[9px] text-paper/40">STREAK</div>
                  </div>
                </div>
                <button onClick={() => navigate('/ranking')} className="btn-yellow w-full justify-center mt-4">
                  VER RANKING →
                </button>
              </div>
            </div>
          )}

          {/* CTA Prediction */}
          <div className="relative overflow-hidden border-2 border-ink flex flex-col justify-between p-6 bg-green">
            <div>
              <div className="font-mono text-[10px] tracking-eyebrow text-paper/70 mb-3">SEM PALPITE</div>
              <div className="font-display text-5xl text-paper leading-none">
                {MOCK_UPCOMING.length} JOGOS<br/>AGUARDANDO
              </div>
            </div>
            <div>
              <p className="font-mono text-[12px] text-paper/70 mb-4">
                Você ainda não palpitou nos próximos jogos. Não fique de fora!
              </p>
              <button onClick={() => navigate('/prediction')} className="btn-yellow w-full justify-center">
                PALPITAR AGORA →
              </button>
            </div>
          </div>
        </div>

        {/* Secondary row */}
        <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-5">
          {/* Upcoming matches */}
          <div className="border-2 border-ink">
            <div className="px-4 py-3 border-b border-hairline">
              <span className="font-mono text-[10px] tracking-eyebrow text-ink-3">PRÓXIMOS JOGOS · OITAVAS</span>
            </div>
            <div className="divide-y divide-hairline">
              {MOCK_UPCOMING.map(match => (
                <button key={match.id} onClick={() => navigate(`/prediction/${match.id}`)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-hairline transition-colors text-left group">
                  <div className="flex items-center gap-2 flex-1">
                    <Flag team={match.home} size={28} />
                    <div>
                      <div className="font-mono text-[12px] font-bold">{match.home.name}</div>
                      <div className="font-mono text-[10px] text-ink-3">{match.stageLabel}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-[10px] font-bold text-ink-3">{match.date}</div>
                    <div className="font-display text-xl">{match.time}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="text-right">
                      <div className="font-mono text-[12px] font-bold">{match.away.name}</div>
                      <div className="font-mono text-[10px] text-ink-3">{match.venue.split('·')[0].trim()}</div>
                    </div>
                    <Flag team={match.away} size={28} />
                  </div>
                  <span className="font-mono text-[10px] text-ink-4 group-hover:text-ink transition-colors">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top ranking */}
          <div className="border-2 border-ink">
            <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-eyebrow text-ink-3">RANKING · TOP 5</span>
              <button onClick={() => navigate('/ranking')} className="font-mono text-[10px] text-ink-4 hover:text-ink">VER TUDO →</button>
            </div>
            <div className="divide-y divide-hairline">
              {MOCK_RANKING.slice(0, 5).map(r => (
                <div key={r.userId} className={`flex items-center gap-3 px-4 py-2.5 ${r.isYou ? 'bg-yellow' : ''}`}>
                  <span className="font-display text-2xl w-7">{r.rank}º</span>
                  <Avatar initials={r.initials} color={r.color} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[12px] font-bold truncate">{r.name}</div>
                    <div className="font-mono text-[10px] text-ink-3">{r.dept}</div>
                  </div>
                  <span className="font-display text-xl">{fmtPts(r.pts)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resenha peek */}
          <div className="border-2 border-ink flex flex-col">
            <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-eyebrow text-ink-3">#RESENHA</span>
              <button onClick={() => navigate('/resenha')} className="font-mono text-[10px] text-ink-4 hover:text-ink">ENTRAR →</button>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-hidden">
              {[{ name: 'Lucas M.', text: 'Alguém viu o pênalti?? 😭', color: '#00A651', init: 'LM' },
                { name: 'Felipe S.', text: 'Eu acertei o 1-1 já pensando nisso', color: '#6FB4FF', init: 'FS', isYou: true }
              ].map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.isYou ? 'flex-row-reverse' : ''}`}>
                  <Avatar initials={m.init} color={m.color} size={24} />
                  <div className={`rounded-lg px-3 py-2 text-[12px] max-w-[80%] ${m.isYou ? 'bg-yellow text-ink' : 'bg-paper-deep text-ink'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="border-t border-line bg-ink mt-8">
        <Marquee items={MARQUEE_ITEMS} color="#FFCB05" bg="#0D0D0D" speed={35} />
      </div>
    </div>
  )
}
