import { useCallback, useState } from 'react';

import { WheelItem } from '@models/wheel.model.ts';

interface Result {
  initialItems: WheelItem[];
  init: (newItems: WheelItem[]) => void;
}

const useInitWrapper = (callback: (items: WheelItem[]) => void): Result => {
  const [initialItems, setInitialItems] = useState<WheelItem[]>([]);

  const init = useCallback(
    (newItems: WheelItem[]) => {
      if (initialItems === newItems) return;

      setInitialItems(newItems);
      callback(newItems);
    },
    [callback, initialItems],
  );

  return {
    initialItems,
    init,
  };
};

export default useInitWrapper;
