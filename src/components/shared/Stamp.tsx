import { cn } from '@/lib/utils'

interface StampProps {
  color?: string
  rotation?: number
  children: React.ReactNode
  className?: string
}

export function Stamp({ color = '#0D0D0D', rotation = -2, children, className }: StampProps) {
  return (
    <span
      className={cn(
        'inline-flex px-2 py-1 border-2 font-mono text-[10px] font-bold tracking-eyebrow uppercase',
        className
      )}
      style={{
        borderColor: color,
        color,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {children}
    </span>
  )
}
