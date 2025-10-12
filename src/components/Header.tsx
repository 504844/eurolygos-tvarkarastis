import { Trophy } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/95 to-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-white font-black text-2xl tracking-tight">Eurolyga</h1>
              <p className="text-white/50 text-xs font-medium">2025/26 sezonas</p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
