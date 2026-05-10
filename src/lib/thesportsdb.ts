const BASE = 'https://www.thesportsdb.com/api/v1/json/123'

export interface PlayerResult {
  idPlayer:      string
  strPlayer:     string
  strTeam:       string
  strNationality: string
  strPosition:   string
  strThumb:      string | null
  strCutout:     string | null
}

export async function searchPlayers(query: string): Promise<PlayerResult[]> {
  if (!query.trim()) return []
  try {
    const res = await fetch(`${BASE}/searchplayers.php?p=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    const data = await res.json() as { player: PlayerResult[] | null }
    return (data.player ?? []).filter(p => p.strSport === 'Soccer' || !p.strSport).slice(0, 8)
  } catch {
    return []
  }
}
