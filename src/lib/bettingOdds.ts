const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface BettingOdds {
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  timestamp: string;
}

const oddsCache = new Map<string, BettingOdds>();

export async function fetchBettingOdds(
  homeTeam: string,
  awayTeam: string
): Promise<{ homeOdds: number; awayOdds: number } | null> {
  const cacheKey = `${homeTeam}-${awayTeam}`;

  if (oddsCache.has(cacheKey)) {
    const cached = oddsCache.get(cacheKey)!;
    return { homeOdds: cached.homeOdds, awayOdds: cached.awayOdds };
  }

  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/fetch-betting-odds`;
    const params = new URLSearchParams({
      homeTeam,
      awayTeam,
    });

    const response = await fetch(`${apiUrl}?${params}`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch betting odds:', response.statusText);
      return null;
    }

    const data: BettingOdds = await response.json();
    oddsCache.set(cacheKey, data);

    return { homeOdds: data.homeOdds, awayOdds: data.awayOdds };
  } catch (error) {
    console.error('Error fetching betting odds:', error);
    return null;
  }
}

export async function fetchBettingOddsForGames(
  games: Array<{ homeTeam: string; awayTeam: string }>
): Promise<Map<string, { homeOdds: number; awayOdds: number }>> {
  const oddsMap = new Map<string, { homeOdds: number; awayOdds: number }>();

  const promises = games.map(async (game) => {
    const odds = await fetchBettingOdds(game.homeTeam, game.awayTeam);
    if (odds) {
      const key = `${game.homeTeam}-${game.awayTeam}`;
      oddsMap.set(key, odds);
    }
  });

  await Promise.all(promises);
  return oddsMap;
}
