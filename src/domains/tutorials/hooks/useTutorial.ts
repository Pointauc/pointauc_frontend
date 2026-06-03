import { useTutorialContext } from '@domains/tutorials/context/useTutorialContext';

/**
 * Hook to access tutorial context
 */
export function useTutorial() {
  return useTutorialContext();
}
