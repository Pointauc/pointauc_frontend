import { isEqual } from 'es-toolkit';

/**
 * Returns a function that calls the callback after the duration has passed.
 * If the function is called again before the duration has passed, the callback is postponed.
 * After the duration has passed, the callback is called with the last arguments.
 * @param callback - The function to call.
 * @param duration - The duration in milliseconds.
 * @returns A function that calls the callback after the duration has passed.
 */
export const timedFunction = <T extends (...args: any) => any>(
  callback: T,
  duration: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: any;
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

  return callable;
};

interface SkipSameValueCallsOptions {
  compareNested?: boolean;
}

interface SkipSameValueCallsResult<TParams extends any[]> {
  call: (...args: TParams) => void;
  callThrough: (...args: TParams) => void;
}

/**
 * Returns a function that calls the callback only if the arguments are different from the last call.
 * @param callback - The function to call.
 * @param {Object} options - Configuration options:
 * - `compareNested` - Whether to compare nested objects using es-toolkit isEqual or simple equality.
 * @returns {Object} An object with two functions:
 * - `call` - Calls the callback only if the arguments are different from the last call.
 * - `callThrough` - Calls the callback with the arguments regardless of whether they are the same as the last call.
 */
export const skipSameValueCalls = <TParams extends any[]>(
  callback: (...args: TParams) => void,
  options?: SkipSameValueCallsOptions,
): SkipSameValueCallsResult<TParams> => {
  let lastArgs: TParams | null = null;
  const compareFn = options?.compareNested ? isEqual : (a: any, b: any) => a === b;

  const callThrough = (...args: TParams): void => {
    lastArgs = args;
    callback(...args);
  };

  const call = (...args: TParams): void => {
    if (lastArgs && compareFn(lastArgs, args)) {
      return;
    }
    lastArgs = args;
    callback(...args);
  };

  return { call, callThrough };
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
