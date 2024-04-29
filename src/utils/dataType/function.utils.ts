// const debounce = <T extends Function>(callback: T, duration: number) => {
//   let timeout;
//
//   return (...args: any) => {
//     cle
//   }
// };

import { RefObject, RefAttributes } from 'react';

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
