import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UpcomingGame {
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  home_logo: string | null;
  away_logo: string | null;
  home_odds: number | null;
  away_odds: number | null;
}

export function UpcomingGames() {
  const [games, setGames] = useState<UpcomingGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingGames();
  }, []);

  const loadUpcomingGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('date, time, home_team, away_team, home_logo, away_logo, home_odds, away_odds')
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(3);

      if (error) throw error;
      if (data) setGames(data);
    } catch (error) {
      console.error('Error loading upcoming games:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl blur-2xl animate-pulse"></div>
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 h-[500px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>

      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 space-y-6 hover:border-white/30 transition-all duration-300">
        <div className="flex items-center justify-between pb-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <div className="text-white font-black text-xl">Upcoming Games</div>
              <div className="text-white/60 text-sm">Next matches</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-black rounded-full animate-pulse backdrop-blur-sm">
            LIVE SCHEDULE
          </div>
        </div>

        <div className="space-y-4">
          {games.map((game, i) => (
            <div
              key={i}
              className="group/card relative bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-orange-500/0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>

              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {game.home_logo && (
                      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center p-1.5 border border-white/20">
                        <img src={game.home_logo} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="text-white font-bold text-base">{game.home_team}</div>
                  </div>
                  {game.home_odds && (
                    <div className="px-3 py-1.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-sm font-black rounded-lg backdrop-blur-sm">
                      {game.home_odds}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-white/40"></div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                    <Clock className="w-3 h-3 text-white/60" />
                    <span className="text-white/90 text-xs font-bold">{game.time}</span>
                    <span className="text-white/50 text-xs">·</span>
                    <span className="text-white/60 text-xs font-semibold">{formatDate(game.date)}</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-white/40"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {game.away_logo && (
                      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center p-1.5 border border-white/20">
                        <img src={game.away_logo} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="text-white font-bold text-base">{game.away_team}</div>
                  </div>
                  {game.away_odds && (
                    <div className="px-3 py-1.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-sm font-black rounded-lg backdrop-blur-sm">
                      {game.away_odds}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black text-sm rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl relative overflow-hidden group/btn">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
          <span className="relative">View Full Schedule</span>
        </button>
      </div>
    </div>
  );
}
