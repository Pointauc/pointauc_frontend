import { useMemo } from 'react';

import { WheelFormat } from '@constants/wheel.ts';

import { DropoutVariant } from '../../BaseWheel/DropoutVariant';
import useBattleRoyale from '../../Duel/lib/useBattleRoyale';
import useNormalWheel from '../../lib/strategy/useNormalWheel';
import useRuntimeDropout from '../../Dropout/lib/useRuntimeDropout';
import useSimulationDropout from '../../Dropout/lib/useSimulationDropout';
import usePointerDropout from '../../Dropout/lib/usePointerDropout';

import { WheelResolverProps } from './types';

const useWheelResolver = ({
  format,
  dropoutVariant,
  controller,
  isTicketRevealed,
  resetTicket,
}: WheelResolverProps): Wheel.FormatHook => {
  const normalWheel = useNormalWheel({ isTicketRevealed, resetTicket });
  const battleRoyal = useBattleRoyale(controller);
  const runtimeDropout = useRuntimeDropout(controller);
  const simulationDropout = useSimulationDropout({ controller, isTicketRevealed, resetTicket });
  const pointerDropout = usePointerDropout(controller);

  return useMemo(() => {
    if (format === WheelFormat.Dropout) {
      switch (dropoutVariant) {
        case DropoutVariant.Classic:
          return runtimeDropout;
        case DropoutVariant.New:
          return simulationDropout;
        case DropoutVariant.Pointer:
          return pointerDropout;
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
  }, [format, dropoutVariant, runtimeDropout, simulationDropout, pointerDropout, normalWheel, battleRoyal]);
};

export default useWheelResolver;
