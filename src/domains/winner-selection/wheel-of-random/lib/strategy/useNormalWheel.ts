import { useState } from 'react';

import { WheelItem } from '@models/wheel.model.ts';

const useNormalWheel = (): Wheel.FormatHook => {
  const [items, setItems] = useState<WheelItem[]>([]);

  const init = (items: WheelItem[]) => {
    setItems(items);
  };

  return {
    items,
    init,
  };
};

export default useNormalWheel;
