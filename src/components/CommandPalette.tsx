import { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { formatRelativeDate } from '../lib/dateUtils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  sortedDates: string[];
  onDateSelect: (dateIndex: number) => void;
  groupedGames: { [date: string]: Array<{ homeTeam: string; awayTeam: string }> };
}

export function CommandPalette({ isOpen, onClose, sortedDates, onDateSelect, groupedGames }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return sortedDates.slice(0, 10).map((date, index) => ({
        type: 'date' as const,
        date,
        index,
        label: formatRelativeDate(date),
        sublabel: `${groupedGames[date]?.length || 0} rungtynės`,
      }));
    }

    const results: Array<{
      type: 'date' | 'team';
      date: string;
      index: number;
      label: string;
      sublabel?: string;
    }> = [];

    sortedDates.forEach((date, index) => {
      const formattedDate = formatRelativeDate(date).toLowerCase();
      if (formattedDate.includes(query) || date.includes(query)) {
        results.push({
          type: 'date',
          date,
          index,
          label: formatRelativeDate(date),
          sublabel: `${groupedGames[date]?.length || 0} rungtynės`,
        });
      }

      groupedGames[date]?.forEach((game) => {
        if (
          game.homeTeam.toLowerCase().includes(query) ||
          game.awayTeam.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'team',
            date,
            index,
            label: `${game.homeTeam} vs ${game.awayTeam}`,
            sublabel: formatRelativeDate(date),
          });
        }
      });
    });

    return results.slice(0, 10);
  }, [searchQuery, sortedDates, groupedGames]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          onDateSelect(filteredResults[selectedIndex].index);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onDateSelect, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ieškoti datų arba komandų..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            autoFocus
          />
          <kbd className="px-2 py-1 text-[10px] font-mono bg-accent rounded">ESC</kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Rezultatų nerasta</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.date}-${index}`}
                  onClick={() => {
                    onDateSelect(result.index);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${result.type === 'date' ? 'bg-blue-500/10' : 'bg-green-500/10'}
                  `}>
                    {result.type === 'date' ? (
                      <Calendar className="w-4 h-4 text-blue-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.label}</div>
                    {result.sublabel && (
                      <div className="text-xs text-muted-foreground truncate">{result.sublabel}</div>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <kbd className="px-2 py-1 text-[10px] font-mono bg-accent-foreground/10 rounded">
                      ↵
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-2 border-t bg-accent/20 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background rounded">↑↓</kbd>
              Navigacija
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background rounded">↵</kbd>
              Pasirinkti
            </span>
          </div>
          <span className="opacity-60">{filteredResults.length} rezultatai</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
