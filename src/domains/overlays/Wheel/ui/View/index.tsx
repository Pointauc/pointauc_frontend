import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { Broadcasting } from '@domains/broadcasting/model/types';
import { WheelOverlayDto, WheelSettingsChangedDto } from '@api/openapi/types.gen';
import { WheelController } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel';
import { WheelFormat } from '@constants/wheel';
import { EventQueue } from '@shared/lib/event-queue';
import { WheelItemWithMetadata } from '@models/wheel.model';

import OverlayStatusMessage from '../../../ui/View/OverlayStatusMessage';
import { WheelLayout } from '../Layout';

interface WheelOverlayPageProps {
  socket: Socket | null;
  overlay: WheelOverlayDto;
}

const WheelOverlayPage: FC<WheelOverlayPageProps> = ({ socket, overlay }) => {
  const wheelRef = useRef<WheelController | null>(null);
  const [participants, setParticipants] = useState<WheelItemWithMetadata[]>([]);
  const [format, setFormat] = useState<WheelFormat>(WheelFormat.Default);
  const [coreImage, setCoreImage] = useState<string | undefined>(undefined);
  const [hasReceivedParticipantsData, setHasReceivedParticipantsData] = useState(false);

  const eventsQueue = useMemo(() => new EventQueue(), []);

  const handleSettingsUpdate = useCallback((data: WheelSettingsChangedDto) => {
    if (data.format !== undefined) {
      setFormat((prev) => {
        if (data.format !== prev) {
          requestAnimationFrame(() => {
            wheelRef.current?.clearWinner();
          });
        }

        return data.format ?? prev;
      });
    }

    if (data.coreImage !== undefined) {
      setCoreImage(data.coreImage);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Subscribe to wheel updates
    socket.emit('listen', ['wheel']);

    // Handle wheel data updates
    const handleDataUpdate = ({ data, dataType }: Broadcasting.DataUpdatePayload) => {
      if (dataType === 'wheel') {
        switch (data.type) {
          case 'participants-changed':
            eventsQueue.addEvent(() => {
              setParticipants(data.participants as WheelItemWithMetadata[]);
              setHasReceivedParticipantsData(true);
            });
            break;
          case 'spin':
            eventsQueue.addEvent(async () => {
              await wheelRef.current?.spin?.({
                distance: data.angle,
                duration: data.duration,
                winner: data.winner === '' ? undefined : data.winner,
              });
            });
            break;
          case 'settings':
            handleSettingsUpdate(data);
            break;
        }
      }
    };

    socket.on('dataUpdate', handleDataUpdate);

    // Cleanup
    return () => {
      socket.off('dataUpdate', handleDataUpdate);
      socket.emit('unlisten', ['wheel']);
    };
  }, [socket, eventsQueue, handleSettingsUpdate]);

  const uniqueParticipants = useMemo(() => {
    const uniqueIds = new Set();
    return participants.filter((participant) => {
      if (uniqueIds.has(participant.id)) return false;
      uniqueIds.add(participant.id);
      return true;
    });
  }, [participants]);

  // Show status message if we're supposed to show wheel/participants but haven't received data yet
  if ((overlay.settings.showWheel || overlay.settings.showParticipants) && !hasReceivedParticipantsData) {
    return (
      <OverlayStatusMessage
        type='info'
        message='Overlay is waiting for data... Please open the Wheel page on the main website to initialize the overlay.'
      />
    );
  }

  return (
    <WheelLayout
      overlay={overlay}
      participants={uniqueParticipants}
      format={format}
      coreImage={coreImage}
      wheelRef={wheelRef}
    />
  );
};

export default WheelOverlayPage;
