import dayjs from 'dayjs';

import { HOUR, STOPWATCH } from './stopwatch.constants';

export const formatStopwatchTime = (currentTime: number): string => {
  const date = dayjs(currentTime);
  const hours = Math.floor(currentTime / HOUR);
  const formatted = hours ? date.format(STOPWATCH.HOUR_FORMAT) : date.format(STOPWATCH.FORMAT).slice(0, -1);

  return hours ? `${hours > 9 ? hours : `0${hours}`}:${formatted}` : formatted;
};

export const formatTotalTime = (currentTime: number): string =>
  dayjs.duration(currentTime).format(STOPWATCH.TOTAL_FORMAT);
