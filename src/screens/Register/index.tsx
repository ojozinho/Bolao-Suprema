import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { Avatar } from '@/components/shared/Avatar'
import { useAuthStore } from '@/stores/auth.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { getInitials } from '@/lib/utils'
import { asset } from '@/lib/utils'

const AVATAR_COLORS = [
  '#00A651', '#007A3E', '#E63946', '#1D3557',
  '#FFCB05', '#6FB4FF', '#C9A856', '#FF6600',
]

const DEPTS = [
  'Design', 'Engenharia', 'Produto', 'Marketing',
  'Dados', 'DevOps', 'QA', 'Financeiro', 'Jurídico', 'RH', 'Outro',
]

export function RegisterScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <RegisterDesktop /> : <RegisterMobile />
}

function useRegisterForm() {
  const signUp = useAuthStore(s => s.signUp)
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dept, setDept] = useState('')
  const [color, setColor] = useState('#00A651')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = getInitials(`${firstName} ${lastName}`) || 'FS'
  const canSubmit = firstName.trim() && email.trim() && password.length >= 6 && dept && photo

  const handlePhoto = (file: File) => {
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = e => setPhotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    const result = await signUp(email.trim(), password, { firstName, lastName, dept, color }, photo!)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      navigate('/home')
    }
  }

  return {
    firstName, setFirstName, lastName, setLastName,
    email, setEmail, password, setPassword,
    dept, setDept, color, setColor,
    photo, photoPreview, handlePhoto,
    fileRef, error, loading, canSubmit, initials,
    handleSubmit,
  }
}

// ─── Photo picker shared component ──────────────────────────────────────────

function PhotoPicker({
  preview, initials, color, fileRef, onPick, label,
}: {
  preview: string | null
  initials: string
  color: string
  fileRef: React.RefObject<HTMLInputElement>
  onPick: (f: File) => void
  label: string
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-eyebrow text-ink-3 mb-2">{label} <span className="text-red">*</span></p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-ink-3 hover:border-ink transition-colors flex items-center justify-center bg-paper-deep flex-shrink-0"
        >
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <Avatar initials={initials} color={color} size={80} />
          )}
          <div className="absolute inset-0 bg-ink/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="font-mono text-[9px] text-white tracking-eyebrow">TROCAR</span>
          </div>
        </button>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-ghost text-[10px] px-3 py-2"
          >
            ESCOLHER FOTO →
          </button>
          <p className="font-mono text-[9px] text-ink-4 mt-1">JPG ou PNG · máx 5MB</p>
          <p className="font-mono text-[9px] text-ink-4">Obrigatório — ajuda a identificar quem é da firma</p>
        </div>
      </div>
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

// ─── Mobile ───────────────────────────────────────────────────────────────────

function RegisterMobile() {
  const f = useRegisterForm()

  return (
    <div className="min-h-dvh flex flex-col relative bg-ink">
      <div className="absolute inset-0">
        <img
          src={asset('assets/hero-portrait.webp')}
          alt=""
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      </div>

      <div className="relative flex-1 flex flex-col px-5 pt-6 pb-10 overflow-y-auto">
        <Logo height={52} className="mb-6 brightness-0 invert flex-shrink-0" />

        <h1 className="font-display text-4xl text-paper leading-none mb-1 flex-shrink-0">
          CRIAR<br />CONTA
        </h1>
        <p className="font-serif-it text-yellow text-base mb-6 flex-shrink-0">
          seja bem-vindo à firma
        </p>

        <div className="space-y-4">
          {/* Photo */}
          <div className="bg-paper/10 border border-paper/20 p-4">
            <PhotoPicker
              preview={f.photoPreview}
              initials={f.initials}
              color={f.color}
              fileRef={f.fileRef as React.RefObject<HTMLInputElement>}
              onPick={f.handlePhoto}
              label="FOTO DE PERFIL"
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-mono text-[9px] tracking-eyebrow text-paper/50 mb-1">NOME</p>
              <input
                value={f.firstName}
                onChange={e => f.setFirstName(e.target.value)}
                placeholder="Felipe"
                className="w-full bg-paper/10 border border-paper/20 focus:border-paper/60 px-3 py-2.5 font-sans text-[13px] text-paper placeholder:text-paper/30 outline-none"
              />
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-eyebrow text-paper/50 mb-1">SOBRENOME</p>
              <input
                value={f.lastName}
                onChange={e => f.setLastName(e.target.value)}
                placeholder="Souza"
                className="w-full bg-paper/10 border border-paper/20 focus:border-paper/60 px-3 py-2.5 font-sans text-[13px] text-paper placeholder:text-paper/30 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-paper/50 mb-1">E-MAIL</p>
            <input
              type="email"
              value={f.email}
              onChange={e => f.setEmail(e.target.value)}
              placeholder="felipe@suprema.group"
              className="w-full bg-paper/10 border border-paper/20 focus:border-paper/60 px-3 py-2.5 font-sans text-[13px] text-paper placeholder:text-paper/30 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-paper/50 mb-1">SENHA (mín. 6 caracteres)</p>
            <input
              type="password"
              value={f.password}
              onChange={e => f.setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-paper/10 border border-paper/20 focus:border-paper/60 px-3 py-2.5 font-sans text-[13px] text-paper placeholder:text-paper/30 outline-none"
            />
          </div>

          {/* Dept */}
          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-paper/50 mb-1">ÁREA NA FIRMA</p>
            <select
              value={f.dept}
              onChange={e => f.setDept(e.target.value)}
              className="w-full bg-paper/10 border border-paper/20 focus:border-paper/60 px-3 py-2.5 font-sans text-[13px] text-paper outline-none"
            >
              <option value="" className="bg-ink">Selecione…</option>
              {DEPTS.map(d => <option key={d} value={d} className="bg-ink">{d}</option>)}
            </select>
          </div>

          {/* Color */}
          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-paper/50 mb-2">COR DO AVATAR</p>
            <div className="flex gap-2">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => f.setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ background: c, borderColor: f.color === c ? '#FFCB05' : 'transparent' }}
                />
              ))}
            </div>
          </div>

          {f.error && (
            <p className="font-mono text-[11px] text-red bg-red/10 border border-red/30 px-3 py-2">
              {f.error}
            </p>
          )}

          <button
            onClick={f.handleSubmit}
            disabled={!f.canSubmit || f.loading}
            className="btn-yellow w-full justify-center disabled:opacity-50"
          >
            {f.loading ? 'CRIANDO CONTA…' : 'CRIAR CONTA →'}
          </button>

          <p className="font-mono text-[10px] text-paper/40 text-center">
            Já tem conta?{' '}
            <Link to="/login" className="text-yellow hover:text-paper/80">ENTRAR →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function RegisterDesktop() {
  const f = useRegisterForm()

  return (
    <div className="min-h-dvh flex bg-paper">
      {/* Left — Photo */}
      <div className="relative flex-1 hidden lg:flex flex-col justify-end p-10 overflow-hidden">
        <img
          src={asset('assets/hero-portrait.webp')}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="relative">
          <div className="font-display text-[80px] leading-none text-paper mb-2">BOLÃO</div>
          <div className="font-serif-it text-2xl text-yellow">Copa do Mundo 2026</div>
          <div className="font-mono text-[11px] text-paper/40 mt-2 tracking-eyebrow">
            ★ USA · CAN · MEX · JUN–JUL 2026
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-[520px] flex flex-col justify-center px-10 py-12 bg-paper overflow-y-auto">
        <Logo height={64} className="mb-6" />

        <h1 className="font-display text-4xl leading-none mb-1">CRIAR CONTA</h1>
        <p className="font-serif-it text-green-deep text-lg mb-7">junte-se ao bolão da Suprema</p>

        <div className="space-y-5">
          <PhotoPicker
            preview={f.photoPreview}
            initials={f.initials}
            color={f.color}
            fileRef={f.fileRef as React.RefObject<HTMLInputElement>}
            onPick={f.handlePhoto}
            label="FOTO DE PERFIL"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-1.5">NOME</p>
              <input
                value={f.firstName}
                onChange={e => f.setFirstName(e.target.value)}
                placeholder="Felipe"
                className="w-full bg-paper-deep border border-line focus:border-ink px-3 py-3 font-sans text-[14px] outline-none placeholder:text-ink-4"
              />
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-1.5">SOBRENOME</p>
              <input
                value={f.lastName}
                onChange={e => f.setLastName(e.target.value)}
                placeholder="Souza"
                className="w-full bg-paper-deep border border-line focus:border-ink px-3 py-3 font-sans text-[14px] outline-none placeholder:text-ink-4"
              />
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-1.5">E-MAIL</p>
            <input
              type="email"
              value={f.email}
              onChange={e => f.setEmail(e.target.value)}
              placeholder="felipe@suprema.group"
              className="w-full bg-paper-deep border border-line focus:border-ink px-3 py-3 font-sans text-[14px] outline-none placeholder:text-ink-4"
            />
          </div>

          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-1.5">SENHA (mín. 6 caracteres)</p>
            <input
              type="password"
              value={f.password}
              onChange={e => f.setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-paper-deep border border-line focus:border-ink px-3 py-3 font-sans text-[14px] outline-none placeholder:text-ink-4"
            />
          </div>

          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-1.5">ÁREA NA FIRMA</p>
            <select
              value={f.dept}
              onChange={e => f.setDept(e.target.value)}
              className="w-full bg-paper-deep border border-line focus:border-ink px-3 py-3 font-sans text-[14px] outline-none text-ink"
            >
              <option value="">Selecione…</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-2">COR DO AVATAR</p>
            <div className="flex items-center gap-3">
              <Avatar initials={f.initials} color={f.color} size={36} />
              <div className="flex gap-2">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => f.setColor(c)}
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ background: c, borderColor: f.color === c ? '#0D0D0D' : '#ECE6D6' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {f.error && (
            <p className="font-mono text-[11px] text-red bg-red/10 border border-red/30 px-3 py-2">
              {f.error}
            </p>
          )}

          <button
            onClick={f.handleSubmit}
            disabled={!f.canSubmit || f.loading}
            className="btn-yellow w-full justify-center disabled:opacity-50"
          >
            {f.loading ? 'CRIANDO CONTA…' : 'CRIAR CONTA →'}
          </button>

          <p className="font-mono text-[10px] text-ink-4 text-center">
            Já tem conta?{' '}
            <Link to="/login" className="text-green-deep hover:underline">ENTRAR →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
