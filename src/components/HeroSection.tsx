import { Calendar, Sparkles } from 'lucide-react';
import { UpcomingGames } from './UpcomingGames';

export function HeroSection() {
  const scrollToSchedule = () => {
    const scheduleSection = document.querySelector('[data-schedule-section]');
    scheduleSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed] via-[#9333ea] to-[#a855f7]"></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,64 C360,96 720,32 1080,64 C1260,80 1350,96 1440,96 L1440,120 L0,120 Z"
            fill="#0f0520"
            opacity="0.8"
          />
        </svg>
      </div>

      <div className="relative container mx-auto px-6 lg:px-12 pt-32 pb-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-8 z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-white text-sm font-bold">Turkish Airlines EuroLeague 2025/26</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-none tracking-tight">
                  <span className="block animate-fade-in">LIVE SCHEDULE</span>
                  <div className="relative inline-block mt-4">
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 animate-gradient">
                      & BETTING ODDS
                    </span>
                    <div className="absolute -top-8 right-0 lg:-top-10 lg:-right-20 xl:-right-32">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-full text-xs font-black tracking-wider transform -rotate-6 whitespace-nowrap shadow-2xl animate-pulse">
                        LIVE UPDATES
                      </div>
                    </div>
                  </div>
                </h1>

                <p className="text-white/90 text-lg lg:text-xl max-w-2xl leading-relaxed font-medium">
                  Your complete source for EuroLeague basketball schedules, betting odds, and real-time game information. Stay updated with all matches across the season.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={scrollToSchedule}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-purple-700 font-black text-base rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Calendar className="w-5 h-5 relative z-10" />
                <span className="tracking-wide relative z-10">VIEW FULL SCHEDULE</span>
              </button>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative text-center px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-4xl font-black text-white">18</div>
                  <div className="text-xs text-white/70 font-bold uppercase tracking-wide">Teams</div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative text-center px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-4xl font-black text-white">34</div>
                  <div className="text-xs text-white/70 font-bold uppercase tracking-wide">Rounds</div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative text-center px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-4xl font-black text-white">306</div>
                  <div className="text-xs text-white/70 font-bold uppercase tracking-wide">Games</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center items-center z-10">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <Sparkles className="w-16 h-16 text-white" />
            </div>

            <UpcomingGames />
          </div>
        </div>
      </div>
    </div>
  );
}
