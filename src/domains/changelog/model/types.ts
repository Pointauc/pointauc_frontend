import { ReactNode } from 'react';

export type ChangeType = 'newFeature' | 'improvement' | 'fix';

export interface ChangeItem {
  content: ReactNode;
  briefDescription?: string;
}

export interface UpdateData {
  date: string;
  newFeatures?: ChangeItem[];
  improvements?: ChangeItem[];
  fixes?: ChangeItem[];
  contributors?: string[];
}
