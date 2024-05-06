import { Dispatch, RefObject, SetStateAction, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { WheelController } from '@components/BaseWheel/BaseWheel.tsx';
import { WheelItem } from '@models/wheel.model.ts';
import { interpolate } from '@utils/dataType/function.utils.ts';

interface Props {
  controller: RefObject<WheelController>;
  setItems: Dispatch<SetStateAction<WheelItem[] | undefined>>;
}

const useDropoutSpinEnd = ({ controller, setItems }: Props) => {
  const spinTime = useWatch<Wheel.Settings>({ name: 'spinTime' });

  return useCallback(
    async ({ id }: WheelItem) => {
      const showAnimation = spinTime >= 3;

      if (showAnimation) {
        const duration = interpolate(200, 500, (spinTime - 3) / 10);
        await controller.current?.eatAnimation(id, duration);
      }

      return new Promise<void>((resolve) => {
        setTimeout(
          async () => {
            setItems((items) => items?.filter((item) => item.id !== id));
            resolve();
          },
          showAnimation ? 300 : 350,
        );
      });
    },
    [controller, setItems, spinTime],
  );
};

export default useDropoutSpinEnd;
