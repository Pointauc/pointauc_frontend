import React, { Key } from 'react';
import { useWatch } from 'react-hook-form';

import BaseWheel, { BaseWheelProps } from '@components/BaseWheel/BaseWheel.tsx';
import { WheelItem } from '@models/wheel.model.ts';

interface Props extends Pick<BaseWheelProps<any>, 'controller'> {
  shuffle?: boolean;
  deleteItem?: (id: Key) => void;
  finalItems: WheelItem[];
}

const WheelComponent = ({ controller, shuffle, deleteItem, finalItems }: Props) => {
  const coreImage = useWatch<Wheel.Settings>({ name: 'coreImage' });

  return (
    <BaseWheel
      controller={controller}
      background={coreImage || 'https://cdn.7tv.app/emote/60db33899a9fbb6acd26b151/4x'}
      deleteItem={deleteItem}
      isShuffle={shuffle}
      items={finalItems}
    />
  );
};

export default WheelComponent;
