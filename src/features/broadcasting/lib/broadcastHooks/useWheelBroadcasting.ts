import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';

import { broadcastingControllerBroadcastWheelMutation } from '@api/openapi/@tanstack/react-query.gen';
import { RootState } from '@reducers/index';
import { WheelItem } from '@models/wheel.model';
import { Broadcasting } from '@features/broadcasting/model/types';

interface WheelBroadcastingHooks {
  broadcastParticipantsChanged: (participants: WheelItem[]) => void;
  broadcastSpin: (angle: number, duration: number, winner: string) => void;
}

export const useWheelBroadcasting = (): WheelBroadcastingHooks => {
  const isBroadcastEnabled = useSelector((state: RootState) => state.broadcasting.broadcastingData.wheel);

  const { mutate: broadcastWheel } = useMutation({
    ...broadcastingControllerBroadcastWheelMutation(),
  });

  const broadcastParticipantsChanged = useCallback(
    (participants: WheelItem[]) => {
      if (!isBroadcastEnabled) return;

      const wheelParticipants: Broadcasting.WheelParticipant[] = participants.map((item) => ({
        name: item.name,
        id: item.id.toString(),
        color: item.color || '#FF0000', // Default color if not provided
        amount: item.amount || 0,
      }));

      broadcastWheel({
        body: {
          data: {
            type: 'participants-changed',
            participants: wheelParticipants,
          },
        },
      });
    },
    [broadcastWheel, isBroadcastEnabled],
  );

  const broadcastSpin = useCallback(
    (angle: number, duration: number, winner: string) => {
      if (!isBroadcastEnabled) return;

      broadcastWheel({
        body: {
          data: {
            type: 'spin',
            angle,
            duration,
            winner,
          },
        },
      });
    },
    [broadcastWheel, isBroadcastEnabled],
  );

  return useMemo(
    () => ({
      broadcastParticipantsChanged,
      broadcastSpin,
    }),
    [broadcastParticipantsChanged, broadcastSpin],
  );
};
