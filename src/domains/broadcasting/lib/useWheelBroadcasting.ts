import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';

import { broadcastingControllerBroadcastWheelMutation } from '@api/openapi/@tanstack/react-query.gen';
import { RootState } from '@reducers/index';
import { WheelItemWithMetadata } from '@models/wheel.model';
import { WheelParticipantDto, WheelSettingsChangedDto } from '@api/openapi/types.gen';

export type WheelBroadcastSettings = Omit<WheelSettingsChangedDto, 'type'>;

interface WheelBroadcastingHooks {
  broadcastParticipantsChanged: (participants: WheelItemWithMetadata[]) => void;
  broadcastSpin: (angle: number, duration: number, winner: string) => void;
  broadcastSettingsChanged: (settings: WheelBroadcastSettings) => void;
}

export const useWheelBroadcasting = (): WheelBroadcastingHooks => {
  const isBroadcastEnabled = useSelector((state: RootState) => state.broadcasting.broadcastingData.wheel);

  const { mutate: broadcastWheel } = useMutation({
    ...broadcastingControllerBroadcastWheelMutation(),
  });

  const broadcastParticipantsChanged = useCallback(
    (participants: WheelItemWithMetadata[]) => {
      if (!isBroadcastEnabled) return;

      const wheelParticipants: WheelParticipantDto[] = participants.map((item) => ({
        name: item.name,
        id: item.id.toString(),
        color: item.color || '#FF0000',
        amount: item.amount || 0,
        originalAmount: item.originalAmount || null,
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

  const broadcastSettingsChanged = useCallback(
    (settings: WheelBroadcastSettings) => {
      broadcastWheel({
        body: {
          data: {
            type: 'settings',
            ...settings,
          },
        },
      });
    },
    [broadcastWheel],
  );

  return useMemo(
    () => ({
      broadcastParticipantsChanged,
      broadcastSpin,
      broadcastSettingsChanged,
    }),
    [broadcastParticipantsChanged, broadcastSpin, broadcastSettingsChanged],
  );
};
