import { RefObject, useMemo, useState } from 'react';

import { WheelController } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';
import useInitWrapper from '@domains/winner-selection/wheel-of-random/lib/strategy/useInitWrapper';
import { WheelItem } from '@models/wheel.model';
import PredictionService, { getSlotFromSeed } from '@services/PredictionService';
import { random } from '@utils/common.utils.ts';

import useDropoutSpinEnd from './useDropoutSpinEnd';

const useRuntimeDropout = (controller: RefObject<WheelController | null>): Wheel.FormatHook => {
  const [_items, setItems] = useState<WheelItem[] | undefined>();
  const items = useMemo(() => _items || [], [_items]);

  const { init } = useInitWrapper(setItems);

  const invertedItems = useMemo(() => {
    const total = items.reduce((acc, { amount }) => acc + amount, 0);

    return items.map((item) => ({
      ...item,
      amount: PredictionService.getReverseSize(item.amount, total, items.length),
      originalAmount: item.amount,
    }));
  }, [items]);
  const onSpinEnd = useDropoutSpinEnd({ controller, setItems });

  const getNextWinnerId = ({ items }: Wheel.GetNextWinnerIdParams): Wheel.GetNextWinnerIdResult => {
    // ToDo: async seed is not supported for strategy with multiple steps
    const seed = random.value();
    return { id: items[getSlotFromSeed(items, seed)].id, isFinalSpin: false };
  };

  return {
    items: invertedItems,
    init,
    getNextWinnerId,
    onSpinEnd,
  };
};

export default useRuntimeDropout;
