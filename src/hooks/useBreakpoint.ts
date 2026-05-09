import { useState, useEffect } from 'react'

const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const

export function useBreakpoint(bp: keyof typeof BREAKPOINTS): boolean {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINTS[bp] : false
  )

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BREAKPOINTS[bp]}px)`)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    setMatches(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [bp])

  return matches
}

export function useIsDesktop() {
  return useBreakpoint('lg')
}
