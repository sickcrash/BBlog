import { addDays, format, addWeeks, differenceInCalendarDays } from 'date-fns';

export const generateMarkedDates = (ranges) => {
  const markedDates = {};

  ranges.forEach((range) => {
    const start = new Date(range.startDate);
    const durationDays = range.durationWeeks * 7;
    const color = range.color || '#007AFF';
    const fadedColor = range.color ? range.color + '80' : '#007AFF80'; // 50% opacity

    for (let i = 0; i < durationDays; i++) {
      const current = addDays(start, i);
      const dateStr = format(current, 'yyyy-MM-dd');

      markedDates[dateStr] = {
        color: color, // You might want different shades or solid color
        textColor: 'white',
        startingDay: i === 0,
        endingDay: i === durationDays - 1,
      };
    }
  });

  return markedDates;
};
