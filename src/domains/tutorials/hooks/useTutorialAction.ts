import { useCallback, useEffect } from 'react';

import { useTutorialContext } from '@domains/tutorials/context/TutorialContext';

/**
 * Hook to trigger a manual action in a tutorial
 * Use this when you need to trigger step progression from within a component
 */
export function useTutorialAction(actionId: string) {
  const { triggerAction } = useTutorialContext();

  const trigger = useCallback(() => {
    triggerAction(actionId);
  }, [actionId, triggerAction]);

  return trigger;
}

/**
 * Hook to automatically trigger an action when a callback is executed
 */
export function useTutorialActionCallback(actionId: string, callback: (...args: any[]) => any) {
  const { triggerAction } = useTutorialContext();

  return useCallback((...args: any[]) => {
    const result = callback(...args);
    triggerAction(actionId);
    return result;
  }, [actionId, callback, triggerAction]);
}

