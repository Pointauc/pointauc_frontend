import { createContext } from 'react';

import { TutorialContextState } from '@domains/tutorials/models/tutorial.model';

export const TutorialContext = createContext<TutorialContextState | null>(null);
