import { useRef } from 'react';

export const useSyncEffect = (effect: () => void, deps: any[]) => {
  const prevDeps = useRef<any[]>([]);

  if (deps.some((dep, index) => !Object.is(dep, prevDeps.current[index]))) {
    effect();
    prevDeps.current = deps;
  }
};
