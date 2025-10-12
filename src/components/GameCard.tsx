import { Game } from '../types/schedule';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div
      className="
        relative rounded-2xl
        border border-white/10
        bg-gradient-to-b from-white/[0.06] to-white/[0.02]
        shadow-[0_2px_12px_rgba(0,0,0,0.15)]
        backdrop-blur-sm
        px-4 py-3
      "
    >
      <div className="flex items-center justify-between text-white/90">
        {/* Home */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {game.homeLogo && (
            <img
              src={game.homeLogo}
              alt=""
              className="w-6 h-6 object-contain flex-shrink-0 opacity-90"
              loading="lazy"
            />
          )}
          <span className="font-medium text-sm truncate leading-tight tracking-tight">
            {game.homeTeam}
          </span>
        </div>

        {/* Time */}
        <div className="flex-shrink-0 px-2.5 py-0.5 rounded-full 
                        bg-purple-400/10 border border-purple-400/20
                        text-[13px] font-semibold text-purple-200 mx-3">
          {game.time}
        </div>

        {/* Away */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className="font-medium text-sm truncate text-right leading-tight tracking-tight">
            {game.awayTeam}
          </span>
          {game.awayLogo && (
            <img
              src={game.awayLogo}
              alt=""
              className="w-6 h-6 object-contain flex-shrink-0 opacity-90"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
