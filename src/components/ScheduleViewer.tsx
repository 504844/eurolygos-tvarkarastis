import { useState, useEffect, useMemo } from 'react';
import { fetchSchedule } from '../lib/scheduleApi';
import { ScheduleData, GroupedGames } from '../types/schedule';
import { Trophy, Loader as Loader2 } from 'lucide-react';
import { DateNavigator } from './DateNavigator';
import { GameCard } from './GameCard';
import { sortDateKeys } from '../lib/dateUtils';
import { Separator } from './ui/separator';

export function ScheduleViewer() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const scheduleData = await fetchSchedule(1, true);
      setData(scheduleData);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedGames: GroupedGames = useMemo(() => {
    if (!data) return {};

    const grouped: GroupedGames = {};
    data.games.forEach((game) => {
      if (!grouped[game.date]) {
        grouped[game.date] = [];
      }
      grouped[game.date].push(game);
    });
    return grouped;
  }, [data]);

  const sortedDates = useMemo(() => {
    return sortDateKeys(Object.keys(groupedGames));
  }, [groupedGames]);

  const currentGames = useMemo(() => {
    if (sortedDates.length === 0) return [];
    return groupedGames[sortedDates[currentDateIndex]] || [];
  }, [groupedGames, sortedDates, currentDateIndex]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        <p className="text-muted-foreground animate-pulse">Kraunamas tvarkaraštis...</p>
      </div>
    );
  }

  if (!data || sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Trophy className="h-16 w-16 text-muted-foreground/30" />
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Tvarkaraštis nerastas</h3>
          <p className="text-sm text-muted-foreground">
            Šiuo metu nėra jokių suplanuotų rungtynių.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 justify-center">
        <Trophy className="h-8 w-8 text-orange-500" />
        <h1 className="text-3xl font-bold tracking-tight">Eurolygos tvarkaraštis</h1>
      </div>

      <Separator className="my-8" />

      <DateNavigator
        dates={sortedDates}
        currentDateIndex={currentDateIndex}
        onNavigate={setCurrentDateIndex}
      />

      <div className="space-y-4 animate-in slide-in-from-right duration-300">
        {currentGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Šią dieną rungtynių nėra.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {currentGames.length} {currentGames.length === 1 ? 'rungtynės' : 'rungtynių'}
              </p>
            </div>
            <div className="grid gap-4 md:gap-6">
              {currentGames.map((game, idx) => (
                <GameCard key={idx} game={game} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <p className="text-xs text-muted-foreground">
          Rodomos {currentDateIndex + 1} iš {sortedDates.length} dienų
        </p>
      </div>
    </div>
  );
}
