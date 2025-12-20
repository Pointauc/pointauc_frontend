import { Key, RefObject, useCallback, useMemo, useRef, useState } from 'react';

import { WheelItem } from '@models/wheel.model';
import { getSlotFromSeed } from '@services/PredictionService.ts';
import { getTotalSize, random } from '@utils/common.utils.ts';
import useInitWrapper from '@domains/winner-selection/wheel-of-random/lib/strategy/useInitWrapper';

import { WheelController } from '../../BaseWheel/BaseWheel';
import ResetButton from '../ui/ResetButton';

import useDropoutSpinEnd from './useDropoutSpinEnd';

const useSimulationDropout = (controller: RefObject<WheelController | null>): Wheel.FormatHook => {
  const [_items, setItems] = useState<WheelItem[] | undefined>();
  const items = useMemo(() => _items || [], [_items]);
  const dropoutQueueRef = useRef<Key[]>([]);

  const buildDropoutQueue = (items: WheelItem[], firstWinnerSeed: number) => {
    const remainingSlots = getTotalSize(items)
      ? items.filter(({ amount }) => amount)
      : items.map((item) => ({ ...item, amount: 1 }));
    const dropoutQueue = [];

    // The winner of the whole wheel is decided based on external seed (generated securely)
    const finalWinnerIndex = getSlotFromSeed(remainingSlots, firstWinnerSeed);
    console.log([...remainingSlots], getSlotFromSeed(remainingSlots, firstWinnerSeed), firstWinnerSeed);
    dropoutQueue.push(remainingSlots[finalWinnerIndex].id);
    remainingSlots.splice(finalWinnerIndex, 1);

    // The dropout sequence of loosers is decided based on client side random generation
    while (remainingSlots.length > 0) {
      const winnerIndex = getSlotFromSeed(remainingSlots, random.value());
      dropoutQueue.push(remainingSlots[winnerIndex].id);
      remainingSlots.splice(winnerIndex, 1);
    }

    dropoutQueueRef.current = dropoutQueue.reverse();
  };

  const initInternal = useCallback((newItems: WheelItem[]) => {
    setItems(newItems);
    dropoutQueueRef.current = [];
  }, []);
  const { initialItems, init } = useInitWrapper(initInternal);

  const invertedItems = useMemo(() => {
    const amountModifier = 0.55 + (items.length / initialItems.length) * 0.45;
    const normItems = items.map((item) => ({ ...item, amount: item.amount ** amountModifier }));
    const total = 1 / normItems.reduce((acc, { amount }) => acc + 1 / amount, 0);

    return normItems.map((item) => ({ ...item, amount: total / item.amount, originalAmount: item.amount }));
  }, [initialItems.length, items]);

  const getNextWinnerId = useCallback(
    async ({ generateSeed, items }: Wheel.GetNextWinnerIdParams): Promise<Wheel.GetNextWinnerIdResult> => {
      const isInitialSpin = dropoutQueueRef.current.length === 0;
      if (isInitialSpin) {
        const seed = await generateSeed();
        buildDropoutQueue(initialItems, seed);
      }

      const winner = dropoutQueueRef.current.shift() as string;
      return {
        id: winner,
      };
    },
    [initialItems],
  );
  const onSpinEnd = useDropoutSpinEnd({ controller, setItems });

  const onReset = useCallback(() => {
    initInternal(initialItems);
    controller.current?.clearWinner();
    controller.current?.resetPosition();
  }, [controller, initInternal, initialItems]);

  return {
    items: invertedItems,
    init,
    getNextWinnerId,
    renderSubmitButton: (submitButton) => (items.length > 1 ? submitButton : <ResetButton onClick={onReset} />),
    onSpinEnd,
  };
};

export default useSimulationDropout;
