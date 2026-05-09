import { cn } from '@/lib/utils'

interface AvatarProps {
  initials: string
  color?: string
  size?: number
  className?: string
}

export function Avatar({ initials, color = '#0D0D0D', size = 36, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-mono font-bold flex-shrink-0 select-none',
        className
      )}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.35,
        color: '#fff',
        letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </div>
  )
}
