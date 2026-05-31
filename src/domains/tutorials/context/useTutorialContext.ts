import { useContext } from 'react';

import { TutorialContext } from './tutorialContextData';

import type { TutorialContextState } from '@domains/tutorials/models/tutorial.model';

export const useTutorialContext = (): TutorialContextState => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorialContext must be used within a TutorialProvider');
  }
  return context;
};
