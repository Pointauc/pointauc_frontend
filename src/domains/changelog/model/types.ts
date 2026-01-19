import { ReactNode } from 'react';

export type ChangeType = 'newFeature' | 'improvement' | 'fix';

export interface UpdateData {
  date: string;
  newFeatures?: ReactNode[];
  improvements?: ReactNode[];
  fixes?: ReactNode[];
  contributors?: string[];
}
