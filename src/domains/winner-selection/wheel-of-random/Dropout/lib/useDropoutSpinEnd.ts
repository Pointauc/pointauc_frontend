import { Dispatch, Key, RefObject, SetStateAction, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { WheelItem } from '@models/wheel.model';
import { interpolate } from '@utils/dataType/function.utils.ts';
import { ID } from '@components/Bracket/components/model';

import { WheelController } from '../../BaseWheel/BaseWheel';

interface Props {
  controller: RefObject<WheelController | null>;
  setItems: Dispatch<SetStateAction<WheelItem[] | undefined>>;
}

export const animateDropout = async (controller: RefObject<WheelController | null>, id: ID, spinTime: number) => {
  const showAnimation = spinTime >= 3;

  if (showAnimation) {
    const duration = interpolate(200, 500, (spinTime - 3) / 10);
    await controller.current?.eatAnimation(id, duration);
  }

  return new Promise<void>((resolve) => {
    setTimeout(
      async () => {
        resolve();
      },
      showAnimation ? 300 : 350,
    );
  });
};

const useDropoutSpinEnd = ({ controller, setItems }: Props) => {
  const spinTime = useWatch<Wheel.Settings>({ name: 'spinTime' });

  return useCallback(
    async ({ id }: WheelItem) => {
      await animateDropout(controller, id, spinTime);
      setItems((items) => items?.filter((item) => item.id !== id));
    },
    [controller, setItems, spinTime],
  );
};

export default useDropoutSpinEnd;
