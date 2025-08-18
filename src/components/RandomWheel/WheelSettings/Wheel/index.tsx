import { Key, useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import BaseWheel, { BaseWheelProps } from '@components/BaseWheel/BaseWheel.tsx';
import { WheelItem } from '@models/wheel.model.ts';
import { WheelFormat } from '@constants/wheel';
import { shuffle } from '@utils/common.utils.ts';

interface Props extends Pick<BaseWheelProps<any>, 'controller'> {
  shouldShuffle?: boolean;
  deleteItem?: (id: Key) => void;
  finalItems: WheelItem[];
}

const WheelComponent = ({ controller, shouldShuffle, deleteItem, finalItems }: Props) => {
  const coreImage = useWatch<Wheel.Settings>({ name: 'coreImage' });
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const { setValue } = useFormContext<Wheel.Settings>();
  const onCoreImageChange = useCallback(
    (image: string) => {
      setValue('coreImage', image);
    },
    [setValue],
  );

  const shuffledItems = useMemo(() => (shouldShuffle ? shuffle(finalItems) : finalItems), [finalItems, shouldShuffle]);

  return (
    <BaseWheel
      controller={controller}
      coreImage={coreImage || 'https://cdn.7tv.app/emote/60db33899a9fbb6acd26b151/4x'}
      deleteItem={deleteItem}
      items={shuffledItems}
      onCoreImageChange={onCoreImageChange}
      dropOut={format === WheelFormat.Dropout}
    />
  );
};

export default WheelComponent;
