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
  const [email, setEmail] = useState('felipe.souza@')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithEmail } = useAuthStore()
  const navigate = useNavigate()

  const fullEmail = email.includes('@suprema') ? email : `${email}suprema.group`

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const result = await signInWithEmail(fullEmail)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSent(true)
      // Mock mode: redirect immediately after state is set via signInWithEmail
      // Real mode: user clicks magic link in email → onAuthStateChange handles redirect
      if (import.meta.env.VITE_MOCK_MODE !== 'false') {
        setTimeout(() => navigate('/home'), 600)
      }
    }
  }

  return { email, setEmail, fullEmail, sent, loading, error, handleSubmit }
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function LoginMobile() {
  const { email, setEmail, fullEmail, sent, loading, error, handleSubmit } = useLoginForm()

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

        {!sent ? (
          <div className="space-y-3">
            {/* Email input */}
            <div className="relative border-2 border-paper/30 bg-paper/10 backdrop-blur-sm flex items-center">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome"
                className="flex-1 bg-transparent px-4 py-3.5 text-paper font-mono text-sm outline-none placeholder:text-paper/40"
              />
              <span className="px-4 font-mono text-[12px] text-paper/50 border-l border-paper/20 whitespace-nowrap">
                @suprema.group
              </span>
            </div>

            {error && (
              <p className="font-mono text-[11px] text-red tracking-eyebrow">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-yellow w-full justify-center disabled:opacity-50"
            >
              {loading ? 'ENVIANDO…' : 'ENVIAR LINK MÁGICO →'}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <p className="font-display text-3xl text-yellow mb-2">LINK ENVIADO!</p>
            <p className="font-mono text-[12px] text-paper/60">Cheque seu e-mail e clique no link de acesso.</p>
          </motion.div>
        )}

        <p className="font-mono text-[10px] text-paper/30 tracking-eyebrow text-center mt-6">
          ACESSO RESTRITO À SUPREMA GAMING · USO INTERNO
        </p>
      </div>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function LoginDesktop() {
  const { email, setEmail, fullEmail, sent, loading, error, handleSubmit } = useLoginForm()

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

        {/* Stats overlay */}
        <div className="relative grid grid-cols-3 gap-6">
          {[
            { val: '02', label: 'dias restantes' },
            { val: '87', label: 'jogadores' },
            { val: '1.284', label: 'pts · líder' },
          ].map(({ val, label }) => (
            <div key={label} className="border-l-2 border-paper/30 pl-3">
              <div className="font-display text-3xl text-paper">{val}</div>
              <div className="font-mono text-[10px] text-paper/50 tracking-eyebrow">{label}</div>
            </div>
          ))}
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

        {!sent ? (
          <div className="space-y-4">
            <div>
              <label className="font-mono text-[10px] tracking-eyebrow text-ink-3 block mb-2">
                E-MAIL CORPORATIVO
              </label>
              <div className="flex border-2 border-ink">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome"
                  className="flex-1 bg-transparent px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-ink-4"
                />
                <span className="px-4 flex items-center font-mono text-[12px] text-ink-3 border-l border-ink bg-paper-deep whitespace-nowrap">
                  @suprema.group
                </span>
              </div>
            </div>

            {error && (
              <p className="font-mono text-[11px] text-red tracking-eyebrow">{error}</p>
            )}

            <button onClick={handleSubmit} disabled={loading} className="btn-yellow w-full justify-center disabled:opacity-50">
              {loading ? 'ENVIANDO…' : 'ENVIAR LINK MÁGICO →'}
            </button>

            <p className="font-mono text-[10px] text-ink-4 text-center">
              Você receberá um link de acesso no e-mail corporativo.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <p className="font-display text-4xl text-green mb-2">LINK ENVIADO!</p>
            <p className="font-mono text-[12px] text-ink-3">Cheque seu e-mail e clique no link de acesso.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
