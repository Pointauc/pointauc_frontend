import { RefObject, useMemo, useState } from 'react';

import { WheelItem } from '@models/wheel.model';
import PredictionService from '@services/PredictionService';
import useInitWrapper from '@domains/winner-selection/wheel-of-random/lib/strategy/useInitWrapper';
import { WheelController } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';

import useDropoutSpinEnd from './useDropoutSpinEnd';

const useRuntimeDropout = (controller: RefObject<WheelController>): Wheel.FormatHook => {
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

  return {
    items: invertedItems,
    init,
    onSpinEnd,
  };
};

export default useRuntimeDropout;
