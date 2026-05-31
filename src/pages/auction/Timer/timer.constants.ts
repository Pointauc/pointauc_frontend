export const TIMER_FORMATS = {
  FORMAT: 'mm:ss:SSS',
  HOUR_FORMAT: 'mm:ss',
  TOTAL_FORMAT: 'HH:mm:ss',
};

export const HOUR = 60 * 60 * 1000;
export const TIMER_STEP = 60 * 1000;

export type TimerType = 'timer' | 'total';

export enum TimerPriority {
  Primary = 'primary',
  Secondary = 'secondary',
}
