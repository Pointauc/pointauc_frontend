import { RefObject, useMemo, useState } from 'react';

import { WheelItem } from '@models/wheel.model.ts';
import PredictionService from '@services/PredictionService.ts';
import useDropoutSpinEnd from '@components/RandomWheel/hooks/useDropoutSpinEnd.ts';
import { WheelController } from '@components/BaseWheel/BaseWheel.tsx';
import useInitWrapper from '@components/RandomWheel/hooks/useInitWrapper.ts';

const useRuntimeDropout = (controller: RefObject<WheelController>): Wheel.FormatHook => {
  const [_items, setItems] = useState<WheelItem[] | undefined>();
  const items = useMemo(() => _items || [], [_items]);

  const { init } = useInitWrapper(setItems);

  const invertedItems = useMemo(() => {
    const total = items.reduce((acc, { amount }) => acc + amount, 0);

    return items.map((item) => ({
      ...item,
      amount: PredictionService.getReverseSize(item.amount, total, items.length),
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
