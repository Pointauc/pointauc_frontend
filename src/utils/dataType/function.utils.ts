// const debounce = <T extends Function>(callback: T, duration: number) => {
//   let timeout;
//
//   return (...args: any) => {
//     cle
//   }
// };

// const throttle = <T extends Function>(callback: T, duration: number) => {
//   let timeout: number | NodeJS.Timeout | null = null;
//
//   return (...args: any) => {
//     if (!timeout) {
//       timeout = setTimeout(() => {
//         timeout = null;
//         callback(...args);
//       }, duration);
//     }
//   }
// }

import { RefObject, RefAttributes } from 'react';

export interface TimedFunctionResult<T extends (...args: any) => any> {
  callable: (...args: Parameters<T>) => void;
  cancel: () => void;
}

export const timedFunction = <T extends (...args: any) => any>(
  callback: T,
  duration: number,
): TimedFunctionResult<T> => {
  let timeout: any;
  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  const postponedArgs: { current: any | null } = { current: null };

  const callable = (...args: any): void => {
    if (timeout != null) {
      postponedArgs.current = args;
      return;
    }

    callback(...args);
    timeout = setTimeout(() => {
      timeout = null;

      if (postponedArgs.current) {
        callable(...postponedArgs.current);
        postponedArgs.current = null;
      }
    }, duration);
  };

  return { callable, cancel };
};

export enum Ease {
  Linear = 'linear',
  Quad = 'quad',
  Cubic = 'cubic',
  Quart = 'quart',
  Quint = 'quint',
  Sine = 'sine',
  Expo = 'expo',
  Circ = 'circ',
  Back = 'back',
  Elastic = 'elastic',
  Bounce = 'bounce',
}

const easeMap: Record<string, (progress: number) => number> = {
  [Ease.Linear]: (progress) => progress,
  [Ease.Quad]: (progress) => progress * progress,
  [Ease.Cubic]: (progress) => progress * progress * progress,
  [Ease.Quart]: (progress) => progress * progress * progress * progress,
  [Ease.Quint]: (progress) => progress * progress * progress * progress * progress,
  [Ease.Sine]: (progress) => 1 - Math.cos((progress * Math.PI) / 2),
  [Ease.Expo]: (progress) => (progress === 0 ? 0 : Math.pow(2, 10 * (progress - 1))),
  [Ease.Circ]: (progress) => 1 - Math.sqrt(1 - progress * progress),
};

export const interpolate = (start: number, end: number, progress: number, ease = Ease.Linear): number => {
  return start + (end - start) * easeMap[ease](progress);
};
