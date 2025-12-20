import { useState } from 'react';

import { WheelItem } from '@models/wheel.model.ts';
import { getSlotFromSeed } from '@services/PredictionService';

export const getWinnerIdFromSeedGenerator = async ({
  items,
  generateSeed,
}: Wheel.GetNextWinnerIdParams): Promise<Wheel.GetNextWinnerIdResult> => {
  const seed = await generateSeed();

  return { id: items[getSlotFromSeed(items, seed)].id };
};

const useNormalWheel = (): Wheel.FormatHook => {
  const [items, setItems] = useState<WheelItem[]>([]);

  const init = (items: WheelItem[]) => {
    setItems(items);
  };

  const getNextWinnerId = async ({
    generateSeed,
  }: Wheel.GetNextWinnerIdParams): Promise<Wheel.GetNextWinnerIdResult> => {
    const seed = await generateSeed();

    return { id: items[getSlotFromSeed(items, seed)].id };
  };

  return {
    items,
    init,
    getNextWinnerId,
  };
};

export default useNormalWheel;
