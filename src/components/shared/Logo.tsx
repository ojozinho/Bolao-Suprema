import { asset } from '@/lib/utils'

interface LogoProps {
  height?: number
  className?: string
}

export function Logo({ height = 40, className }: LogoProps) {
  return (
    <img
      src={asset('assets/logo-bolao.png')}
      alt="Bolão da Suprema"
      height={height}
      style={{ height, width: 'auto' }}
      className={className}
    />
  )
}
