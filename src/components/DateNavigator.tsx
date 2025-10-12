import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRelativeDate, formatDisplayDate } from '../lib/dateUtils';

interface DateNavigatorProps {
  dates: string[];
  currentDateIndex: number;
  onNavigate: (index: number) => void;
}

export function DateNavigator({ dates, currentDateIndex, onNavigate }: DateNavigatorProps) {
  const currentDate = dates[currentDateIndex];
  const hasPrevious = currentDateIndex > 0;
  const hasNext = currentDateIndex < dates.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(currentDateIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(currentDateIndex + 1);
    }
  };

  return (
    <div className="flex items-center justify-between gap-6 md:gap-8 mb-12">
      <button
        onClick={handlePrevious}
        disabled={!hasPrevious}
        className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border border-border/40 hover:border-border/60 bg-card/50 backdrop-blur-sm hover:bg-card/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      <div className="flex flex-col items-center gap-3 flex-1">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center">
          {formatDisplayDate(currentDate)}
        </h2>
        <span className="text-sm text-muted-foreground font-medium">
          {formatRelativeDate(currentDate)}
        </span>
      </div>

      <button
        onClick={handleNext}
        disabled={!hasNext}
        className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border border-border/40 hover:border-border/60 bg-card/50 backdrop-blur-sm hover:bg-card/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
    </div>
  );
}
