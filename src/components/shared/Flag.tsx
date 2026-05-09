import { cn } from '@/lib/utils'
import type { Team } from '@/types'

interface FlagProps {
  team: Team
  size?: number
  ring?: boolean
  className?: string
}

export function Flag({ team, size = 32, ring = false, className }: FlagProps) {
  return (
    <img
      src={team.flag}
      alt={team.name}
      width={size}
      height={size}
      className={cn(
        'object-cover rounded-full flex-shrink-0',
        ring && 'ring-2 ring-white/40',
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}
