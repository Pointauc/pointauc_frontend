import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface SmartDateLabels {
  todayAt: (time: string) => string;
  yesterdayAt: (time: string) => string;
}

const RECENT_RELATIVE_HOURS = 6;
const NEARBY_RELATIVE_DAYS = 7;

export const toDateKey = (date: Date): string => dayjs(date).format('YYYY-MM-DD');

export const getPreviousDateKey = (days: number): string => toDateKey(dayjs().subtract(days, 'day').toDate());

export const fromDateKey = (value: string | null, endOfDay = false): string => {
  const fallback = toDateKey(new Date());
  return `${value ?? fallback}${endOfDay ? 'T23:59:59.999' : 'T00:00:00.000'}`;
};

export const formatMoney = (cents: number): string => `$${(cents / 100).toLocaleString(undefined, {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})}`;

export const formatCompactMoney = (cents: number): string => `$${Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  notation: 'compact',
}).format(cents / 100)}`;

export const formatCompactNumber = (value: number): string => Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  notation: Math.abs(value) >= 10000 ? 'compact' : 'standard',
}).format(value);

export const formatDate = (value: string): string => dayjs(value).format('MMM D, YYYY');

export const formatShortDate = (value: string): string => dayjs(value).format('MMM D');

export const formatSmartDate = (value: string, labels: SmartDateLabels): string => {
  const date = dayjs(value);

  if (!date.isValid()) {
    return formatDate(value);
  }

  const now = dayjs();

  if (date.isAfter(now)) {
    return formatDate(value);
  }

  if (now.diff(date, 'hour') < RECENT_RELATIVE_HOURS) {
    return date.fromNow();
  }

  const time = date.format('HH:mm');

  if (date.isSame(now, 'day')) {
    return labels.todayAt(time);
  }

  if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return labels.yesterdayAt(time);
  }

  if (now.diff(date, 'day') < NEARBY_RELATIVE_DAYS) {
    return date.fromNow();
  }

  return formatDate(value);
};

export const formatDuration = (durationMs: number): string => {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};
