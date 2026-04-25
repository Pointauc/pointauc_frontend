import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { trackAuctionEnded } from '@shared/lib/analytics/events';

import { buildAuctionEndedPayload } from './buildAuctionEndedPayload';

import type { RootState } from '@reducers';
import type { StopwatchProps } from '@pages/auction/Stopwatch/Stopwatch';

const AUCTION_ENDED_CONFIRMATION_DELAY_MS = 3000;

type UseAuctionEndedAnalyticsReturn = Pick<StopwatchProps, 'onEnd' | 'onReset' | 'onStart' | 'onTimeChanged'>;

export const useAuctionEndedAnalytics = (): UseAuctionEndedAnalyticsReturn => {
  const lots = useSelector((state: RootState) => state.slots.slots);
  const settings = useSelector((state: RootState) => state.aucSettings.settings);
  const latestLots = useRef(lots);
  const latestSettings = useRef(settings);
  const confirmationTimer = useRef<number | null>(null);

  useEffect(() => {
    latestLots.current = lots;
    latestSettings.current = settings;
  }, [lots, settings]);

  const cancelPendingAuctionEndedEvent = useCallback(() => {
    if (!confirmationTimer.current) {
      return;
    }

    window.clearTimeout(confirmationTimer.current);
    confirmationTimer.current = null;
  }, []);

  const scheduleAuctionEndedEvent = useCallback(() => {
    cancelPendingAuctionEndedEvent();

    confirmationTimer.current = window.setTimeout(() => {
      confirmationTimer.current = null;
      trackAuctionEnded(
        buildAuctionEndedPayload({
          settings: latestSettings.current,
          lots: latestLots.current,
        }),
      );
    }, AUCTION_ENDED_CONFIRMATION_DELAY_MS);
  }, [cancelPendingAuctionEndedEvent]);

  useEffect(() => cancelPendingAuctionEndedEvent, [cancelPendingAuctionEndedEvent]);

  return {
    onEnd: scheduleAuctionEndedEvent,
    onStart: (timeLeft: number) => {
      if (timeLeft > 0) {
        cancelPendingAuctionEndedEvent();
      }
    },
    onReset: cancelPendingAuctionEndedEvent,
    onTimeChanged: (timeLeft: number) => {
      if (timeLeft > 0) {
        cancelPendingAuctionEndedEvent();
      }
    },
  };
};
