import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/shared/Logo'
import { TourneyMark } from '@/components/shared/TourneyMark'
import { useAuthStore } from '@/stores/auth.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { asset } from '@/lib/utils'

export function LoginScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <LoginDesktop /> : <LoginMobile />
}

function useLoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithEmail } = useAuthStore()
  const navigate = useNavigate()

  const fullEmail = email.includes('@') ? email : `${email}@suprema.group`

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const result = await signInWithEmail(fullEmail)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      navigate('/home')
    }
  }

  return { email, setEmail, fullEmail, loading, error, handleSubmit }
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function LoginMobile() {
  const { email, setEmail, loading, error, handleSubmit } = useLoginForm()

  return (
    <div className="min-h-dvh flex flex-col relative bg-ink">
      {/* Hero bg */}
      <div className="absolute inset-0">
        <img
          src={asset('assets/hero-portrait.webp')}
          alt=""
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      <div className="relative flex-1 flex flex-col justify-end p-5 pb-10">
        <Logo height={36} className="mb-8 brightness-0 invert" />

        <h1 className="font-display text-5xl text-paper leading-none mb-2">
          ACESSO<br />RESTRITO
        </h1>
        <p className="font-serif-it text-yellow text-lg mb-8">
          só pra galera da firma
        </p>

        <div className="space-y-3">
          <div className="relative border-2 border-paper/30 bg-paper/10 backdrop-blur-sm flex items-center">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="seu.nome@suprema.group"
              autoComplete="email"
              className="flex-1 bg-transparent px-4 py-3.5 text-paper font-mono text-sm outline-none placeholder:text-paper/40"
            />
          </div>

          {error && (
            <p className="font-mono text-[11px] text-red tracking-eyebrow">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            className="btn-yellow w-full justify-center disabled:opacity-50"
          >
            {loading ? 'ENTRANDO…' : 'ENTRAR →'}
          </button>
        </div>

        <p className="font-mono text-[10px] text-paper/30 tracking-eyebrow text-center mt-6">
          ACESSO RESTRITO À SUPREMA GAMING · USO INTERNO
        </p>
      </div>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function LoginDesktop() {
  const { email, setEmail, loading, error, handleSubmit } = useLoginForm()

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
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-10 py-12 bg-paper">
        <Logo height={40} className="mb-10" />

        <TourneyMark size="sm" className="mb-6 block" />

        <h1 className="font-display text-5xl leading-none mb-2">
          ENTRAR<br />NO BOLÃO
        </h1>
        <p className="font-serif-it text-green-deep text-xl mb-10">
          só pra galera da Suprema
        </p>

        <div className="space-y-4">
          <div>
            <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">
              E-MAIL CORPORATIVO
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="seu.nome@suprema.group"
              autoComplete="email"
              className="w-full border-2 border-ink px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-ink-4 bg-transparent"
            />
          </div>

          {error && (
            <p className="font-mono text-[11px] text-red tracking-eyebrow">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            className="btn-yellow w-full justify-center disabled:opacity-50"
          >
            {loading ? 'ENTRANDO…' : 'ENTRAR →'}
          </button>

          <p className="font-mono text-[10px] text-ink-4 text-center">
            Acesso restrito a colaboradores da Suprema Gaming.
          </p>
        </div>
      </div>
    </div>
  )
}
