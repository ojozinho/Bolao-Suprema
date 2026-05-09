import { useState, useRef, useEffect } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { Stamp } from '@/components/shared/Stamp'
import { useIsDesktop } from '@/hooks/useBreakpoint'
import { MOCK_CHAT } from '@/data/mock'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'

const CHANNELS = [
  { id: 'geral', label: '#geral', unread: 12 },
  { id: 'bra', label: '#bra' },
  { id: 'por-x-uru', label: '#por-x-uru', unread: 4 },
  { id: 'zueira', label: '#zueira', unread: 2 },
  { id: 'analise', label: '#analise' },
]

const PROVOCACOES = [
  { text: 'O Brasil vai ser eliminado nas quartas e todo mundo sabe.', author: 'Rafael T.', count: 8 },
  { text: 'A Argentina não tem time sem Messi. Vocês vivem de passado.', author: 'Camila R.', count: 5 },
  { text: 'Holanda vai chegar na final. Apostem contra se tiverem coragem.', author: 'Ana L.', count: 3 },
]

export function ResenhaScreen() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <ResenhaDesktop /> : <ResenhaMobile />
}

// ─── Bubble ───────────────────────────────────────────────────────────────────

function ChatBubble({ m }: { m: ChatMessage }) {
  return (
    <div className={cn('flex gap-2', m.isYou ? 'flex-row-reverse' : '')}>
      <Avatar initials={m.initials} color={m.color} size={28} className="flex-shrink-0 mt-1" />
      <div className={cn('max-w-[75%]', m.isYou ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
        {!m.isYou && (
          <span className="font-mono text-[10px] text-ink-3">{m.who} · {m.dept} · {m.time}</span>
        )}
        <div
          className={cn(
            'px-3 py-2 text-[13px] leading-snug',
            m.isYou
              ? 'bg-yellow text-ink rounded-[14px_4px_14px_14px]'
              : 'bg-paper-deep text-ink rounded-[4px_14px_14px_14px]'
          )}
        >
          {m.text}
        </div>
        {m.reaction && (
          <div className="flex items-center gap-1 border border-hairline px-2 py-0.5 rounded-full text-[12px]">
            <span>{m.reaction}</span>
            <span className="font-mono text-[10px] text-ink-3">12</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Input area ───────────────────────────────────────────────────────────────

function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  const handle = () => { if (text.trim()) { onSend(text); setText('') } }
  return (
    <div className="flex items-center gap-2 border-t border-hairline px-3 py-2 bg-paper">
      <button className="text-xl flex-shrink-0">⚽</button>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handle()}
        placeholder="manda a sua..."
        className="flex-1 bg-transparent font-sans text-[14px] outline-none placeholder:text-ink-4"
      />
      <button onClick={handle} disabled={!text.trim()}
        className="btn-yellow px-3 py-1.5 text-[11px] disabled:opacity-40">
        ENVIAR
      </button>
    </div>
  )
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function ResenhaMobile() {
  const [messages, setMessages] = useState(MOCK_CHAT)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = (text: string) => {
    setMessages(prev => [...prev, {
      id: `c-${Date.now()}`, userId: 'me', channelId: 'geral',
      who: 'Felipe S.', dept: 'Design', initials: 'FS', color: '#00A651',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text, isYou: true, createdAt: new Date().toISOString(),
    }])
  }

  return (
    <div className="min-h-dvh flex flex-col bg-paper pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-paper border-b border-line px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl">#RESENHA</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse-live" />
              <span className="font-mono text-[10px] text-ink-3">87 ONLINE</span>
            </span>
          </div>
          <span className="font-mono text-[10px] text-ink-3">412 MSGS</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(m => <ChatBubble key={m.id} m={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Provocação card */}
      <div className="mx-4 mb-3 border-2 border-dashed border-ink p-3 relative">
        <Stamp color="#00A651" rotation={-1} className="mb-2">provocação oficial</Stamp>
        <p className="font-serif-it text-ink-2 text-[14px] leading-snug mt-2">
          "O Brasil vai ser eliminado nas quartas e todo mundo sabe."
        </p>
        <p className="font-mono text-[10px] text-ink-3 mt-1">— Rafael T.</p>
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  )
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function ResenhaDesktop() {
  const [activeChannel, setActiveChannel] = useState('geral')
  const [messages, setMessages] = useState(MOCK_CHAT)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = (text: string) => {
    setMessages(prev => [...prev, {
      id: `c-${Date.now()}`, userId: 'me', channelId: activeChannel,
      who: 'Felipe Souza', dept: 'Design', initials: 'FS', color: '#00A651',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text, isYou: true, createdAt: new Date().toISOString(),
    }])
  }

  return (
    <div className="h-[calc(100dvh-56px)] flex bg-paper overflow-hidden">
      {/* Left sidebar — channels */}
      <div className="w-64 flex-shrink-0 border-r border-line flex flex-col bg-paper-deep">
        <div className="px-4 py-4 border-b border-hairline">
          <p className="font-mono text-[10px] tracking-eyebrow text-ink-3">CANAIS</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
              className={cn('w-full flex items-center justify-between px-4 py-2 text-left transition-colors',
                activeChannel === ch.id ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-hairline')}>
              <span className="font-mono text-[12px] font-bold">{ch.label}</span>
              {ch.unread && (
                <span className={cn('font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  activeChannel === ch.id ? 'bg-yellow text-ink' : 'bg-red text-paper')}>
                  {ch.unread}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="px-4 py-4 border-t border-hairline">
          <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-2">ONLINE AGORA</p>
          <div className="flex flex-wrap gap-1">
            {MOCK_CHAT.slice(0, 6).map(m => (
              <Avatar key={m.userId} initials={m.initials} color={m.color} size={24} />
            ))}
            <div className="w-6 h-6 rounded-full bg-paper-deep border border-hairline flex items-center justify-center">
              <span className="font-mono text-[8px] text-ink-4">+81</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-line flex items-center gap-2">
          <span className="font-display text-xl">GERAL · BAR DA FIRMA</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse-live" />
            <span className="font-mono text-[10px] text-ink-3">87 online</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map(m => <ChatBubble key={m.id} m={m} />)}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={handleSend} />
      </div>

      {/* Right — provocações */}
      <div className="w-80 flex-shrink-0 border-l border-line bg-paper-deep overflow-y-auto">
        <div className="px-4 py-4 border-b border-hairline">
          <p className="font-mono text-[10px] tracking-eyebrow text-ink-3">PROVOCAÇÕES OFICIAIS</p>
        </div>
        <div className="p-4 space-y-4">
          {PROVOCACOES.map((p, i) => (
            <div
              key={i}
              className="border-2 border-ink p-4 bg-paper shadow-card"
              style={{ transform: `rotate(${i % 2 === 0 ? '-1' : '1'}deg)` }}
            >
              <Stamp color="#00A651" rotation={-2} className="mb-3">provocação</Stamp>
              <p className="font-serif-it text-ink text-[15px] leading-snug mt-2">"{p.text}"</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-[10px] text-ink-3">— {p.author}</span>
                <span className="font-mono text-[10px] font-bold text-ink-4">{p.count} reações</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
