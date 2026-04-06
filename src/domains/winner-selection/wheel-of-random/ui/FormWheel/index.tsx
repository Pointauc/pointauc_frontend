import { Key, useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { WheelItem } from '@models/wheel.model';
import { WheelFormat } from '@constants/wheel';

import BaseWheel, { BaseWheelProps } from '../../BaseWheel/BaseWheel';
import { resolveWheelParts } from '../../BaseWheel/parts/resolveWheelParts';

interface Props extends Pick<BaseWheelProps<any>, 'controller' | 'className' | 'onOptimalSizeChange'> {
  deleteItem?: (id: Key) => void;
  finalItems: WheelItem[];
}

const WheelComponent = ({ controller, deleteItem, finalItems, className, onOptimalSizeChange }: Props) => {
  const coreImage = useWatch<Wheel.Settings>({ name: 'coreImage' });
  const format = useWatch<Wheel.Settings>({ name: 'format' });
  const wheelStyles = useWatch<Wheel.Settings>({ name: 'wheelStyles' });
  const showDeleteConfirmation = useWatch<Wheel.Settings>({ name: 'showDeleteConfirmation' });
  const parts = resolveWheelParts(wheelStyles);
  const { setValue } = useFormContext<Wheel.Settings>();
  const setWheelValue = setValue as (
    name: 'coreImage' | 'showDeleteConfirmation',
    value: string | boolean,
  ) => void;
  const onCoreImageChange = useCallback(
    (image: string) => {
      setWheelValue('coreImage', image);
    },
    [setWheelValue],
  );

  const handleDeleteItem = useCallback(
    (id: Key, showConfirmation?: boolean) => {
      deleteItem?.(id);
      setWheelValue('showDeleteConfirmation', showConfirmation ?? true);
    },
    [deleteItem, setWheelValue],
  );

  return (
    <BaseWheel
      controller={controller}
      coreImage={coreImage || 'https://cdn.7tv.app/emote/60db33899a9fbb6acd26b151/4x'}
      deleteItem={format === WheelFormat.Default ? handleDeleteItem : undefined}
      items={finalItems}
      onCoreImageChange={onCoreImageChange}
      dropOut={format === WheelFormat.Dropout}
      className={className}
      onOptimalSizeChange={onOptimalSizeChange}
      parts={parts}
      showDeleteConfirmation={showDeleteConfirmation}
    />
  );
};

export default WheelComponent;
