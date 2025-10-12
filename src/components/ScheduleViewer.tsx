import { useState, useEffect, useMemo } from 'react';
import { fetchSchedule } from '../lib/scheduleService';
import { ScheduleData, GroupedGames } from '../types/schedule';
import { Loader as Loader2, Command } from 'lucide-react';
import { sortDateKeys } from '../lib/dateUtils';
import { HybridGameGrid } from './HybridGameGrid';
import { CommandPalette } from './CommandPalette';
import { fetchBettingOddsForGames } from '../lib/oddsApi';
import { updateGameOdds } from '../lib/scheduleService';

export function ScheduleViewer() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const scheduleData = await fetchSchedule(false);

      const gamesNeedingOdds = scheduleData.games.filter(
        game => !game.homeOdds || !game.awayOdds
      );

      if (gamesNeedingOdds.length > 0) {
        console.log(`Fetching odds for ${gamesNeedingOdds.length} games`);
        const oddsMap = await fetchBettingOddsForGames(
          gamesNeedingOdds.map(game => ({
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
          }))
        );

        console.log(`Received odds for ${oddsMap.size} games`);

        for (const game of gamesNeedingOdds) {
          const key = `${game.homeTeam}-${game.awayTeam}`;
          const odds = oddsMap.get(key);
          if (odds) {
            console.log(`Found odds for ${game.homeTeam} vs ${game.awayTeam}:`, odds);
            game.homeOdds = odds.homeOdds;
            game.awayOdds = odds.awayOdds;
            await updateGameOdds(game.homeTeam, game.awayTeam, odds.homeOdds, odds.awayOdds);
          } else {
            console.log(`No odds found for ${game.homeTeam} vs ${game.awayTeam}`);
          }
        }
      }

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key === '/' && !commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  if (!data || sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Nėra suplanuotų rungtynių</p>
      </div>
    );
  }

  return (
    <>
      <div data-schedule-section className="max-w-[1800px] mx-auto space-y-8 py-8 md:py-12 px-4 md:px-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-orange-500 blur-2xl opacity-30"></div>
              <h1 className=" relative text-5xl md:text-2xl font-black tracking-tight text-white drop-shadow-2xl">
                Tvarkaraštis
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-white/90 text-xs font-bold">
                  {data.games.length} rungtynės
                </p>
              </div>
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <p className="text-white/90 text-xs font-bold">
                  {sortedDates.length} datos
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white/95 hover:bg-white border border-white/30 shadow-xl transition-colors backdrop-blur-sm"
          >
            <Command className="w-5 h-5 text-purple-600" />
            <span className="text-base font-black text-gray-900">Ieškoti rungtynių</span>
            <kbd className="px-3 py-1.5 text-xs font-mono bg-purple-100 text-purple-700 rounded-lg font-bold">
              /
            </kbd>
          </button>
        </div>

        <HybridGameGrid
          groupedGames={groupedGames}
          sortedDates={sortedDates}
        />
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        sortedDates={sortedDates}
        onDateSelect={() => {}}
        groupedGames={groupedGames}
      />
    </>
  );
}
