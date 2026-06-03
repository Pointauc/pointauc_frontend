import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useAuctionEndedAnalytics } from '@domains/auction/analytics/lib/useAuctionEndedAnalytics';
import {
  pauseActiveAuctionTimer,
  resetActiveAuctionTimer,
  setActiveAuctionTimerDuration,
  startActiveAuctionTimer,
} from '@domains/auction/history/model/activeAuctionHistorySlice';
import { useTimerBroadcasting } from '@domains/broadcasting/lib/useTimerBroadcasting';
import { useIsMobile } from '@shared/lib/ui';
import { trackTimerEdited } from '@shared/lib/analytics/events';

import Timer from '../Timer/Timer';
import BidList from '../BidList/BidList';
import FastAccessPanel from '../FastAccessPanel/FastAccessPanel';

import classes from './ControlColumn.module.css';

const ControlColumn: React.FC = () => {
  const dispatch = useDispatch();
  const timerBroadcastingProps = useTimerBroadcasting();
  const auctionEndedAnalyticsProps = useAuctionEndedAnalytics();
  const isMobile = useIsMobile();
  const timerProps = useMemo(
    () => ({
      ...timerBroadcastingProps,
      onStart: (timeLeft: number) => {
        dispatch(startActiveAuctionTimer());
        timerBroadcastingProps.onStart?.(timeLeft);
        auctionEndedAnalyticsProps.onStart?.(timeLeft);
      },
      onPause: (timeLeft: number) => {
        dispatch(pauseActiveAuctionTimer());
        timerBroadcastingProps.onPause?.(timeLeft);
      },
      onReset: (timeLeft: number) => {
        dispatch(resetActiveAuctionTimer());
        timerBroadcastingProps.onReset?.(timeLeft);
        auctionEndedAnalyticsProps.onReset?.(timeLeft);
      },
      onTimeChanged: (timeLeft: number, state: 'paused' | 'running') => {
        timerBroadcastingProps.onTimeChanged?.(timeLeft, state);
        auctionEndedAnalyticsProps.onTimeChanged?.(timeLeft, state);
      },
      onTotalTimeChanged: (totalTime: number) => {
        dispatch(setActiveAuctionTimerDuration(totalTime));
      },
      onTimeEdited: (timerType: 'timer' | 'total') => {
        trackTimerEdited({
          timer_type: timerType,
        });
      },
      onEnd: () => {
        dispatch(pauseActiveAuctionTimer());
        timerBroadcastingProps.onEnd?.();
        auctionEndedAnalyticsProps.onEnd?.();
      },
    }),
    [auctionEndedAnalyticsProps, dispatch, timerBroadcastingProps],
  );

  return (
    <div className={classes.controlColumn}>
      <Timer {...timerProps} />
      {!isMobile && (
        <>
          <FastAccessPanel />
          <BidList />
        </>
      )}
    </div>
  );
};

export default ControlColumn;
