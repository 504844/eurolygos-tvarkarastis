/*
  # Add Betting Odds to Games Table

  ## Overview
  Adds betting odds columns to the games table to display KOFAS betting information
  for home and away teams.

  ## Changes
  
  ### Modified Tables
  
  - `games`
    - Added `home_odds` (numeric) - Betting odds for home team (e.g., 3.4)
    - Added `away_odds` (numeric) - Betting odds for away team (e.g., 1.2)
    - Both columns are nullable and default to NULL

  ## Notes
  - Odds are stored as decimal numbers for precision
  - NULL values indicate no betting information available
  - Odds can be updated independently for each game
*/

-- Add betting odds columns to games table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'home_odds'
  ) THEN
    ALTER TABLE games ADD COLUMN home_odds numeric(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'away_odds'
  ) THEN
    ALTER TABLE games ADD COLUMN away_odds numeric(5,2);
  END IF;
END $$;
