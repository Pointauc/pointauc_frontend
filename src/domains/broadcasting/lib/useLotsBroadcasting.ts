import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { throttle } from '@tanstack/react-pacer';

import { broadcastingControllerBroadcastLotsMutation } from '@api/openapi/@tanstack/react-query.gen';
import { Slot } from '@models/slot.model';
import { RootState } from '@reducers/index';

import { Broadcasting } from '../model/types';
import { store } from '../../../main';

export const useLotsBroadcasting = () => {
  const lots = useSelector((state: RootState) => state.slots.slots);
  const socket = useSelector((state: RootState) => state.broadcasting.socket);

  const { mutate: broadcastLots } = useMutation({
    ...broadcastingControllerBroadcastLotsMutation(),
  });

  const broadcastLotsWithCooldown = useMemo(
    () =>
      throttle(
        (lots: Slot[]) => {
          if (!store.getState().broadcasting.broadcastingData.lots) return;

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
        },
        { wait: 1000, trailing: true, leading: false },
      ),
    [broadcastLots],
  );

  useEffect(() => {
    if (socket) {
      const handleUpdatesRequested = (data: Broadcasting.DataRequestPayload) => {
        if (data.dataType === 'lots') {
          broadcastLotsWithCooldown(store.getState().slots.slots);
        }
      };

      socket.on('updatesRequested', handleUpdatesRequested);
      return () => {
        socket.off('updatesRequested', handleUpdatesRequested);
      };
    }
  }, [socket, broadcastLotsWithCooldown]);

  useEffect(() => {
    broadcastLotsWithCooldown(lots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lots]);
};
