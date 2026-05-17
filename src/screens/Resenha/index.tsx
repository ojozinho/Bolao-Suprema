import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/shared/Avatar'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useChatStore } from '@/stores/chat.store'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import type { ChatMessage, ChatPoll } from '@/types'

// ─── GIF API ─────────────────────────────────────────────────────────────────
// Primary: Tenor v1 (public demo key — free, no auth required)
// Fallback: Tenor v2 (if VITE_TENOR_KEY is set) or Giphy

const TENOR_V1_KEY = 'LIVDSRZULELA'
const TENOR_V2_KEY = import.meta.env.VITE_TENOR_KEY as string | undefined
const DRAFT_KEY    = 'resenha-draft-geral'

interface GifResult { id: string; url: string; preview: string }

async function fetchGifs(query: string): Promise<GifResult[]> {
  const q = query.trim()

  // ── Tenor v1 (primary, always available) ──────────────────────────────────
  try {
    const base   = 'https://g.tenor.com/v1'
    const params = new URLSearchParams({
      key: TENOR_V1_KEY, limit: '24', contentfilter: 'medium', media_filter: 'minimal',
    })
    if (q) params.set('q', q)
    const url  = q ? `${base}/search?${params}` : `${base}/trending?${params}`
    const res  = await fetch(url)
    if (res.ok) {
      const data = await res.json() as {
        results: { id: string; media: { gif?: { url: string }; tinygif?: { url: string } }[] }[]
      }
      const gifs = (data.results ?? []).map(r => ({
        id:      r.id,
        url:     r.media[0]?.gif?.url ?? '',
        preview: r.media[0]?.tinygif?.url ?? r.media[0]?.gif?.url ?? '',
      })).filter(g => g.url)
      if (gifs.length > 0) return gifs
    }
  } catch { /* fall through */ }

  // ── Tenor v2 (if custom key set) ──────────────────────────────────────────
  if (TENOR_V2_KEY) {
    try {
      const params = new URLSearchParams({
        key: TENOR_V2_KEY, client_key: 'bolao_suprema',
        limit: '24', contentfilter: 'medium', media_filter: 'gif,tinygif',
      })
      if (q) params.set('q', q)
      const base = 'https://tenor.googleapis.com/v2'
      const url  = q ? `${base}/search?${params}` : `${base}/featured?${params}`
      const res  = await fetch(url)
      if (res.ok) {
        const data = await res.json() as {
          results: { id: string; media_formats: { gif?: { url: string }; tinygif?: { url: string } } }[]
        }
        const gifs = (data.results ?? []).map(r => ({
          id:      r.id,
          url:     r.media_formats.gif?.url ?? '',
          preview: r.media_formats.tinygif?.url ?? r.media_formats.gif?.url ?? '',
        })).filter(g => g.url)
        if (gifs.length > 0) return gifs
      }
    } catch { /* fall through */ }
  }

  return []
}

// ─── GIF Picker ───────────────────────────────────────────────────────────────

function GifPicker({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [query, setQuery]     = useState('')
  const [gifs, setGifs]       = useState<GifResult[]>([])
  const [loading, setLoading] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setLoading(true)
    fetchGifs('').then(g => { setGifs(g); setLoading(false) })
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setLoading(true)
      fetchGifs(query).then(g => { setGifs(g); setLoading(false) })
    }, query.trim() ? 420 : 0)
    return () => clearTimeout(timer.current)
  }, [query])

  return (
    <motion.div
      initial={{ height: 0 }} animate={{ height: 300 }} exit={{ height: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="overflow-hidden border-t border-hairline bg-paper-deep flex-shrink-0"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-hairline bg-paper">
        <span className="font-mono text-[10px] text-ink-4 flex-shrink-0">GIF</span>
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="pesquisar gif..."
          autoFocus
          className="flex-1 bg-transparent font-sans text-[13px] outline-none placeholder:text-ink-4"
        />
        <button onClick={onClose} className="font-mono text-[10px] text-ink-3 hover:text-red px-1 flex-shrink-0">✕</button>
      </div>
      <div className="h-[calc(300px-41px)] overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="font-mono text-[10px] text-ink-4 animate-pulse">BUSCANDO...</span>
          </div>
        ) : gifs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className="font-mono text-[10px] text-ink-4">NENHUM GIF ENCONTRADO</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-0.5 p-1">
            {gifs.map(g => (
              <button
                key={g.id}
                onClick={() => { onSelect(g.url); onClose() }}
                className="aspect-square overflow-hidden bg-hairline hover:opacity-80 transition-opacity"
              >
                <img src={g.preview} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Poll Modal ───────────────────────────────────────────────────────────────

function PollModal({ onCreate, onClose }: { onCreate: (poll: ChatPoll) => void; onClose: () => void }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions]   = useState(['', ''])

  const valid = question.trim().length > 0 && options.filter(o => o.trim()).length >= 2

  const handleCreate = () => {
    if (!valid) return
    onCreate({
      question: question.trim(),
      options: options.filter(o => o.trim()).map((text, i) => ({ id: `o${i + 1}`, text: text.trim() })),
      votes: {},
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-ink/60 px-0 md:px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 48, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full md:max-w-md bg-paper border-2 border-ink p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-2xl">CRIAR ENQUETE</p>
          <button onClick={onClose} className="font-mono text-[10px] text-ink-3 hover:text-ink">FECHAR</button>
        </div>
        <div className="space-y-3">
          <input
            value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="Qual é a pergunta?"
            className="w-full bg-paper-deep border border-line px-3 py-2.5 font-sans text-[14px] outline-none focus:border-ink placeholder:text-ink-4"
          />
          <p className="font-mono text-[9px] text-ink-4 tracking-eyebrow">OPÇÕES (mín. 2, máx. 4)</p>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="font-mono text-[10px] text-ink-4 w-4 text-right flex-shrink-0">{i + 1}</span>
              <input
                value={opt} onChange={e => setOptions(prev => prev.map((o, idx) => idx === i ? e.target.value : o))}
                placeholder={`Opção ${i + 1}`}
                className="flex-1 bg-paper-deep border border-line px-3 py-2 font-sans text-[13px] outline-none focus:border-ink placeholder:text-ink-4"
              />
              {options.length > 2 && (
                <button onClick={() => setOptions(prev => prev.filter((_, idx) => idx !== i))}
                  className="font-mono text-[12px] text-ink-4 hover:text-red w-5 flex-shrink-0">×</button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <button onClick={() => setOptions(prev => [...prev, ''])}
              className="font-mono text-[10px] text-ink-3 hover:text-ink">
              + ADICIONAR OPÇÃO
            </button>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 border border-line font-mono text-[11px] py-2.5 hover:border-ink transition-colors">
            CANCELAR
          </button>
          <button onClick={handleCreate} disabled={!valid}
            className="flex-1 btn-yellow py-2.5 text-[11px] disabled:opacity-40">
            CRIAR ENQUETE
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Message components ───────────────────────────────────────────────────────

function UserAvatar({ m, onClick }: { m: ChatMessage; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn('flex-shrink-0 mt-0.5', onClick && 'hover:opacity-75 transition-opacity cursor-pointer')}
    >
      <Avatar initials={m.initials} color={m.color} src={m.avatarUrl} size={28} />
    </button>
  )
}

function MsgHeader({ m, navigate }: { m: ChatMessage; navigate: (path: string) => void }) {
  return (
    <button
      onClick={() => navigate(`/u/${m.userId}`)}
      className="font-mono text-[10px] text-ink-3 hover:text-ink transition-colors text-left leading-none mb-1"
    >
      <span className="font-bold text-ink-2">{m.who}</span>
      {m.dept && <span className="text-ink-4"> · {m.dept}</span>}
      <span className="text-ink-4"> · {m.time}</span>
    </button>
  )
}

function TextBubble({ m, grouped }: { m: ChatMessage; grouped: boolean }) {
  const navigate = useNavigate()
  return (
    <div className={cn('flex gap-2', m.isYou ? 'flex-row-reverse' : '')}>
      {!m.isYou && (
        grouped
          ? <div className="w-7 flex-shrink-0" />
          : <UserAvatar m={m} onClick={() => navigate(`/u/${m.userId}`)} />
      )}
      <div className={cn('max-w-[78%] md:max-w-[65%] flex flex-col gap-0.5', m.isYou ? 'items-end' : 'items-start')}>
        {!m.isYou && !grouped && <MsgHeader m={m} navigate={navigate} />}
        <div className={cn(
          'px-3 py-2 text-[13px] leading-snug break-words whitespace-pre-wrap',
          m.isYou
            ? 'bg-yellow text-ink rounded-[14px_4px_14px_14px]'
            : 'bg-paper-deep text-ink rounded-[4px_14px_14px_14px]',
        )}>
          {m.text}
        </div>
        {m.isYou && <span className="font-mono text-[9px] text-ink-4">{m.time}</span>}
      </div>
      {m.isYou && <div className="w-7 flex-shrink-0" />}
    </div>
  )
}

function GifBubble({ m, grouped }: { m: ChatMessage; grouped: boolean }) {
  const navigate = useNavigate()
  return (
    <div className={cn('flex gap-2', m.isYou ? 'flex-row-reverse' : '')}>
      {!m.isYou && (
        grouped
          ? <div className="w-7 flex-shrink-0" />
          : <UserAvatar m={m} onClick={() => navigate(`/u/${m.userId}`)} />
      )}
      <div className={cn('max-w-[60%] flex flex-col gap-0.5', m.isYou ? 'items-end' : 'items-start')}>
        {!m.isYou && !grouped && <MsgHeader m={m} navigate={navigate} />}
        <div className={cn('overflow-hidden', m.isYou ? 'rounded-[14px_4px_14px_14px]' : 'rounded-[4px_14px_14px_14px]')}>
          <img src={m.gifUrl} alt="GIF" className="max-w-full max-h-52 object-contain block" loading="lazy" />
        </div>
        {m.isYou && <span className="font-mono text-[9px] text-ink-4">{m.time}</span>}
      </div>
      {m.isYou && <div className="w-7 flex-shrink-0" />}
    </div>
  )
}

function PollBubble({ m, userId, onVote }: { m: ChatMessage; userId?: string; onVote: (optId: string) => void }) {
  const navigate = useNavigate()
  const poll      = m.poll!
  const myVote    = userId ? poll.votes[userId] : null
  const hasVoted  = !!myVote
  const total     = Object.keys(poll.votes).length

  return (
    <div className="flex gap-2">
      <UserAvatar m={m} onClick={() => navigate(`/u/${m.userId}`)} />
      <div className="flex-1 max-w-sm">
        <MsgHeader m={m} navigate={navigate} />
        <div className="border-2 border-ink bg-paper p-4">
          <p className="font-display text-[14px] leading-tight mb-4">{poll.question}</p>
          <div className="space-y-2">
            {poll.options.map(opt => {
              const count     = Object.values(poll.votes).filter(v => v === opt.id).length
              const pct       = total > 0 ? Math.round((count / total) * 100) : 0
              const isMyPick  = myVote === opt.id
              return (
                <button key={opt.id}
                  onClick={() => !hasVoted && onVote(opt.id)}
                  disabled={hasVoted && !isMyPick}
                  className={cn(
                    'w-full text-left relative overflow-hidden border transition-colors',
                    isMyPick ? 'border-ink' : 'border-hairline',
                    !hasVoted && 'hover:border-line cursor-pointer',
                  )}
                >
                  <div
                    className={cn('absolute inset-0 transition-all duration-700', isMyPick ? 'bg-yellow/50' : 'bg-paper-deep/70')}
                    style={{ width: hasVoted ? `${pct}%` : '0%' }}
                  />
                  <div className="relative flex items-center justify-between px-3 py-2.5">
                    <span className={cn('font-sans text-[12px]', isMyPick ? 'font-bold' : 'text-ink-2')}>
                      {isMyPick && '✓ '}{opt.text}
                    </span>
                    {hasVoted && <span className="font-mono text-[10px] text-ink-3 ml-2 flex-shrink-0">{pct}%</span>}
                  </div>
                </button>
              )
            })}
          </div>
          <p className="font-mono text-[10px] text-ink-4 mt-3">
            {total} {total === 1 ? 'voto' : 'votos'}
            {!hasVoted && ' · toque para votar'}
          </p>
        </div>
      </div>
    </div>
  )
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-hairline" />
      <span className="font-mono text-[9px] text-ink-4 tracking-eyebrow">{label}</span>
      <div className="flex-1 h-px bg-hairline" />
    </div>
  )
}

function dayLabel(iso: string): string {
  const d      = new Date(iso)
  const today  = new Date()
  const yest   = new Date(today); yest.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'HOJE'
  if (d.toDateString() === yest.toDateString())  return 'ONTEM'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()
}

// ─── Chat Input ───────────────────────────────────────────────────────────────

const MAX_CHARS = 1000

function ChatInput({
  onSend, onGifToggle, gifActive,
}: {
  onSend: (text: string) => void
  onGifToggle: () => void
  gifActive: boolean
}) {
  const [text, setText] = useState(() => {
    try { return localStorage.getItem(DRAFT_KEY) ?? '' } catch { return '' }
  })

  const handleChange = (v: string) => {
    if (v.length > MAX_CHARS) return
    setText(v)
    try { localStorage.setItem(DRAFT_KEY, v) } catch { /* ok */ }
  }

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ok */ }
  }

  return (
    <div className="border-t border-hairline bg-paper flex-shrink-0">
      <div className="flex items-end gap-2 px-3 py-2.5">
        <button
          onClick={onGifToggle}
          className={cn(
            'flex-shrink-0 font-mono text-[10px] font-bold px-2.5 py-2 border transition-colors mb-0.5',
            gifActive ? 'bg-ink text-paper border-ink' : 'border-hairline text-ink-3 hover:border-ink hover:text-ink',
          )}
          title="Enviar GIF"
        >
          GIF
        </button>
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            rows={1}
            placeholder="manda a sua..."
            className="w-full max-h-28 resize-none bg-transparent font-sans text-[14px] leading-5 outline-none placeholder:text-ink-4 py-1.5"
            style={{ overflowY: text.includes('\n') || text.length > 80 ? 'auto' : 'hidden' }}
          />
          {text.length > MAX_CHARS * 0.8 && (
            <span className={cn(
              'absolute bottom-0.5 right-1 font-mono text-[9px]',
              text.length > MAX_CHARS * 0.95 ? 'text-red' : 'text-ink-4',
            )}>
              {MAX_CHARS - text.length}
            </span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="btn-yellow px-3 py-2 text-[11px] disabled:opacity-30 flex-shrink-0 mb-0.5 tracking-eyebrow font-bold"
        >
          ENVIAR
        </button>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ResenhaScreen() {
  const { messages, pinnedId, isLoaded, lastError, addMessage, clearError, setPinned, voteOnPoll, deleteMessage } =
    useChatStore()
  const { user }   = useAuthStore()
  const isAdmin    = user?.isAdmin ?? false
  const isDesktop  = useIsDesktop()

  const [gifOpen,   setGifOpen]   = useState(false)
  const [pollOpen,  setPollOpen]  = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [atBottom,  setAtBottom]  = useState(true)

  const scrollRef        = useRef<HTMLDivElement>(null)
  const bottomRef        = useRef<HTMLDivElement>(null)
  const didInitScrollRef = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    const el = scrollRef.current
    if (!el) return
    if (!didInitScrollRef.current) {
      // instant jump on first render — avoids the "scroll from middle" bug on re-navigation
      el.scrollTop = el.scrollHeight
      didInitScrollRef.current = true
      setAtBottom(true)
      return
    }
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, atBottom, isLoaded])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    setAtBottom(nearBottom)
  }, [])

  const me = user

  const buildMsg = useCallback(
    (overrides: Partial<ChatMessage>): ChatMessage => ({
      id:        crypto.randomUUID(),
      userId:    me?.id ?? 'me',
      channelId: 'geral',
      who:       me ? `${me.firstName} ${me.lastName}` : 'Você',
      dept:      me?.dept ?? '',
      initials:  me?.initials ?? 'EU',
      color:     me?.color ?? '#00A651',
      avatarUrl: me?.avatarUrl,
      time:      new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text:      '',
      type:      'text',
      isYou:     true,
      createdAt: new Date().toISOString(),
      ...overrides,
    }),
    [me],
  )

  const sendText = useCallback((text: string) => addMessage(buildMsg({ text, type: 'text' })), [addMessage, buildMsg])
  const sendGif  = useCallback((gifUrl: string) => { addMessage(buildMsg({ type: 'gif', gifUrl })); setGifOpen(false) }, [addMessage, buildMsg])
  const sendPoll = useCallback((poll: ChatPoll) => { setPollOpen(false); addMessage(buildMsg({ text: poll.question, type: 'poll', poll, isYou: false })) }, [addMessage, buildMsg])

  const togglePin = useCallback((id: string) => void setPinned(pinnedId === id ? null : id), [setPinned, pinnedId])
  const vote      = useCallback((msgId: string, optId: string) => void voteOnPoll(msgId, me?.id ?? 'me', optId), [me, voteOnPoll])

  const pinnedMsg     = pinnedId ? messages.find(m => m.id === pinnedId) : null
  const pinnedPreview = pinnedMsg
    ? pinnedMsg.type === 'gif' ? '🖼 GIF'
    : pinnedMsg.type === 'poll' ? `📊 ${pinnedMsg.poll?.question ?? ''}`
    : pinnedMsg.text
    : null

  // Enrich messages with grouping + date separators
  const enriched = useMemo(() => {
    type EnrichedItem =
      | { kind: 'date'; label: string; key: string }
      | { kind: 'msg'; msg: ChatMessage; grouped: boolean }

    const items: EnrichedItem[] = []
    let lastDay  = ''
    let lastUser = ''

    for (const m of messages) {
      const day = new Date(m.createdAt).toDateString()
      if (day !== lastDay) {
        items.push({ kind: 'date', label: dayLabel(m.createdAt), key: `sep-${m.createdAt}` })
        lastDay  = day
        lastUser = ''
      }
      const grouped = m.userId === lastUser && m.type !== 'poll'
      items.push({ kind: 'msg', msg: m, grouped })
      lastUser = m.userId
    }
    return items
  }, [messages])

  return (
    <div
      className="flex flex-col bg-paper overflow-hidden"
      style={{
        height: isDesktop
          ? 'calc(100dvh - 5.75rem)'
          : 'calc(100dvh - 5.5rem - env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-hairline px-4 py-3 flex items-center justify-between flex-shrink-0 bg-paper">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl">#RESENHA</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse-live" />
            <span className="font-mono text-[10px] text-ink-3">AO VIVO</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <span className="font-mono text-[10px] text-ink-4">{messages.length} msgs</span>
          )}
          {isAdmin && (
            <button
              onClick={() => setPollOpen(true)}
              className="font-mono text-[10px] font-bold px-3 py-1.5 bg-ink text-paper hover:bg-ink-2 transition-colors"
            >
              + ENQUETE
            </button>
          )}
        </div>
      </div>

      {/* ── Pinned ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {pinnedMsg && (
          <motion.div
            key="pinned"
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="border-b border-yellow/40 bg-yellow/8 px-4 py-2 flex items-center gap-2">
              <span className="font-mono text-[8px] text-ink-4 flex-shrink-0">📌</span>
              <p className="flex-1 font-sans text-[12px] text-ink-2 truncate min-w-0">
                <span className="font-bold text-ink">{pinnedMsg.who}: </span>
                {pinnedPreview}
              </p>
              {isAdmin && (
                <button onClick={() => setPinned(null)} className="font-mono text-[9px] text-ink-4 hover:text-ink flex-shrink-0 ml-2">
                  DESAFIXAR
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-1 min-h-0"
      >
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="flex flex-col gap-3 py-4">
            {[70, 50, 85, 60].map(w => (
              <div key={w} className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-hairline flex-shrink-0" />
                <div className="h-9 rounded-[4px_14px_14px_14px] bg-hairline" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {isLoaded && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
            <span className="font-display text-6xl text-ink-4">○</span>
            <div>
              <div className="font-display text-2xl text-ink">NINGUÉM<br/>FALOU NADA.</div>
              <p className="font-mono text-[11px] text-ink-3 mt-2 max-w-[200px] mx-auto leading-relaxed">
                A resenha começa com você.
              </p>
            </div>
          </div>
        )}

        {/* Message list */}
        {enriched.map(item => {
          if (item.kind === 'date') return <DateSeparator key={item.key} label={item.label} />
          const { msg: m, grouped } = item
          return (
            <div
              key={m.id}
              className={cn('relative group', grouped ? 'mt-0.5' : 'mt-3')}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {m.type === 'poll' && m.poll
                ? <PollBubble m={m} userId={me?.id} onVote={optId => vote(m.id, optId)} />
                : m.type === 'gif' && m.gifUrl
                  ? <GifBubble m={m} grouped={grouped} />
                  : <TextBubble m={m} grouped={grouped} />
              }

              {/* Action buttons (admin: all messages; user: own messages) */}
              {(isAdmin || m.isYou) && hoveredId === m.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn('absolute -top-2 flex gap-1 z-10', m.isYou ? 'left-0' : 'right-0')}
                >
                  {isAdmin && m.type !== 'poll' && (
                    <button
                      onClick={() => togglePin(m.id)}
                      className={cn(
                        'font-mono text-[9px] px-2 py-1 border',
                        pinnedId === m.id
                          ? 'bg-yellow border-ink text-ink'
                          : 'bg-paper border-hairline text-ink-3 hover:border-ink hover:text-ink',
                      )}
                    >
                      {pinnedId === m.id ? 'DESAFIXAR' : 'FIXAR'}
                    </button>
                  )}
                  <button
                    onClick={() => { if (window.confirm('Apagar esta mensagem?')) void deleteMessage(m.id) }}
                    className="font-mono text-[9px] px-2 py-1 border bg-paper border-hairline text-red/60 hover:border-red hover:text-red"
                  >
                    APAGAR
                  </button>
                </motion.div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Scroll to bottom button ─────────────────────────────────────── */}
      <AnimatePresence>
        {!atBottom && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20"
          >
            <button
              onClick={() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setAtBottom(true) }}
              className="bg-ink text-paper font-mono text-[10px] px-3 py-1.5 border border-ink shadow-card"
            >
              ↓ VER NOVAS MSGS
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {lastError && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-red/8 border-t border-red/20">
              <span className="font-mono text-[10px] text-red">{lastError}</span>
              <button onClick={clearError} className="font-mono text-[10px] text-red/60 hover:text-red ml-3">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GIF Picker ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {gifOpen && <GifPicker onSelect={sendGif} onClose={() => setGifOpen(false)} />}
      </AnimatePresence>

      {/* ── Input ──────────────────────────────────────────────────────── */}
      <ChatInput onSend={sendText} onGifToggle={() => setGifOpen(v => !v)} gifActive={gifOpen} />

      {/* ── Poll Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {pollOpen && <PollModal onCreate={sendPoll} onClose={() => setPollOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
