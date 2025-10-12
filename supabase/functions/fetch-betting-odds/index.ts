import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ODDS_API_KEY = Deno.env.get('ODDS_API_KEY');
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

interface OddsApiResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

function normalizeTeamName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function teamsMatch(team1: string, team2: string): boolean {
  const normalized1 = normalizeTeamName(team1);
  const normalized2 = normalizeTeamName(team2);

  return normalized1.includes(normalized2) ||
         normalized2.includes(normalized1) ||
         normalized1 === normalized2;
}

async function getCachedOdds(supabase: any, homeTeam: string, awayTeam: string) {
  const cacheExpiry = new Date(Date.now() - CACHE_DURATION_MS);

  const { data, error } = await supabase
    .from('odds_cache')
    .select('home_odds, away_odds, fetched_at')
    .eq('home_team', homeTeam)
    .eq('away_team', awayTeam)
    .gte('fetched_at', cacheExpiry.toISOString())
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    homeOdds: Number(data.home_odds),
    awayOdds: Number(data.away_odds),
  };
}

async function fetchAndCacheAllOdds(supabase: any): Promise<void> {
  const regions = 'us,eu';
  const markets = 'h2h';
  const oddsFormat = 'decimal';
  const sportKey = 'basketball_euroleague';

  const url = `${ODDS_API_BASE_URL}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to fetch odds from API:', response.statusText);
      return;
    }

    const oddsData: OddsApiResponse[] = await response.json();
    const timestamp = new Date().toISOString();

    const cacheEntries = [];

    for (const game of oddsData) {
      if (!game.bookmakers.length) continue;

      const h2hMarket = game.bookmakers[0].markets.find(
        (market) => market.key === 'h2h'
      );

      if (!h2hMarket || h2hMarket.outcomes.length < 2) continue;

      const homeOutcome = h2hMarket.outcomes.find((outcome) =>
        teamsMatch(outcome.name, game.home_team)
      );
      const awayOutcome = h2hMarket.outcomes.find((outcome) =>
        teamsMatch(outcome.name, game.away_team)
      );

      if (homeOutcome && awayOutcome) {
        cacheEntries.push({
          sport_key: sportKey,
          home_team: game.home_team,
          away_team: game.away_team,
          game_date: game.commence_time,
          home_odds: homeOutcome.price,
          away_odds: awayOutcome.price,
          fetched_at: timestamp,
        });
      }
    }

    if (cacheEntries.length > 0) {
      const { error } = await supabase
        .from('odds_cache')
        .insert(cacheEntries);

      if (error) {
        console.error('Error caching odds:', error);
      } else {
        console.log(`Cached ${cacheEntries.length} games from The Odds API`);
      }
    }
  } catch (error) {
    console.error('Error fetching from The Odds API:', error);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const url = new URL(req.url);
    const homeTeam = url.searchParams.get('homeTeam');
    const awayTeam = url.searchParams.get('awayTeam');
    const refreshAll = url.searchParams.get('refreshAll') === 'true';

    if (refreshAll) {
      await fetchAndCacheAllOdds(supabaseClient);

      return new Response(
        JSON.stringify({ message: 'All odds refreshed successfully' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!homeTeam || !awayTeam) {
      return new Response(
        JSON.stringify({ error: 'Missing homeTeam or awayTeam parameters' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const cachedOdds = await getCachedOdds(supabaseClient, homeTeam, awayTeam);

    if (cachedOdds) {
      return new Response(
        JSON.stringify({
          homeTeam,
          awayTeam,
          homeOdds: cachedOdds.homeOdds,
          awayOdds: cachedOdds.awayOdds,
          timestamp: new Date().toISOString(),
          cached: true,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        homeTeam,
        awayTeam,
        homeOdds: null,
        awayOdds: null,
        message: 'No cached odds available. Use refreshAll=true to fetch new odds.',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});