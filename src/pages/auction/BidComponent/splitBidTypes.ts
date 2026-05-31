import type { Lot } from '@models/slot.model';

export type SplitBidDraftTarget =
  | { type: 'existing'; lotId: string; name: string | null }
  | { type: 'new'; name: string };

export interface SplitBidDraftEntry {
  id: string;
  lotInput: string;
  target: SplitBidDraftTarget;
  amount: number;
  percentage: number;
}

export interface LotSuggestion {
  lot: Lot;
  rating: number;
}
