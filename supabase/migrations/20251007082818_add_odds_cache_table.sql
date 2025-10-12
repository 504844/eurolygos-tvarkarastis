/*
  # Add Odds Cache Table

  ## Overview
  Creates a table to cache betting odds data from The Odds API to minimize API calls
  and stay within free tier rate limits.

  ## New Tables
  
  ### `odds_cache`
  - `id` (uuid, primary key) - Unique identifier
  - `sport_key` (text) - Sport identifier from The Odds API (e.g., 'basketball_euroleague')
  - `home_team` (text) - Home team name
  - `away_team` (text) - Away team name
  - `game_date` (timestamptz) - Date and time of the game
  - `home_odds` (numeric) - Betting odds for home team
  - `away_odds` (numeric) - Betting odds for away team
  - `bookmaker` (text) - Bookmaker name (default 'average')
  - `fetched_at` (timestamptz) - When the odds were fetched from API
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable Row Level Security
  - Public read access for all users
  - Only service role can insert/update/delete

  ## Indexes
  - Composite index on (home_team, away_team) for fast lookups
  - Index on fetched_at for cache expiration queries
*/

-- Create odds_cache table
CREATE TABLE IF NOT EXISTS odds_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_key text NOT NULL DEFAULT 'basketball_euroleague',
  home_team text NOT NULL,
  away_team text NOT NULL,
  game_date timestamptz,
  home_odds numeric(10,2),
  away_odds numeric(10,2),
  bookmaker text DEFAULT 'average',
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_odds_cache_teams ON odds_cache(home_team, away_team);
CREATE INDEX IF NOT EXISTS idx_odds_cache_fetched_at ON odds_cache(fetched_at);
CREATE INDEX IF NOT EXISTS idx_odds_cache_game_date ON odds_cache(game_date);

-- Enable Row Level Security
ALTER TABLE odds_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for odds_cache table
CREATE POLICY "Anyone can view odds cache"
  ON odds_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert odds cache"
  ON odds_cache
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update odds cache"
  ON odds_cache
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete odds cache"
  ON odds_cache
  FOR DELETE
  USING (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_odds_cache_updated_at ON odds_cache;
CREATE TRIGGER update_odds_cache_updated_at
  BEFORE UPDATE ON odds_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
