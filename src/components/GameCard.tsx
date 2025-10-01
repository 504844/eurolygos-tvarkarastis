import { Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Game } from '../types/schedule';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{game.time}</span>
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0">
            {game.league}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {game.homeLogo && (
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-card border border-border/50 flex items-center justify-center p-1.5">
                <img
                  src={game.homeLogo}
                  alt={game.homeTeam}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold truncate">{game.homeTeam}</p>
              <p className="text-xs text-muted-foreground">Namai</p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xl font-bold text-muted-foreground">VS</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <div className="flex-1 min-w-0 text-right">
              <p className="text-lg font-semibold truncate">{game.awayTeam}</p>
              <p className="text-xs text-muted-foreground">Svečiai</p>
            </div>
            {game.awayLogo && (
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-card border border-border/50 flex items-center justify-center p-1.5">
                <img
                  src={game.awayLogo}
                  alt={game.awayTeam}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
