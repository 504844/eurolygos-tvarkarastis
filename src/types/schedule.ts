export interface Game {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeLogo?: string;
  awayLogo?: string;
  homeOdds?: number;
  awayOdds?: number;
}

export interface ScheduleData {
  games: Game[];
  currentPage: number;
  totalPages: number;
}

export interface GroupedGames {
  [date: string]: Game[];
}
