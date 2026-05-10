const BASE = 'https://www.scorebat.com/video-api/v3'

export interface ScorebatVideo {
  title: string
  competition: string
  thumbnail: string
  matchviewUrl: string
  date: string
  homeTeam: { name: string; slug: string }
  awayTeam: { name: string; slug: string }
  embed: string // first video embed HTML
}

let _cache: ScorebatVideo[] | null = null
let _fetchedAt = 0
const TTL = 10 * 60 * 1000 // 10 min

export async function fetchFeaturedVideos(): Promise<ScorebatVideo[]> {
  if (_cache && Date.now() - _fetchedAt < TTL) return _cache

  try {
    const res = await fetch(`${BASE}/`)
    if (!res.ok) return []
    const raw = await res.json()
    const items: ScorebatVideo[] = (raw as Record<string, unknown>[]).map(item => ({
      title:        String(item.title ?? ''),
      competition:  String(item.competition ?? ''),
      thumbnail:    String(item.thumbnail ?? ''),
      matchviewUrl: String(item.matchviewUrl ?? ''),
      date:         String(item.date ?? ''),
      homeTeam:     (item.homeTeam as { name: string; slug: string }) ?? { name: '', slug: '' },
      awayTeam:     (item.awayTeam as { name: string; slug: string }) ?? { name: '', slug: '' },
      embed: (() => {
        const vids = item.videos as Array<{ embed: string }> | undefined
        return vids?.[0]?.embed ?? ''
      })(),
    })).filter(v => v.thumbnail)

    _cache = items
    _fetchedAt = Date.now()
    return items
  } catch {
    return []
  }
}
