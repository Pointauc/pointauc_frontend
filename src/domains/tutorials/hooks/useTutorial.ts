import { useTutorialContext } from '@domains/tutorials/context/TutorialContext';

/**
 * Hook to access tutorial context
 */
export function useTutorial() {
  return useTutorialContext();
}

