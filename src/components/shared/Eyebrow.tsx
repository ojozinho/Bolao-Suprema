interface EyebrowProps {
  children: React.ReactNode
  num?: string
  sub?: string
  className?: string
}

export function Eyebrow({ children, num, sub, className }: EyebrowProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      {num && (
        <span className="font-mono text-[10px] font-bold text-ink-4">{num}</span>
      )}
      <span className="font-mono text-[11px] font-bold tracking-eyebrow uppercase text-ink-3">
        {children}
      </span>
      {sub && (
        <span className="font-mono text-[10px] text-ink-4">{sub}</span>
      )}
    </div>
  )
}
