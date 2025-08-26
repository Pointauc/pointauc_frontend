import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';

import { broadcastingControllerBroadcastLotsMutation } from '@api/openapi/@tanstack/react-query.gen';
import { RootState } from '@reducers/index';
import { timedFunction } from '@utils/dataType/function.utils';
import { Slot } from '@models/slot.model';

export const useLotsBroadcasting = () => {
  const lots = useSelector((state: RootState) => state.slots.slots);
  const isBroadcastEnabled = useSelector((state: RootState) => state.broadcasting.broadcastingData.lots);

  const { mutate: broadcastLots } = useMutation({
    ...broadcastingControllerBroadcastLotsMutation(),
  });

  const broadcastLotsWithCooldown = useMemo(
    () =>
      timedFunction((lots: Slot[]) => {
        broadcastLots({
          body: {
            data: lots.map((lot) => ({
              fastId: lot.fastId,
              id: lot.id,
              name: lot.name,
              amount: lot.amount,
            })),
          },
        });
      }, 1000),
    [broadcastLots],
  );

  useEffect(() => {
    if (isBroadcastEnabled) {
      broadcastLotsWithCooldown(lots);
    }
  }, [isBroadcastEnabled, broadcastLotsWithCooldown, lots]);
};
