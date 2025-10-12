import { supabase } from './supabase';

const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface BettingOdds {
  homeOdds: number;
  awayOdds: number;
}

function normalizeTeamName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function teamsMatch(team1: string, team2: string): boolean {
  const normalized1 = normalizeTeamName(team1);
  const normalized2 = normalizeTeamName(team2);

  if (normalized1 === normalized2) return true;
  if (normalized1.includes(normalized2)) return true;
  if (normalized2.includes(normalized1)) return true;

  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word) && word.length > 3);

  return commonWords.length >= 2;
}

async function getCachedOdds(
  homeTeam: string,
  awayTeam: string
): Promise<BettingOdds | null> {
  try {
    const cacheExpiry = new Date(Date.now() - CACHE_DURATION);

    const { data: allCachedGames, error } = await supabase
      .from('odds_cache')
      .select('home_team, away_team, home_odds, away_odds, fetched_at')
      .gte('fetched_at', cacheExpiry.toISOString())
      .order('fetched_at', { ascending: false });

    if (error) {
      console.error('Error fetching cached odds:', error);
      return null;
    }

    if (!allCachedGames || allCachedGames.length === 0) {
      return null;
    }

    const matchingGame = allCachedGames.find(
      game => teamsMatch(game.home_team, homeTeam) && teamsMatch(game.away_team, awayTeam)
    );

    if (matchingGame) {
      console.log(`✓ Matched "${homeTeam}" with "${matchingGame.home_team}" and "${awayTeam}" with "${matchingGame.away_team}"`);
      return {
        homeOdds: Number(matchingGame.home_odds),
        awayOdds: Number(matchingGame.away_odds),
      };
    }

    console.log(`✗ No match found for "${homeTeam}" vs "${awayTeam}"`);
    return null;
  } catch (error) {
    console.error('Error in getCachedOdds:', error);
    return null;
  }
}

async function shouldRefreshOddsCache(): Promise<boolean> {
  try {
    const cacheExpiry = new Date(Date.now() - CACHE_DURATION);

    const { data, error } = await supabase
      .from('odds_cache')
      .select('fetched_at')
      .gte('fetched_at', cacheExpiry.toISOString())
      .limit(1)
      .maybeSingle();

    if (error) {
      return true;
    }

    return !data;
  } catch (error) {
    console.error('Error checking cache:', error);
    return true;
  }
}

async function refreshAllOdds(): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/fetch-betting-odds?refreshAll=true`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to refresh odds:', response.statusText);
    } else {
      console.log('Successfully refreshed all odds');
    }
  } catch (error) {
    console.error('Error refreshing odds:', error);
  }
}

export async function fetchBettingOdds(
  homeTeam: string,
  awayTeam: string
): Promise<BettingOdds | null> {
  try {
    const cached = await getCachedOdds(homeTeam, awayTeam);
    return cached;
  } catch (error) {
    console.error('Error in fetchBettingOdds:', error);
    return null;
  }
}

export async function fetchBettingOddsForGames(
  games: Array<{ homeTeam: string; awayTeam: string }>
): Promise<Map<string, BettingOdds>> {
  const oddsMap = new Map<string, BettingOdds>();

  const needsRefresh = await shouldRefreshOddsCache();

  if (needsRefresh) {
    console.log('Odds cache is stale, refreshing all odds...');
    await refreshAllOdds();

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

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
