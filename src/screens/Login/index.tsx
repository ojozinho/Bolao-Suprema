import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/shared/Logo'
import { TourneyMark } from '@/components/shared/TourneyMark'
import { useAuthStore } from '@/stores/auth.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { asset } from '@/lib/utils'

// ─── OTP logic (shared) ───────────────────────────────────────────────────────

type Step = 'email' | 'code'

function useOtpFlow() {
  const { sendOtp, verifyOtp } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const canSendEmail = email.trim().toLowerCase().endsWith('@suprema.group')
  const code = digits.join('')
  const codeComplete = code.length === 6

  const handleSendOtp = async () => {
    if (!canSendEmail || loading) return
    setLoading(true)
    setError('')
    const res = await sendOtp(email.trim())
    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else {
      setStep('code')
      setResendCooldown(60)
    }
  }

  const handleVerify = async () => {
    if (!codeComplete || loading) return
    setLoading(true)
    setError('')
    const res = await verifyOtp(email.trim(), code)
    setLoading(false)
    if (res.error) {
      setError(res.error)
      setDigits(['', '', '', '', '', ''])
    } else {
      navigate('/home', { replace: true })
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return
    setLoading(true)
    setError('')
    const res = await sendOtp(email.trim())
    setLoading(false)
    if (res.error) setError(res.error)
    else setResendCooldown(60)
  }

  const handleBack = () => {
    setStep('email')
    setDigits(['', '', '', '', '', ''])
    setError('')
  }

  return {
    step, email, setEmail, digits, setDigits,
    error, loading, canSendEmail, codeComplete,
    resendCooldown,
    handleSendOtp, handleVerify, handleResend, handleBack,
  }
}

// ─── 6-digit code input ────────────────────────────────────────────────────────

function CodeInput({
  digits,
  setDigits,
  onComplete,
  light,
}: {
  digits: string[]
  setDigits: (d: string[]) => void
  onComplete: () => void
  light?: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const focus = (i: number) => refs.current[i]?.focus()

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    if (digit && i < 5) focus(i + 1)
    if (next.join('').length === 6) onComplete()
  }

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      focus(i - 1)
    }
    if (e.key === 'Enter' && digits.join('').length === 6) onComplete()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = [...digits]
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? ''
    setDigits(next)
    focus(Math.min(pasted.length, 5))
    if (pasted.length === 6) onComplete()
  }

  const base = light
    ? 'border-paper/30 bg-paper/10 text-paper focus:border-yellow caret-yellow'
    : 'border-line bg-paper-deep text-ink focus:border-ink caret-ink'

  return (
    <div className="flex gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          autoFocus={i === 0}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-full aspect-square text-center font-display text-2xl border outline-none transition-colors ${base}`}
        />
      ))}
    </div>
  )
}

// ─── Screen router ────────────────────────────────────────────────────────────

export function LoginScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <LoginDesktop /> : <LoginMobile />
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function LoginMobile() {
  const f = useOtpFlow()

  return (
    <div className="min-h-dvh flex flex-col relative bg-ink">
      <div className="absolute inset-0">
        <img
          src={asset('assets/hero-portrait.webp')}
          alt=""
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      <div className="relative flex-1 flex flex-col justify-end p-5 pb-10">
        <Logo height={56} className="mb-8 brightness-0 invert" />

        <AnimatePresence mode="wait">
          {f.step === 'email' ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-5xl text-paper leading-none mb-2">
                ACESSO<br />RESTRITO
              </h1>
              <p className="font-serif-it text-yellow text-lg mb-8">
                só pra galera da firma
              </p>

              <div className="mb-3">
                <p className="font-mono text-[9px] tracking-eyebrow text-paper/50 mb-1.5">
                  E-MAIL CORPORATIVO
                </p>
                <input
                  type="email"
                  value={f.email}
                  onChange={e => f.setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && f.handleSendOtp()}
                  placeholder="seu.nome@suprema.group"
                  autoFocus
                  autoComplete="email"
                  className="w-full bg-paper/10 border border-paper/20 focus:border-yellow px-3 py-3 font-sans text-[14px] text-paper placeholder:text-paper/30 outline-none transition-colors"
                />
              </div>

              {f.error && (
                <p className="font-mono text-[11px] text-red bg-red/10 border border-red/20 px-3 py-2 mb-3">
                  {f.error}
                </p>
              )}

              <button
                onClick={f.handleSendOtp}
                disabled={!f.canSendEmail || f.loading}
                className="btn-yellow w-full justify-center disabled:opacity-50"
              >
                {f.loading ? 'ENVIANDO…' : 'RECEBER CÓDIGO →'}
              </button>

              <p className="font-mono text-[10px] text-paper/30 tracking-eyebrow text-center mt-6">
                ACESSO RESTRITO À SUPREMA GAMING · USO INTERNO
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={f.handleBack}
                className="font-mono text-[10px] text-paper/50 hover:text-paper mb-6 flex items-center gap-1"
              >
                ← VOLTAR
              </button>

              <h1 className="font-display text-4xl text-paper leading-none mb-2">
                CÓDIGO<br />ENVIADO
              </h1>
              <p className="font-serif-it text-yellow text-base mb-1">
                verifique seu e-mail
              </p>
              <p className="font-mono text-[10px] text-paper/50 mb-6 truncate">
                {f.email}
              </p>

              <div className="mb-4">
                <p className="font-mono text-[9px] tracking-eyebrow text-paper/50 mb-2">
                  CÓDIGO DE 6 DÍGITOS
                </p>
                <CodeInput
                  digits={f.digits}
                  setDigits={f.setDigits}
                  onComplete={f.handleVerify}
                  light
                />
              </div>

              {f.error && (
                <p className="font-mono text-[11px] text-red bg-red/10 border border-red/20 px-3 py-2 mb-3">
                  {f.error}
                </p>
              )}

              <button
                onClick={f.handleVerify}
                disabled={!f.codeComplete || f.loading}
                className="btn-yellow w-full justify-center disabled:opacity-50 mb-4"
              >
                {f.loading ? 'VERIFICANDO…' : 'ENTRAR →'}
              </button>

              <button
                onClick={f.handleResend}
                disabled={f.resendCooldown > 0 || f.loading}
                className="font-mono text-[10px] text-paper/40 hover:text-paper/70 disabled:opacity-40 text-center w-full transition-colors"
              >
                {f.resendCooldown > 0
                  ? `REENVIAR EM ${f.resendCooldown}S`
                  : 'NÃO RECEBEU? REENVIAR CÓDIGO'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function LoginDesktop() {
  const f = useOtpFlow()

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
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-10 py-12 bg-paper overflow-hidden">
        <Logo height={72} className="mb-8" />
        <TourneyMark size="sm" className="mb-6 block" />

        <AnimatePresence mode="wait">
          {f.step === 'email' ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-5xl leading-none mb-2">
                ENTRAR<br />NO BOLÃO
              </h1>
              <p className="font-serif-it text-green-deep text-xl mb-8">
                só pra galera da Suprema
              </p>

              <div className="mb-4">
                <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-1.5">
                  E-MAIL CORPORATIVO
                </p>
                <input
                  type="email"
                  value={f.email}
                  onChange={e => f.setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && f.handleSendOtp()}
                  placeholder="seu.nome@suprema.group"
                  autoFocus
                  autoComplete="email"
                  className="w-full bg-paper-deep border border-line focus:border-ink px-3 py-3 font-sans text-[14px] outline-none transition-colors placeholder:text-ink-4"
                />
                <p className="font-mono text-[9px] text-ink-4 mt-1.5">
                  Você receberá um código de acesso por e-mail.
                </p>
              </div>

              {f.error && (
                <p className="font-mono text-[11px] text-red bg-red/10 border border-red/30 px-3 py-2 mb-4">
                  {f.error}
                </p>
              )}

              <button
                onClick={f.handleSendOtp}
                disabled={!f.canSendEmail || f.loading}
                className="btn-yellow w-full justify-center disabled:opacity-50"
              >
                {f.loading ? 'ENVIANDO…' : 'RECEBER CÓDIGO →'}
              </button>

              <p className="font-mono text-[10px] text-ink-4 text-center mt-5">
                Acesso restrito a colaboradores da Suprema Gaming.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={f.handleBack}
                className="font-mono text-[10px] text-ink-4 hover:text-ink mb-8 flex items-center gap-1"
              >
                ← VOLTAR
              </button>

              <h1 className="font-display text-5xl leading-none mb-2">
                CÓDIGO<br />ENVIADO
              </h1>
              <p className="font-serif-it text-green-deep text-xl mb-2">
                verifique seu e-mail
              </p>
              <p className="font-mono text-[10px] text-ink-4 mb-6 truncate">
                {f.email}
              </p>

              <div className="mb-4">
                <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-2">
                  CÓDIGO DE 6 DÍGITOS
                </p>
                <CodeInput
                  digits={f.digits}
                  setDigits={f.setDigits}
                  onComplete={f.handleVerify}
                />
              </div>

              {f.error && (
                <p className="font-mono text-[11px] text-red bg-red/10 border border-red/30 px-3 py-2 mb-4">
                  {f.error}
                </p>
              )}

              <button
                onClick={f.handleVerify}
                disabled={!f.codeComplete || f.loading}
                className="btn-yellow w-full justify-center disabled:opacity-50 mb-4"
              >
                {f.loading ? 'VERIFICANDO…' : 'ENTRAR NO BOLÃO →'}
              </button>

              <button
                onClick={f.handleResend}
                disabled={f.resendCooldown > 0 || f.loading}
                className="font-mono text-[10px] text-ink-4 hover:text-ink disabled:opacity-40 text-center w-full transition-colors"
              >
                {f.resendCooldown > 0
                  ? `REENVIAR EM ${f.resendCooldown}S`
                  : 'NÃO RECEBEU? REENVIAR CÓDIGO'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
