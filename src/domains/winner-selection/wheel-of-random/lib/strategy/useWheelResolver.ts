import { RefObject, useMemo } from 'react';

import { WheelFormat } from '@constants/wheel.ts';

import useBattleRoyale from '../../Duel/lib/useBattleRoyale';
import useNormalWheel from '../../lib/strategy/useNormalWheel';
import useRuntimeDropout from '../../Dropout/lib/useRuntimeDropout';
import useSimulationDropout from '../../Dropout/lib/useSimulationDropout';
import { DropoutVariant, WheelController } from '../../BaseWheel/BaseWheel';

interface Props {
  format: WheelFormat;
  dropoutVariant: DropoutVariant;
  controller: RefObject<WheelController>;
}

const useWheelResolver = ({ format, dropoutVariant, controller }: Props): Wheel.FormatHook => {
  const normalWheel = useNormalWheel();
  const battleRoyal = useBattleRoyale(controller);
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
