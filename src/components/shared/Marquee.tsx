interface MarqueeProps {
  items: string[]
  speed?: number
  color?: string
  bg?: string
  separator?: string
}

export function Marquee({ items, speed = 40, color = '#0D0D0D', bg = 'transparent', separator = '·' }: MarqueeProps) {
  const doubled = [...items, ...items]
  const content = doubled.join(` ${separator} `)

  return (
    <div
      className="overflow-hidden whitespace-nowrap"
      style={{ background: bg }}
    >
      <span
        className="inline-block animate-marquee font-mono text-[11px] font-semibold tracking-eyebrow uppercase"
        style={{
          color,
          animationDuration: `${speed}s`,
        }}
      >
        {content}
      </span>
    </div>
  )
}
