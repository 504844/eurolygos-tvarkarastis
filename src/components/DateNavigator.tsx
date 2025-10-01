import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
    <div className="flex items-center justify-between gap-4 mb-8">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={!hasPrevious}
        className="h-10 w-10 rounded-full"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-center gap-2 flex-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold tracking-tight">
            {formatDisplayDate(currentDate)}
          </h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          {formatRelativeDate(currentDate)}
        </Badge>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={!hasNext}
        className="h-10 w-10 rounded-full"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
