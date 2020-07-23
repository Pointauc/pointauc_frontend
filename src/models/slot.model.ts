import { ReactText } from 'react';

export interface Slot {
  id: ReactText;
  name: string | null;
  amount: number | null;
  extra: number | null;
}
