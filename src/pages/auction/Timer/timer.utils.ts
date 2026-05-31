import dayjs from 'dayjs';

import { HOUR, TIMER_FORMATS } from './timer.constants';

export const formatTimerTime = (currentTime: number): string => {
  const date = dayjs(currentTime);
  const hours = Math.floor(currentTime / HOUR);
  const formatted = hours ? date.format(TIMER_FORMATS.HOUR_FORMAT) : date.format(TIMER_FORMATS.FORMAT).slice(0, -1);

  return hours ? `${hours > 9 ? hours : `0${hours}`}:${formatted}` : formatted;
};

export const formatTotalTime = (currentTime: number): string =>
  dayjs.duration(currentTime).format(TIMER_FORMATS.TOTAL_FORMAT);
