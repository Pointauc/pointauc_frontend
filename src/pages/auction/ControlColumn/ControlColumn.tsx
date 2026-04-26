import { useMemo } from 'react';

import { useAuctionEndedAnalytics } from '@domains/auction/analytics/lib/useAuctionEndedAnalytics';
import { useTimerBroadcasting } from '@domains/broadcasting/lib/useTimerBroadcasting';
import { useIsMobile } from '@shared/lib/ui';
import { trackTimerEdited } from '@shared/lib/analytics/events';

import Stopwatch from '../Stopwatch/Stopwatch';
import PurchaseList from '../PurchaseList/PurchaseList';
import FastAccessPanel from '../FastAccessPanel/FastAccessPanel';

import classes from './ControlColumn.module.css';

const ControlColumn: React.FC = () => {
  const timerBroadcastingProps = useTimerBroadcasting();
  const auctionEndedAnalyticsProps = useAuctionEndedAnalytics();
  const isMobile = useIsMobile();
  const timerProps = useMemo(
    () => ({
      ...timerBroadcastingProps,
      onStart: (timeLeft: number) => {
        timerBroadcastingProps.onStart?.(timeLeft);
        auctionEndedAnalyticsProps.onStart?.(timeLeft);
      },
      onReset: (timeLeft: number) => {
        timerBroadcastingProps.onReset?.(timeLeft);
        auctionEndedAnalyticsProps.onReset?.(timeLeft);
      },
      onTimeChanged: (timeLeft: number, state: 'paused' | 'running') => {
        timerBroadcastingProps.onTimeChanged?.(timeLeft, state);
        auctionEndedAnalyticsProps.onTimeChanged?.(timeLeft, state);
      },
      onTimeEdited: (timerType: 'stopwatch' | 'total') => {
        trackTimerEdited({
          timer_type: timerType,
        });
      },
      onEnd: () => {
        timerBroadcastingProps.onEnd?.();
        auctionEndedAnalyticsProps.onEnd?.();
      },
    }),
    [auctionEndedAnalyticsProps, timerBroadcastingProps],
  );

  return (
    <div className={classes.controlColumn}>
      <Stopwatch {...timerProps} />
      {!isMobile && (
        <>
          <FastAccessPanel />
          <PurchaseList />
        </>
      )}
    </div>
  );
};

export default ControlColumn;
