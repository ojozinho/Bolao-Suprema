import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/shared/Logo'
import { Avatar } from '@/components/shared/Avatar'
import { Flag } from '@/components/shared/Flag'
import { Stamp } from '@/components/shared/Stamp'
import { useAuthStore } from '@/stores/auth.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { TEAMS } from '@/data/teams'
import { colorFromString, getInitials } from '@/lib/utils'
import type { TeamCode } from '@/types'

const FEATURED_TEAMS = ['BRA', 'ARG', 'FRA', 'GER', 'ESP', 'POR', 'ENG', 'NED']
const AVATAR_COLORS = ['#00A651', '#E63946', '#1D3557', '#FFCB05', '#6FB4FF', '#C9A856', '#007A3E', '#FF6600']

export function ProfileScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <ProfileDesktop /> : <ProfileMobile />
}

function useProfileForm() {
  const { user, updateProfile } = useAuthStore()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [dept, setDept] = useState(user?.dept ?? '')
  const [avatarColor, setAvatarColor] = useState(user?.color ?? '#00A651')
  const [favoriteTeam, setFavoriteTeam] = useState<TeamCode | undefined>(user?.favoriteTeam)
  const [championPick, setChampionPick] = useState<TeamCode | undefined>(user?.championPick)
  const [saving, setSaving] = useState(false)

  const initials = getInitials(`${firstName} ${lastName}`) || 'FS'

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({
      firstName,
      lastName,
      dept,
      color: avatarColor,
      initials,
      favoriteTeam,
      championPick,
    })
    setSaving(false)
    navigate('/home')
  }

  return {
    firstName, setFirstName, lastName, setLastName, dept, setDept,
    avatarColor, setAvatarColor, favoriteTeam, setFavoriteTeam,
    championPick, setChampionPick, initials, saving, handleSave,
  }
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function ProfileMobile() {
  const form = useProfileForm()
  const [tab, setTab] = useState<'photo' | 'avatar'>('avatar')

  return (
    <div className="min-h-dvh bg-paper pb-24">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-hairline">
        <Logo height={28} />
        <span className="font-mono text-[10px] tracking-eyebrow text-ink-3">MEU PERFIL</span>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {/* Name */}
        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">NOME</label>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.firstName} onChange={e => form.setFirstName(e.target.value)}
              placeholder="Felipe" className="border-2 border-ink px-3 py-2.5 font-sans text-sm bg-transparent outline-none" />
            <input value={form.lastName} onChange={e => form.setLastName(e.target.value)}
              placeholder="Souza" className="border-2 border-ink px-3 py-2.5 font-sans text-sm bg-transparent outline-none" />
          </div>
        </div>

        {/* Dept */}
        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">ÁREA NA FIRMA</label>
          <input value={form.dept} onChange={e => form.setDept(e.target.value)}
            placeholder="ex: Design, Engenharia…" className="w-full border-2 border-ink px-3 py-2.5 font-sans text-sm bg-transparent outline-none" />
        </div>

        {/* Avatar color */}
        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">COR DO AVATAR</label>
          <div className="flex gap-2">
            <Avatar initials={form.initials} color={form.avatarColor} size={48} />
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => form.setAvatarColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: form.avatarColor === c ? '#0D0D0D' : 'transparent' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Favorite team */}
        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">TORCE POR</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FEATURED_TEAMS.map(code => {
              const team = TEAMS[code]
              return (
                <button key={code} onClick={() => form.setFavoriteTeam(code)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 border-2 transition-all ${form.favoriteTeam === code ? 'border-ink bg-yellow' : 'border-hairline'}`}>
                  <Flag team={team} size={28} />
                  <span className="font-mono text-[9px] font-bold">{team.code}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Champion pick */}
        <div>
          <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">SEU CAMPEÃO (+50 PTS)</label>
          <div className="grid grid-cols-4 gap-2">
            {FEATURED_TEAMS.map(code => {
              const team = TEAMS[code]
              return (
                <button key={code} onClick={() => form.setChampionPick(code)}
                  className={`flex flex-col items-center gap-1.5 p-3 border-2 transition-all ${form.championPick === code ? 'border-ink bg-green text-paper' : 'border-hairline'}`}>
                  <Flag team={team} size={32} />
                  <span className="font-mono text-[9px] font-bold">{team.code}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={form.handleSave} disabled={form.saving} className="btn-yellow w-full justify-center">
          {form.saving ? 'SALVANDO…' : 'SALVAR E ENTRAR →'}
        </button>
      </div>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function ProfileDesktop() {
  const form = useProfileForm()

  return (
    <div className="min-h-dvh bg-paper">
      <div className="max-w-screen-lg mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <Logo height={36} />
          <span className="font-mono text-[11px] tracking-eyebrow text-ink-3">CONFIGURE SEU PERFIL</span>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-10">
          {/* Form */}
          <div className="space-y-7">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">NOME</label>
                <input value={form.firstName} onChange={e => form.setFirstName(e.target.value)}
                  placeholder="Felipe" className="w-full border-2 border-ink px-4 py-3 font-sans text-sm bg-transparent outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">SOBRENOME</label>
                <input value={form.lastName} onChange={e => form.setLastName(e.target.value)}
                  placeholder="Souza" className="w-full border-2 border-ink px-4 py-3 font-sans text-sm bg-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-1.5">ÁREA NA FIRMA</label>
              <input value={form.dept} onChange={e => form.setDept(e.target.value)}
                placeholder="ex: Design, Engenharia, Marketing…" className="w-full border-2 border-ink px-4 py-3 font-sans text-sm bg-transparent outline-none" />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">COR DO AVATAR</label>
              <div className="flex items-center gap-3">
                <Avatar initials={form.initials} color={form.avatarColor} size={52} />
                <div className="flex gap-2">
                  {AVATAR_COLORS.map(c => (
                    <button key={c} onClick={() => form.setAvatarColor(c)}
                      className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                      style={{ background: c, borderColor: form.avatarColor === c ? '#0D0D0D' : '#ECE6D6' }} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">SELEÇÃO DO CORAÇÃO</label>
              <div className="flex gap-2 flex-wrap">
                {FEATURED_TEAMS.map(code => {
                  const team = TEAMS[code]
                  return (
                    <button key={code} onClick={() => form.setFavoriteTeam(code)}
                      className={`flex items-center gap-2 px-3 py-2 border-2 transition-all ${form.favoriteTeam === code ? 'border-ink bg-yellow' : 'border-hairline hover:border-ink-4'}`}>
                      <Flag team={team} size={20} />
                      <span className="font-mono text-[11px] font-bold">{team.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">
                SEU CAMPEÃO <span className="text-green font-bold">+50 PTS</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {FEATURED_TEAMS.map(code => {
                  const team = TEAMS[code]
                  return (
                    <button key={code} onClick={() => form.setChampionPick(code)}
                      className={`flex flex-col items-center gap-2 p-3 border-2 transition-all ${form.championPick === code ? 'border-ink bg-green text-paper' : 'border-hairline hover:border-ink-4'}`}>
                      <Flag team={team} size={36} />
                      <span className="font-mono text-[10px] font-bold">{team.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button onClick={form.handleSave} disabled={form.saving} className="btn-yellow w-full justify-center text-base">
              {form.saving ? 'SALVANDO…' : 'SALVAR PERFIL E ENTRAR →'}
            </button>
          </div>

          {/* Preview card */}
          <div>
            <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-3">COMO VOCÊ APARECE</label>
            <div
              className="bg-paper border-2 border-ink p-5 shadow-card"
              style={{ transform: 'rotate(-1deg)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials={form.initials} color={form.avatarColor} size={52} />
                <div>
                  <div className="font-display text-2xl leading-none">
                    {form.firstName || 'NOME'} {form.lastName || 'SOBRENOME'}
                  </div>
                  <div className="font-mono text-[11px] text-ink-3 mt-0.5">{form.dept || 'ÁREA'}</div>
                </div>
              </div>
              <div className="border-t border-hairline pt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-display text-2xl">0</div>
                  <div className="font-mono text-[9px] text-ink-4">PTS</div>
                </div>
                <div>
                  <div className="font-display text-2xl">—</div>
                  <div className="font-mono text-[9px] text-ink-4">ACERTOS</div>
                </div>
                <div>
                  <div className="font-display text-2xl">—</div>
                  <div className="font-mono text-[9px] text-ink-4">EXATOS</div>
                </div>
              </div>
              {form.championPick && TEAMS[form.championPick] && (
                <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3">
                  <Flag team={TEAMS[form.championPick]} size={20} />
                  <span className="font-mono text-[10px] tracking-eyebrow text-ink-3">
                    CAMPEÃO: {TEAMS[form.championPick].name.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="mt-3 flex justify-between items-center">
                <Stamp color="#6B6B66" rotation={-1}>NOVATO '26</Stamp>
                <span className="font-mono text-[10px] text-ink-4">#001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
