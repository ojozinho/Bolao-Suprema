interface TourneyMarkProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'text-[9px]', md: 'text-[11px]', lg: 'text-[13px]' }

export function TourneyMark({ size = 'md', className }: TourneyMarkProps) {
  return (
    <span
      className={`font-mono font-bold tracking-eyebrow uppercase text-ink-3 ${sizes[size]} ${className ?? ''}`}
    >
      ★ MUNDIAL · 2 0 2 6 · CO/MX/US ★
    </span>
  )
}
