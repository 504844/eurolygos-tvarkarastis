import { useState, useEffect, useMemo, useRef } from 'react';
import { GroupedGames } from '../types/schedule';
import { formatRelativeDate } from '../lib/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GameCard } from './GameCard';

interface HybridGameGridProps {
  groupedGames: GroupedGames;
  sortedDates: string[];
  onDateIndexChange?: (index: number) => void;
}

export function HybridGameGrid({ groupedGames, sortedDates, onDateIndexChange }: HybridGameGridProps) {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleDatesCount = useMemo(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const visibleDates = useMemo(() => {
    return sortedDates.slice(currentDateIndex, currentDateIndex + visibleDatesCount);
  }, [sortedDates, currentDateIndex, visibleDatesCount]);

  const canScrollLeft = currentDateIndex > 0;
  const canScrollRight = currentDateIndex + visibleDatesCount < sortedDates.length;

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCurrentDateIndex(Math.max(0, currentDateIndex - 1));
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setCurrentDateIndex(Math.min(sortedDates.length - visibleDatesCount, currentDateIndex + 1));
    }
  };

  const jumpToDate = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, sortedDates.length - visibleDatesCount));
    setCurrentDateIndex(newIndex);
    onDateIndexChange?.(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canScrollLeft) {
        scrollLeft();
      } else if (e.key === 'ArrowRight' && canScrollRight) {
        scrollRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canScrollLeft, canScrollRight]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <button
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
          aria-label="Previous dates"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </button>

        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide px-12">
          <div className="flex items-center gap-2 py-2">
            {sortedDates.map((date, index) => {
              const isVisible = visibleDates.includes(date);
              const formattedDate = formatRelativeDate(date);

              return (
<button
  key={date}
  onClick={() => jumpToDate(index)}
  className={`
    px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 shadow-md
    ${isVisible
      ? 'bg-white text-purple-600'
      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
    }
  `}
>
  {formattedDate.split(',')[0]}
</button>
              );
            })}
          </div>
        </div>

        <button
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
          aria-label="Next dates"
        >
          <ChevronRight className="w-5 h-5 text-purple-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleDates.map((date) => {
          const games = groupedGames[date] || [];
          const formattedDate = formatRelativeDate(date);

          return (
            <div key={date} className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative flex items-baseline justify-between gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <h3 className="font-black text-base text-white drop-shadow-md">
                    {formattedDate.split(',')[0]}
                  </h3>
                  <span className="text-xs text-white/90 font-bold bg-gradient-to-r from-purple-500 to-orange-500 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-lg">
                    {games.length} {games.length === 1 ? 'rungtynės' : 'rungtynės'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {games.map((game, gameIndex) => (
                  <div key={gameIndex}>
                    <GameCard game={game} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-6">
        <div className="text-xs text-white/70 font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
          Rodomos datos {currentDateIndex + 1}–{Math.min(currentDateIndex + visibleDatesCount, sortedDates.length)} iš {sortedDates.length}
          <span className="ml-4 opacity-70">← → navigacijai</span>
        </div>
      </div>
    </div>
  );
}
