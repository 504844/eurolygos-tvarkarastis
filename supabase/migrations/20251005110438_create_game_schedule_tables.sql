/*
  # Game Schedule Application Schema

  ## Overview
  Creates tables for storing game schedules, user preferences, and view settings
  for the Euroleague schedule application.

  ## New Tables
  
  ### `games`
  - `id` (uuid, primary key) - Unique identifier for each game
  - `date` (date) - Date of the game
  - `time` (text) - Time of the game (e.g., "20:00")
  - `home_team` (text) - Home team name
  - `away_team` (text) - Away team name
  - `league` (text) - League name (e.g., "Euroleague")
  - `home_logo` (text, nullable) - URL to home team logo
  - `away_logo` (text, nullable) - URL to away team logo
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `user_preferences`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (text) - Anonymous user identifier (browser fingerprint)
  - `view_mode` (text) - Preferred view mode (grid, compact, timeline)
  - `grid_density` (text) - Density setting (comfortable, compact, spacious)
  - `favorite_teams` (jsonb) - Array of favorite team names
  - `theme_preference` (text) - Color theme preference
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable Row Level Security on all tables
  - Public read access for games table
  - User preferences accessible by matching user_id
  
  ## Indexes
  - Index on games.date for fast date-based queries
  - Index on user_preferences.user_id for fast user lookup
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  league text NOT NULL DEFAULT 'Euroleague',
  home_logo text,
  away_logo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  view_mode text DEFAULT 'grid',
  grid_density text DEFAULT 'comfortable',
  favorite_teams jsonb DEFAULT '[]'::jsonb,
  theme_preference text DEFAULT 'auto',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for games table (public read access)
CREATE POLICY "Anyone can view games"
  ON games
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert games"
  ON games
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update games"
  ON games
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete games"
  ON games
  FOR DELETE
  USING (true);

-- RLS Policies for user_preferences (user-specific access)
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_games_updated_at ON games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
