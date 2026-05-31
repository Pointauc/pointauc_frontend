import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { globalBidsEventBus } from '@domains/bids/lib/globalBidsEventBus.ts';
import { RootState } from '@reducers';
import { Purchase } from '@reducers/Purchases/Purchases';

interface UseTimerAutoUpdateRulesParams {
  getTime: () => number;
  updateTimer: (timeChange: number) => void;
}

const useTimerAutoUpdateRules = ({ getTime, updateTimer }: UseTimerAutoUpdateRulesParams): void => {
  const slotsLength = useSelector((root: RootState) => root.slots.slots.length);
  const winnerSlot = useSelector((root: RootState) => root.slots.slots[0]);
  const isAutoincrementActive = useSelector((root: RootState) => root.aucSettings.settings.isAutoincrementActive);
  const autoincrementTime = useSelector((root: RootState) => root.aucSettings.settings.autoincrementTime);
  const minTime = useSelector((root: RootState) => root.aucSettings.settings.minTime);
  const isMinTimeActive = useSelector((root: RootState) => root.aucSettings.settings.isMinTimeActive);
  const isNewSlotIncrement = useSelector((root: RootState) => root.aucSettings.settings.isNewSlotIncrement);
  const newSlotIncrement = useSelector((root: RootState) => root.aucSettings.settings.newSlotIncrement);
  const isIncrementActive = useSelector((root: RootState) => root.aucSettings.settings.isIncrementActive);
  const incrementTime = useSelector((root: RootState) => root.aucSettings.settings.incrementTime);

  const previousSlotsLength = useRef(slotsLength);
  const previousWinnerSlotId = useRef<string | undefined>(winnerSlot?.id);

  const updateTimerWithMinTimeGuard = useCallback(
    (timeChange: number): void => {
      if (isMinTimeActive && getTime() > minTime * 60 * 1000) {
        return;
      }

      updateTimer(timeChange);
    },
    [getTime, isMinTimeActive, minTime, updateTimer],
  );

  useEffect(() => {
    const handleBid = (bid: Purchase): void => {
      if (isIncrementActive && bid.isDonation) {
        updateTimerWithMinTimeGuard(incrementTime * 1000);
      }
    };

    globalBidsEventBus.on('bid', handleBid);

    return () => {
      globalBidsEventBus.off('bid', handleBid);
    };
  }, [incrementTime, isIncrementActive, updateTimerWithMinTimeGuard]);

  useEffect(() => {
    if (slotsLength > previousSlotsLength.current && isNewSlotIncrement) {
      updateTimerWithMinTimeGuard(Number(newSlotIncrement) * 1000);
    }

    previousSlotsLength.current = slotsLength;
  }, [isNewSlotIncrement, newSlotIncrement, slotsLength, updateTimerWithMinTimeGuard]);

  useEffect(() => {
    if (isAutoincrementActive && winnerSlot?.amount && previousWinnerSlotId.current !== winnerSlot.id) {
      updateTimerWithMinTimeGuard(Number(autoincrementTime) * 1000);
    }

    previousWinnerSlotId.current = winnerSlot?.id;
  }, [autoincrementTime, isAutoincrementActive, updateTimerWithMinTimeGuard, winnerSlot]);
};

export default useTimerAutoUpdateRules;
