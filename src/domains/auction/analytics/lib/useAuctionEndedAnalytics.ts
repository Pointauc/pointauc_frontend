import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import INTEGRATIONS from '@domains/bids/external-integrations/integrations.ts';
import {
  getAuctionFeatureUsageState,
  resetAuctionFeatureUsageState,
} from '@domains/auction/analytics/model/auctionFeatureUsageStore';
import { trackAuctionEnded } from '@shared/lib/analytics/events';

import { buildAuctionEndedPayload } from './buildAuctionEndedPayload';

import type { RootState } from '@reducers';
import type { TimerProps } from '@pages/auction/Timer/Timer';

const AUCTION_ENDED_CONFIRMATION_DELAY_MS = 3000;

type UseAuctionEndedAnalyticsReturn = Pick<TimerProps, 'onEnd' | 'onReset' | 'onStart' | 'onTimeChanged'>;

const getCurrentlyEnabledIntegrationIds = () => {
  return INTEGRATIONS.filter((integration) => integration.pubsubFlow.store.state.subscribed).map((integration) => integration.id);
};

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
      const featureUsage = getAuctionFeatureUsageState();

      trackAuctionEnded(
        buildAuctionEndedPayload({
          settings: latestSettings.current,
          lots: latestLots.current,
          featureUsage,
        }),
      );
      resetAuctionFeatureUsageState({ enabledIntegrationIds: getCurrentlyEnabledIntegrationIds() });
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
