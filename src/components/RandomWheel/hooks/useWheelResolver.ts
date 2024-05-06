import { RefObject, useMemo } from 'react';

import useBattleRoyal from '@components/RandomWheel/hooks/useBattleRoyal.tsx';
import useNormalWheel from '@components/RandomWheel/hooks/useNormalWheel.ts';
import useRuntimeDropout from '@components/RandomWheel/hooks/useRuntimeDropout.ts';
import useSimulationDropout from '@components/RandomWheel/hooks/useSimulationDropout.ts';
import { WheelFormat } from '@constants/wheel.ts';
import { DropoutVariant, WheelController } from '@components/BaseWheel/BaseWheel.tsx';

interface Props {
  format: WheelFormat;
  dropoutVariant: DropoutVariant;
  controller: RefObject<WheelController>;
}

const useWheelResolver = ({ format, dropoutVariant, controller }: Props): Wheel.FormatHook => {
  const normalWheel = useNormalWheel();
  const battleRoyal = useBattleRoyal(controller);
  const runtimeDropout = useRuntimeDropout(controller);
  const simulationDropout = useSimulationDropout(controller);

  return useMemo(() => {
    if (format === WheelFormat.Dropout) {
      switch (dropoutVariant) {
        case DropoutVariant.Classic:
          return runtimeDropout;
        case DropoutVariant.New:
          return simulationDropout;
        default:
          return runtimeDropout;
      }
    }

    switch (format) {
      case WheelFormat.Default:
        return normalWheel;
      case WheelFormat.BattleRoyal:
        return battleRoyal;
      default:
        return normalWheel;
    }
  }, [format, dropoutVariant, runtimeDropout, simulationDropout, normalWheel, battleRoyal]);
};

export default useWheelResolver;
