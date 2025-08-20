import { Key, RefObject, useCallback, useMemo, useRef, useState } from 'react';

import { WheelItem, WheelItemWithAngle } from '@models/wheel.model.ts';
import { getSlotFromDistance } from '@services/PredictionService.ts';
import { getTotalSize } from '@utils/common.utils.ts';
import { SpinParams, WheelController } from '@components/BaseWheel/BaseWheel.tsx';
import useDropoutSpinEnd from '@components/RandomWheel/hooks/useDropoutSpinEnd.ts';
import useInitWrapper from '@components/RandomWheel/hooks/useInitWrapper.ts';
import ResetButton from '@components/RandomWheel/Dropout/ResetButton';
import { calculateWinnerSpinDistance } from '@features/wheel/lib/geometry';

const useSimulationDropout = (controller: RefObject<WheelController>): Wheel.FormatHook => {
  const [_items, setItems] = useState<WheelItem[] | undefined>();
  const items = useMemo(() => _items || [], [_items]);
  const dropoutQueueRef = useRef<Key[]>([]);

  const buildDropoutQueue = (items: WheelItem[]) => {
    const remainingSlots = getTotalSize(items)
      ? items.filter(({ amount }) => amount)
      : items.map((item) => ({ ...item, amount: 1 }));
    const dropoutQueue = [];

    while (remainingSlots.length > 0) {
      const winnerIndex = getSlotFromDistance(remainingSlots, Math.random());
      dropoutQueue.push(remainingSlots[winnerIndex].id);
      remainingSlots.splice(winnerIndex, 1);
    }

    dropoutQueueRef.current = dropoutQueue.reverse();
  };

  const initInternal = useCallback((newItems: WheelItem[]) => {
    setItems(newItems);
    buildDropoutQueue(newItems);
  }, []);
  const { initialItems, init } = useInitWrapper(initInternal);

  const invertedItems = useMemo(() => {
    const amountModifier = 0.55 + (items.length / initialItems.length) * 0.45;
    const normItems = items.map((item) => ({ ...item, amount: item.amount ** amountModifier }));
    const total = 1 / normItems.reduce((acc, { amount }) => acc + 1 / amount, 0);

    return normItems.map((item) => ({ ...item, amount: total / item.amount, originalAmount: item.amount }));
  }, [initialItems.length, items]);

  const onSpinStart = useCallback((initialSpinParams: SpinParams, wheelItems: WheelItemWithAngle[]) => {
    const winner = dropoutQueueRef.current.shift() as string;
    return {
      winner,
      distance: calculateWinnerSpinDistance({
        duration: initialSpinParams.duration,
        winnerId: winner,
        items: wheelItems,
      }),
    };
  }, []);
  const onSpinEnd = useDropoutSpinEnd({ controller, setItems });

  const onReset = useCallback(() => {
    initInternal(initialItems);
    controller.current?.clearWinner();
    controller.current?.resetPosition();
  }, [controller, initInternal, initialItems]);

  return {
    items: invertedItems,
    init,
    onSpinStart,
    renderSubmitButton: (submitButton) => (items.length > 1 ? submitButton : <ResetButton onClick={onReset} />),
    onSpinEnd,
  };
};

export default useSimulationDropout;
