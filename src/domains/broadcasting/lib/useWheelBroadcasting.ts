import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';

import { broadcastingControllerBroadcastWheelMutation } from '@api/openapi/@tanstack/react-query.gen';
import { RootState } from '@reducers/index';
import { WheelItemWithMetadata } from '@models/wheel.model';
import { WheelParticipantDto, WheelSettingsChangedDto } from '@api/openapi/types.gen';
import { skipSameValueCalls } from '@utils/dataType/function.utils';
import { WheelFormat } from '@constants/wheel';

import { store } from '../../../main';
import { Broadcasting } from '../model/types';

export type WheelBroadcastSettings = Omit<WheelSettingsChangedDto, 'type'>;

interface WheelBroadcastingProps {
  settings?: Pick<Wheel.Settings, 'format' | 'coreImage'>;
  participants?: WheelItemWithMetadata[];
}

export const useBroadcastSpin = () => {
  const isBroadcastEnabled = useSelector((state: RootState) => state.broadcasting.broadcastingData.wheel);

  const { mutate: broadcastWheel } = useMutation({
    ...broadcastingControllerBroadcastWheelMutation(),
  });

  return useCallback(
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
};

export const useWheelBroadcasting = ({ settings, participants }: WheelBroadcastingProps) => {
  const isBroadcastEnabled = useSelector((state: RootState) => state.broadcasting.broadcastingData.wheel);
  const socket = useSelector((state: RootState) => state.broadcasting.socket);

  const { mutate: broadcastWheel } = useMutation({
    ...broadcastingControllerBroadcastWheelMutation(),
  });

  const broadcastParticipantsChanged = useCallback(
    (participants?: WheelItemWithMetadata[]) => {
      if (!isBroadcastEnabled || !participants) return;

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

  useEffect(() => {
    if (socket) {
      const handleUpdatesRequested = (data: Broadcasting.DataRequestPayload) => {
        if (data.dataType === 'wheel') {
          broadcastParticipantsChanged(participants);
        }
      };

      if (store.getState().broadcasting.broadcastingData.wheel) {
        broadcastParticipantsChanged(participants);
      }

      socket.on('updatesRequested', handleUpdatesRequested);
      return () => {
        socket.off('updatesRequested', handleUpdatesRequested);
      };
    }
  }, [socket, broadcastParticipantsChanged, participants]);

  const broadcastUniqueSettingsChanged = useMemo(() => {
    return skipSameValueCalls(
      (settings?: WheelBroadcastSettings) => {
        if (!settings) return;

        broadcastWheel({
          body: {
            data: {
              type: 'settings',
              ...settings,
            },
          },
        });
      },
      { compareNested: true },
    );
  }, [broadcastWheel]);

  const parseSettingsForBroadcast = useCallback((settings?: Partial<Wheel.Settings>) => {
    return {
      format: settings?.format ?? WheelFormat.Default,
      coreImage: settings?.coreImage ?? undefined,
    };
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdatesRequested = (data: Broadcasting.DataRequestPayload) => {
        if (data.dataType === 'wheel') {
          broadcastUniqueSettingsChanged.callThrough(parseSettingsForBroadcast(settings));
        }
      };

      if (store.getState().broadcasting.broadcastingData.wheel) {
        broadcastUniqueSettingsChanged.call(parseSettingsForBroadcast(settings));
      }

      socket.on('updatesRequested', handleUpdatesRequested);
      return () => {
        socket.off('updatesRequested', handleUpdatesRequested);
      };
    }
  }, [socket, broadcastUniqueSettingsChanged, settings, parseSettingsForBroadcast]);
};
