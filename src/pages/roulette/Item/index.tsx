import React, { FC, useMemo, useState } from 'react';

import { Slot } from '@models/slot.model.ts';
import { getRandomIntInclusive } from '@utils/common.utils.ts';
import { getSlotChance } from '@services/PercentsRefMap.ts';

interface RouletteItemProps {
  slots: Slot[];
  totalSum: number;
  style: any;
  index: number;
}

const RouletteItem: FC<RouletteItemProps> = ({ slots, totalSum, style, index }) => {
  const [seed] = useState(() => getRandomIntInclusive(1, totalSum));

  const slot = useMemo(() => {
    const seed = getRandomIntInclusive(1, totalSum);
    let tempSum = 0;

    for (const slot of slots) {
      tempSum += slot.amount ?? 0;

      if (seed <= tempSum) {
        return slot;
      }
    }

    return null;
  }, [slots, totalSum]);

  const chance = useMemo(() => getSlotChance(slot?.amount, totalSum), [slot?.amount, totalSum]);
  const name = slot?.name ?? 'ERROR';

  return (
    <div style={style} className='line-roulette-item'>
      <div className='line-roulette-item-content'>
        <div>{`${name} | ${index}`}</div>
        <div className='line-roulette-item-chance'>{chance}</div>
      </div>
      <div className='line-roulette-item-divider' />
    </div>
  );
};

export default RouletteItem;
