import { SMART_CLEAR_MIN_DURATION_MS } from '../model/constants';

import type { RootState } from '@reducers';

export const getActiveAuctionDurationMs = (state: Pick<RootState, 'activeAuctionHistory'>): number => {
  const { durationMs, timerStartedAt } = state.activeAuctionHistory;
  if (!timerStartedAt) {
    return durationMs;
  }

  return durationMs + Math.max(0, Date.now() - new Date(timerStartedAt).getTime());
};

export const checkShouldSmartSaveAuction = (
  state: Pick<RootState, 'activeAuctionHistory' | 'slots'>,
): boolean => {
  return state.slots.slots.some((lot) => Boolean(lot.name) || Number(lot.amount ?? 0) > 0)
    && getActiveAuctionDurationMs(state) >= SMART_CLEAR_MIN_DURATION_MS;
};
