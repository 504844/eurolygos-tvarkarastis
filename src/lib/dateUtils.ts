import { format, isToday, isTomorrow, differenceInDays, parse } from 'date-fns';

export function formatRelativeDate(dateString: string): string {
  try {
    const parsedDate = parse(dateString, 'yyyy-MM-dd HH:mm', new Date());

    if (isToday(parsedDate)) {
      return 'Šiandien';
    }

    if (isTomorrow(parsedDate)) {
      return 'Rytoj';
    }

    const daysAway = differenceInDays(parsedDate, new Date());

    if (daysAway > 0 && daysAway <= 7) {
      return `Po ${daysAway} d.`;
    }

    return format(parsedDate, 'MMM d, yyyy');
  } catch (error) {
    return dateString;
  }
}

export function formatDisplayDate(dateString: string): string {
  try {
    const parsedDate = parse(dateString, 'yyyy-MM-dd HH:mm', new Date());
    return format(parsedDate, 'EEEE, MMMM d');
  } catch (error) {
    return dateString;
  }
}

export function sortDateKeys(dates: string[]): string[] {
  return dates.sort((a, b) => {
    try {
      const dateA = parse(a, 'yyyy-MM-dd HH:mm', new Date());
      const dateB = parse(b, 'yyyy-MM-dd HH:mm', new Date());
      return dateA.getTime() - dateB.getTime();
    } catch {
      return 0;
    }
  });
}
