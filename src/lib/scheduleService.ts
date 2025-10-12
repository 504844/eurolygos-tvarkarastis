import { supabase } from './supabase';
import { Game, ScheduleData } from '../types/schedule';
import { fetchSchedule as fetchScheduleFromScraper } from './scheduleApi';

const SCHEDULE_CACHE_DURATION = 6 * 60 * 60 * 1000;

interface CacheMetadata {
  lastFetched: string;
  totalGames: number;
}

async function getCacheMetadata(): Promise<CacheMetadata | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true });

    return {
      lastFetched: data.created_at,
      totalGames: count || 0,
    };
  } catch (error) {
    console.error('Error fetching cache metadata:', error);
    return null;
  }
}

async function shouldRefreshCache(): Promise<boolean> {
  const metadata = await getCacheMetadata();

  if (!metadata || metadata.totalGames === 0) {
    return true;
  }

  const lastFetchedTime = new Date(metadata.lastFetched).getTime();
  const now = Date.now();

  return now - lastFetchedTime > SCHEDULE_CACHE_DURATION;
}

async function storeGamesInDatabase(games: Game[]): Promise<void> {
  try {
    const uniqueGames = new Map<string, Game>();

    games.forEach((game) => {
      const key = `${game.date}|${game.time}|${game.homeTeam}|${game.awayTeam}`;
      if (!uniqueGames.has(key)) {
        uniqueGames.set(key, game);
      }
    });

    const deduplicatedGames = Array.from(uniqueGames.values());
    console.log(`Deduplicated ${games.length} games to ${deduplicatedGames.length} unique games`);

    await supabase.from('games').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const gamesToInsert = deduplicatedGames.map((game) => ({
      date: game.date,
      time: game.time,
      home_team: game.homeTeam,
      away_team: game.awayTeam,
      league: game.league,
      home_logo: game.homeLogo,
      away_logo: game.awayLogo,
      home_odds: game.homeOdds,
      away_odds: game.awayOdds,
    }));

    const batchSize = 100;
    for (let i = 0; i < gamesToInsert.length; i += batchSize) {
      const batch = gamesToInsert.slice(i, i + batchSize);
      const { error } = await supabase.from('games').insert(batch);

      if (error) {
        console.error('Error inserting batch:', error);
      }
    }

    console.log(`Successfully stored ${deduplicatedGames.length} games in database`);
  } catch (error) {
    console.error('Error storing games in database:', error);
    throw error;
  }
}

async function fetchGamesFromDatabase(): Promise<Game[]> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      console.error('Error fetching games from database:', error);
      return [];
    }

    const uniqueGames = new Map<string, Game>();

    data.forEach((row) => {
      const game: Game = {
        date: row.date,
        time: row.time,
        homeTeam: row.home_team,
        awayTeam: row.away_team,
        league: row.league,
        homeLogo: row.home_logo,
        awayLogo: row.away_logo,
        homeOdds: row.home_odds ? Number(row.home_odds) : undefined,
        awayOdds: row.away_odds ? Number(row.away_odds) : undefined,
      };

      const key = `${game.date}|${game.time}|${game.homeTeam}|${game.awayTeam}`;
      if (!uniqueGames.has(key)) {
        uniqueGames.set(key, game);
      }
    });

    const deduplicatedGames = Array.from(uniqueGames.values());

    if (deduplicatedGames.length < data.length) {
      console.log(`Filtered ${data.length} database games to ${deduplicatedGames.length} unique games`);
    }

    return deduplicatedGames;
  } catch (error) {
    console.error('Error in fetchGamesFromDatabase:', error);
    return [];
  }
}

export async function fetchSchedule(
  forceRefresh: boolean = false
): Promise<ScheduleData> {
  try {
    const needsRefresh = forceRefresh || (await shouldRefreshCache());

    if (needsRefresh) {
      console.log('Fetching fresh schedule data from scraper...');
      const scrapedData = await fetchScheduleFromScraper(1, true);

      if (scrapedData.games.length > 0) {
        await storeGamesInDatabase(scrapedData.games);
      }

      return {
        games: scrapedData.games,
        currentPage: 1,
        totalPages: 1,
      };
    }

    console.log('Fetching schedule data from database cache...');
    const cachedGames = await fetchGamesFromDatabase();

    if (cachedGames.length === 0) {
      console.log('No cached data, falling back to scraper...');
      const scrapedData = await fetchScheduleFromScraper(1, true);

      if (scrapedData.games.length > 0) {
        await storeGamesInDatabase(scrapedData.games);
      }

      return {
        games: scrapedData.games,
        currentPage: 1,
        totalPages: 1,
      };
    }

    return {
      games: cachedGames,
      currentPage: 1,
      totalPages: 1,
    };
  } catch (error) {
    console.error('Error in fetchSchedule:', error);
    throw error;
  }
}

export async function updateGameOdds(
  homeTeam: string,
  awayTeam: string,
  homeOdds: number,
  awayOdds: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('games')
      .update({
        home_odds: homeOdds,
        away_odds: awayOdds,
      })
      .eq('home_team', homeTeam)
      .eq('away_team', awayTeam);

    if (error) {
      console.error('Error updating game odds:', error);
    }
  } catch (error) {
    console.error('Error in updateGameOdds:', error);
  }
}
