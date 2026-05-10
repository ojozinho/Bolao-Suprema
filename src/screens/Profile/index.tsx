import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/shared/Logo'
import { Avatar } from '@/components/shared/Avatar'
import { Flag } from '@/components/shared/Flag'
import { Stamp } from '@/components/shared/Stamp'
import { useAuthStore } from '@/stores/auth.store'
import { usePredictionStore } from '@/stores/prediction.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { WC2026_GROUPS } from '@/data/wc2026'
import { TEAMS } from '@/data/teams'
import { getInitials } from '@/lib/utils'
import { searchPlayers } from '@/lib/thesportsdb'
import type { PlayerResult } from '@/lib/thesportsdb'
import type { TeamCode } from '@/types'

const AVATAR_COLORS = [
  '#00A651', '#007A3E', '#E63946', '#1D3557',
  '#FFCB05', '#6FB4FF', '#C9A856', '#FF6600',
]

// ─── Player Picker ────────────────────────────────────────────────────────────

function PlayerPicker({
  value, imgUrl, onChange,
}: {
  value: string
  imgUrl?: string
  onChange: (name: string, img: string | undefined) => void
}) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<PlayerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Keep query in sync when parent resets
  useEffect(() => { setQuery(value) }, [value])

  const search = useCallback((q: string) => {
    clearTimeout(timer.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      const res = await searchPlayers(q)
      setResults(res)
      setLoading(false)
      setOpen(res.length > 0)
    }, 500)
  }, [])

  const select = (p: PlayerResult) => {
    setQuery(p.strPlayer)
    setOpen(false)
    setResults([])
    onChange(p.strPlayer, p.strCutout ?? p.strThumb ?? undefined)
  }

  const clearSelection = () => {
    setQuery('')
    setOpen(false)
    onChange('', undefined)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {imgUrl && (
          <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded-sm bg-paper-deep border border-hairline">
            <img src={imgUrl} alt="" className="w-full h-full object-contain object-bottom" />
          </div>
        )}
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); search(e.target.value) }}
            onFocus={() => { if (results.length) setOpen(true) }}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="ex: Vini Jr, Mbappé, Haaland…"
            className="w-full border-2 border-ink px-3 py-2.5 font-sans text-sm bg-transparent outline-none pr-8"
          />
          {loading && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-ink-3 animate-pulse">
              …
            </span>
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink-4 hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-paper border-2 border-ink shadow-card overflow-hidden max-h-72 overflow-y-auto"
          >
            {results.map(p => (
              <button
                key={p.idPlayer}
                type="button"
                onMouseDown={() => select(p)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-paper-deep transition-colors text-left border-b border-hairline last:border-b-0"
              >
                {(p.strThumb || p.strCutout) ? (
                  <img
                    src={p.strThumb ?? p.strCutout ?? ''}
                    alt=""
                    className="w-9 h-9 object-cover object-top rounded-sm flex-shrink-0 bg-paper-deep"
                  />
                ) : (
                  <div className="w-9 h-9 bg-paper-deep flex-shrink-0 rounded-sm flex items-center justify-center">
                    <span className="font-mono text-[9px] text-ink-4">?</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-mono text-[12px] font-bold truncate">{p.strPlayer}</div>
                  <div className="font-mono text-[10px] text-ink-3 truncate">{p.strTeam} · {p.strNationality}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Shared photo picker ──────────────────────────────────────────────────────

function PhotoUploadBtn({
  label, preview, placeholder, fileRef, onPick, aspect,
}: {
  label: string
  preview?: string | null
  placeholder?: React.ReactNode
  fileRef: React.RefObject<HTMLInputElement>
  onPick: (f: File) => void
  aspect?: string
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">{label}</p>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`relative w-full overflow-hidden border-2 border-dashed border-ink-3 hover:border-ink transition-colors bg-paper-deep flex items-center justify-center ${aspect ?? 'h-24'}`}
      >
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-ink-4">
            {placeholder}
            <span className="font-mono text-[9px] tracking-eyebrow">CLIQUE PARA TROCAR</span>
          </div>
        )}
        <div className="absolute inset-0 bg-ink/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="font-mono text-[10px] text-white tracking-eyebrow bg-ink/60 px-2 py-1">TROCAR FOTO</span>
        </div>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => e.target.files?.[0] && onPick(e.target.files[0])}
      />
    </div>
  )
}

// ─── Teams picker ────────────────────────────────────────────────────────────

function AllTeamsPicker({ value, onChange }: { value?: string; onChange: (code: string) => void }) {
  return (
    <div className="border-2 border-hairline overflow-hidden">
      <div className="max-h-64 overflow-y-auto p-3 space-y-3">
        {WC2026_GROUPS.map(group => (
          <div key={group.id}>
            <p className="font-mono text-[8px] tracking-eyebrow text-ink-4 mb-1.5 sticky top-0 bg-paper py-0.5">
              GRUPO {group.id}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {group.teams.map(code => {
                const team = TEAMS[code]
                if (!team) return null
                const selected = value === code
                return (
                  <button
                    key={code}
                    onClick={() => onChange(code)}
                    className={[
                      'flex flex-col items-center gap-1 py-2 px-1 border-2 transition-colors',
                      selected ? 'border-ink bg-yellow' : 'border-transparent hover:border-hairline',
                    ].join(' ')}
                  >
                    <Flag team={team} size={22} />
                    <span className="font-mono text-[7px] font-bold">{code}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Apostas gerais summary ──────────────────────────────────────────────────

function ApostasGeraisSummary({
  championPick, vicePick, scorerPick, onEdit,
}: {
  championPick: string | null; vicePick: string | null; scorerPick: string | null; onEdit: () => void
}) {
  const allSet = championPick && vicePick && scorerPick
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] tracking-eyebrow text-ink-3">APOSTAS GERAIS</p>
        <button onClick={onEdit} className="font-mono text-[10px] text-ink-4 hover:text-ink tracking-eyebrow">
          {allSet ? 'ALTERAR →' : 'FAZER →'}
        </button>
      </div>
      {allSet ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="border-2 border-green/60 bg-green/5 p-2 flex flex-col items-center gap-1 text-center">
            <Flag team={TEAMS[championPick!]} size={22} />
            <span className="font-mono text-[7px] text-ink-3 tracking-eyebrow">CAMPEÃO</span>
            <span className="font-mono text-[8px] font-bold">{TEAMS[championPick!]?.code}</span>
          </div>
          <div className="border-2 border-hairline p-2 flex flex-col items-center gap-1 text-center">
            <Flag team={TEAMS[vicePick!]} size={22} />
            <span className="font-mono text-[7px] text-ink-3 tracking-eyebrow">VICE</span>
            <span className="font-mono text-[8px] font-bold">{TEAMS[vicePick!]?.code}</span>
          </div>
          <div className="border-2 border-hairline p-2 flex flex-col items-center justify-center text-center gap-0.5">
            <span className="font-mono text-[9px] font-bold leading-tight break-words">{scorerPick}</span>
            <span className="font-mono text-[7px] text-ink-3 tracking-eyebrow">ARTILHEIRO</span>
          </div>
        </div>
      ) : (
        <div className="border-2 border-hairline p-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-ink-3 leading-relaxed">
            Obrigatório antes de 11 Jun. Vale +50 pts no total.
          </p>
          <button onClick={onEdit} className="btn-yellow text-[10px] px-3 py-2 flex-shrink-0">
            FAZER →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Form hook ───────────────────────────────────────────────────────────────

function useProfileForm() {
  const { user, updateProfile, signOut } = useAuthStore()
  const { championPick, vicePick, scorerPick, clearAllPredictions } = usePredictionStore()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [dept, setDept] = useState(user?.dept ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [avatarColor, setAvatarColor] = useState(user?.color ?? '#00A651')
  const [favoriteTeam, setFavoriteTeam] = useState<TeamCode | undefined>(user?.favoriteTeam)
  const [favoritePlayer, setFavoritePlayer] = useState(user?.favoritePlayer ?? '')
  const [favoritePlayerImg, setFavoritePlayerImg] = useState<string | undefined>(user?.favoritePlayerImg)
  const [saving, setSaving] = useState(false)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.avatarUrl ?? null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(user?.bannerUrl ?? null)

  const photoRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  const initials = getInitials(`${firstName} ${lastName}`) || user?.initials || 'FS'

  const handlePickPhoto = (file: File) => {
    setPhotoFile(file)
    const r = new FileReader(); r.onload = e => setPhotoPreview(e.target?.result as string); r.readAsDataURL(file)
  }
  const handlePickBanner = (file: File) => {
    setBannerFile(file)
    const r = new FileReader(); r.onload = e => setBannerPreview(e.target?.result as string); r.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    await updateProfile(
      { firstName, lastName, dept, bio, color: avatarColor, initials, favoriteTeam, favoritePlayer, favoritePlayerImg },
      photoFile ?? undefined,
      bannerFile ?? undefined,
    )
    setSaving(false)
    navigate('/home')
  }

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  const handleClearPredictions = () => {
    if (window.confirm('Apagar todos os palpites? Esta ação não pode ser desfeita.')) clearAllPredictions()
  }

  return {
    user, firstName, setFirstName, lastName, setLastName,
    dept, setDept, bio, setBio,
    avatarColor, setAvatarColor,
    favoriteTeam, setFavoriteTeam,
    favoritePlayer, setFavoritePlayer, favoritePlayerImg, setFavoritePlayerImg,
    photoPreview, bannerPreview,
    photoRef, bannerRef,
    handlePickPhoto, handlePickBanner,
    initials, saving,
    handleSave, handleSignOut, handleClearPredictions,
    championPick, vicePick, scorerPick,
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <ProfileDesktop /> : <ProfileMobile />
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function ProfileMobile() {
  const f = useProfileForm()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-paper pb-28">

      {/* Banner */}
      <div className="relative h-32 bg-ink overflow-hidden">
        {f.bannerPreview && (
          <img src={f.bannerPreview} alt="" className="w-full h-full object-cover opacity-80" />
        )}
        <button
          onClick={() => f.bannerRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-ink/40 hover:bg-ink/60 transition-colors"
        >
          <span className="font-mono text-[9px] tracking-eyebrow text-paper/70">
            {f.bannerPreview ? 'TROCAR BANNER' : '+ ADICIONAR BANNER'}
          </span>
        </button>
        <input ref={f.bannerRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && f.handlePickBanner(e.target.files[0])} />

        {/* Avatar over banner */}
        <div className="absolute -bottom-8 left-5">
          <button
            onClick={() => f.photoRef.current?.click()}
            className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-paper"
          >
            {f.photoPreview ? (
              <img src={f.photoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <Avatar initials={f.initials} color={f.avatarColor} size={64} />
            )}
          </button>
          <input ref={f.photoRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && f.handlePickPhoto(e.target.files[0])} />
        </div>
      </div>

      <div className="px-5 pt-12 pb-4 border-b border-hairline">
        <div className="font-display text-2xl leading-none">{f.firstName || 'NOME'} {f.lastName}</div>
        <div className="font-mono text-[11px] text-ink-3 mt-1">{f.dept || '—'}</div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">NOME</label>
          <div className="grid grid-cols-2 gap-2">
            <input value={f.firstName} onChange={e => f.setFirstName(e.target.value)} placeholder="Felipe"
              className="border-2 border-ink px-3 py-2.5 font-sans text-sm bg-transparent outline-none" />
            <input value={f.lastName} onChange={e => f.setLastName(e.target.value)} placeholder="Souza"
              className="border-2 border-ink px-3 py-2.5 font-sans text-sm bg-transparent outline-none" />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">ÁREA NA FIRMA</label>
          <input value={f.dept} onChange={e => f.setDept(e.target.value)} placeholder="ex: Design, Engenharia…"
            className="w-full border-2 border-ink px-3 py-2.5 font-sans text-sm bg-transparent outline-none" />
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">BIO</label>
          <textarea value={f.bio} onChange={e => f.setBio(e.target.value)}
            placeholder="Conte um pouco sobre você…"
            rows={2}
            className="w-full border-2 border-ink px-3 py-2.5 font-sans text-sm bg-transparent outline-none resize-none" />
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">JOGADOR FAVORITO</label>
          <PlayerPicker
            value={f.favoritePlayer}
            imgUrl={f.favoritePlayerImg}
            onChange={(name, img) => { f.setFavoritePlayer(name); f.setFavoritePlayerImg(img) }}
          />
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">COR DO AVATAR</label>
          <div className="flex gap-2">
            {AVATAR_COLORS.map(c => (
              <button key={c} onClick={() => f.setAvatarColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: f.avatarColor === c ? '#0D0D0D' : 'transparent' }} />
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">
            TORCE POR{f.favoriteTeam && TEAMS[f.favoriteTeam] && (
              <span className="ml-2 text-green">· {TEAMS[f.favoriteTeam].name}</span>
            )}
          </label>
          <AllTeamsPicker value={f.favoriteTeam} onChange={f.setFavoriteTeam} />
        </div>

        <ApostasGeraisSummary
          championPick={f.championPick} vicePick={f.vicePick} scorerPick={f.scorerPick}
          onEdit={() => navigate('/prediction', { state: { tab: 'champion' } })}
        />

        <button onClick={f.handleSave} disabled={f.saving} className="btn-yellow w-full justify-center">
          {f.saving ? 'SALVANDO…' : 'SALVAR PERFIL →'}
        </button>
        <button onClick={f.handleClearPredictions}
          className="w-full py-3 font-mono text-[11px] tracking-eyebrow text-ink-4 hover:text-red transition-colors border-2 border-hairline hover:border-red">
          LIMPAR TODOS OS PALPITES
        </button>
        <button onClick={f.handleSignOut}
          className="w-full py-3 font-mono text-[11px] tracking-eyebrow text-ink-4 hover:text-red transition-colors border-2 border-hairline hover:border-red">
          SAIR DA CONTA
        </button>
      </div>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function ProfileDesktop() {
  const f = useProfileForm()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-paper">
      <div className="max-w-screen-lg mx-auto px-8 py-10">

        <div className="flex items-center justify-between mb-8">
          <Logo height={56} />
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-eyebrow text-ink-3">MEU PERFIL</span>
            <button onClick={f.handleSignOut} className="font-mono text-[10px] tracking-eyebrow text-ink-4 hover:text-red transition-colors">
              SAIR →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-10">

          {/* Form */}
          <div className="space-y-6">

            {/* Banner */}
            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">BANNER DO PERFIL</label>
              <div className="relative h-36 bg-paper-deep border-2 border-dashed border-ink-3 hover:border-ink transition-colors overflow-hidden cursor-pointer"
                onClick={() => f.bannerRef.current?.click()}>
                {f.bannerPreview ? (
                  <img src={f.bannerPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="font-mono text-[10px] text-ink-4 tracking-eyebrow">+ ADICIONAR BANNER</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-ink/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="font-mono text-[10px] text-white tracking-eyebrow">TROCAR BANNER</span>
                </div>
              </div>
              <input ref={f.bannerRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && f.handlePickBanner(e.target.files[0])} />
            </div>

            {/* Photo + name */}
            <div className="flex items-end gap-5">
              <div>
                <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">FOTO DE PERFIL</label>
                <button onClick={() => f.photoRef.current?.click()}
                  className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-ink-3 hover:border-ink transition-colors">
                  {f.photoPreview ? (
                    <img src={f.photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Avatar initials={f.initials} color={f.avatarColor} size={80} />
                  )}
                  <div className="absolute inset-0 bg-ink/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-mono text-[8px] text-white">TROCAR</span>
                  </div>
                </button>
                <input ref={f.photoRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && f.handlePickPhoto(e.target.files[0])} />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">NOME</label>
                  <input value={f.firstName} onChange={e => f.setFirstName(e.target.value)} placeholder="Felipe"
                    className="w-full border-2 border-ink px-4 py-3 font-sans text-sm bg-transparent outline-none" />
                </div>
                <div>
                  <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">SOBRENOME</label>
                  <input value={f.lastName} onChange={e => f.setLastName(e.target.value)} placeholder="Souza"
                    className="w-full border-2 border-ink px-4 py-3 font-sans text-sm bg-transparent outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">ÁREA NA FIRMA</label>
              <input value={f.dept} onChange={e => f.setDept(e.target.value)} placeholder="ex: Design, Engenharia, Marketing…"
                className="w-full border-2 border-ink px-4 py-3 font-sans text-sm bg-transparent outline-none" />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">BIO</label>
              <textarea value={f.bio} onChange={e => f.setBio(e.target.value)}
                placeholder="Conte um pouco sobre você…" rows={2}
                className="w-full border-2 border-ink px-4 py-3 font-sans text-sm bg-transparent outline-none resize-none" />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">JOGADOR FAVORITO</label>
              <input value={f.favoritePlayer} onChange={e => f.setFavoritePlayer(e.target.value)}
                placeholder="ex: Vini Jr, Mbappé, Haaland…"
                className="w-full border-2 border-ink px-4 py-3 font-sans text-sm bg-transparent outline-none" />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">COR DO AVATAR</label>
              <div className="flex items-center gap-3">
                <Avatar initials={f.initials} color={f.avatarColor} size={52} />
                <div className="flex gap-2">
                  {AVATAR_COLORS.map(c => (
                    <button key={c} onClick={() => f.setAvatarColor(c)}
                      className="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ background: c, borderColor: f.avatarColor === c ? '#0D0D0D' : '#ECE6D6' }} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">
                SELEÇÃO DO CORAÇÃO
                {f.favoriteTeam && TEAMS[f.favoriteTeam] && (
                  <span className="ml-2 text-green normal-case">· {TEAMS[f.favoriteTeam].name}</span>
                )}
              </label>
              <AllTeamsPicker value={f.favoriteTeam} onChange={f.setFavoriteTeam} />
            </div>

            <ApostasGeraisSummary
              championPick={f.championPick} vicePick={f.vicePick} scorerPick={f.scorerPick}
              onEdit={() => navigate('/prediction', { state: { tab: 'champion' } })}
            />

            <div className="flex gap-3">
              <button onClick={f.handleSave} disabled={f.saving}
                className="btn-yellow flex-1 justify-center text-base">
                {f.saving ? 'SALVANDO…' : 'SALVAR PERFIL →'}
              </button>
              <button onClick={f.handleClearPredictions}
                className="btn-ghost px-4 text-[10px] text-ink-4 hover:text-red">
                LIMPAR PALPITES
              </button>
              <button onClick={f.handleSignOut} className="btn-ghost px-5 text-[11px]">SAIR</button>
            </div>
          </div>

          {/* Preview card */}
          <div>
            <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-3">COMO VOCÊ APARECE</label>
            <motion.div animate={{ rotate: -1 }} className="bg-paper border-2 border-ink shadow-card overflow-hidden">
              {/* Banner */}
              <div className="h-20 bg-ink relative overflow-hidden">
                {f.bannerPreview && <img src={f.bannerPreview} alt="" className="w-full h-full object-cover opacity-80" />}
              </div>
              {/* Avatar */}
              <div className="-mt-7 px-5 pb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-paper bg-paper">
                  {f.photoPreview ? (
                    <img src={f.photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Avatar initials={f.initials} color={f.avatarColor} size={56} />
                  )}
                </div>
                <div className="mt-2 font-display text-xl leading-none">
                  {f.firstName || 'NOME'} {f.lastName || 'SOBRENOME'}
                </div>
                <div className="font-mono text-[10px] text-ink-3 mt-0.5">{f.dept || 'ÁREA'}</div>
                {f.bio && <p className="font-sans text-[12px] text-ink-2 mt-1.5 leading-snug line-clamp-2">{f.bio}</p>}

                <div className="border-t border-hairline mt-3 pt-3 grid grid-cols-3 gap-2 text-center">
                  <div><div className="font-display text-2xl">0</div><div className="font-mono text-[9px] text-ink-4">PTS</div></div>
                  <div><div className="font-display text-2xl">—</div><div className="font-mono text-[9px] text-ink-4">ACERTOS</div></div>
                  <div><div className="font-display text-2xl">—</div><div className="font-mono text-[9px] text-ink-4">EXATOS</div></div>
                </div>

                {f.favoriteTeam && TEAMS[f.favoriteTeam] && (
                  <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-2">
                    <Flag team={TEAMS[f.favoriteTeam]} size={16} />
                    <span className="font-mono text-[9px] text-ink-3 tracking-eyebrow">
                      TORCE POR: {TEAMS[f.favoriteTeam].name.toUpperCase()}
                    </span>
                  </div>
                )}
                {f.favoritePlayer && (
                  <div className="mt-1 flex items-center gap-1.5">
                    {f.favoritePlayerImg ? (
                      <img src={f.favoritePlayerImg} alt="" className="w-6 h-6 object-contain object-bottom" />
                    ) : (
                      <span className="text-[11px]">⚽</span>
                    )}
                    <span className="font-mono text-[9px] text-ink-3">{f.favoritePlayer}</span>
                  </div>
                )}
                <div className="mt-3 flex justify-between items-center">
                  <Stamp color="#6B6B66" rotation={-1}>NOVATO '26</Stamp>
                  <span className="font-mono text-[10px] text-ink-4">BOLÃO DA SUPREMA</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}
