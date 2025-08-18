import { FC, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import RandomWheel, { RandomWheelController } from '@components/RandomWheel/RandomWheel';
import { WheelOverlayDto } from '@api/openapi/types.gen';
import { Broadcasting } from '@features/broadcasting/model/types';

interface WheelOverlayPageProps {
  socket: Socket | null;
  overlay: WheelOverlayDto;
}

const WheelOverlayPage: FC<WheelOverlayPageProps> = ({ socket, overlay }) => {
  const [participants, setParticipants] = useState<Broadcasting.WheelParticipant[]>([]);
  const wheelRef = useRef<RandomWheelController | null>(null);

  useEffect(() => {
    if (!socket) return;

    console.log('Setting up wheel-specific socket listeners');

    // Subscribe to wheel updates
    socket.emit('listen', ['wheel']);

    // Handle wheel data updates
    const handleDataUpdate = (data: Broadcasting.DataUpdatePayload) => {
      if (data.dataType === 'wheel') {
        switch (data.data.type) {
          case 'participants-changed':
            setParticipants(data.data.participants);
            break;
          case 'spin':
            // Trigger spin animation
            if (wheelRef.current) {
              wheelRef.current?.spin?.({ seed: data.data.angle, duration: data.data.duration });
            }
            break;
        }
      }
    };

    socket.on('dataUpdate', handleDataUpdate);

    // Handle listen response
    const handleListenResponse = (response: any) => {
      console.log('Wheel listen response:', response);
    };

    socket.on('listenResponse', handleListenResponse);

    // Cleanup
    return () => {
      socket.off('dataUpdate', handleDataUpdate);
      socket.off('listenResponse', handleListenResponse);
      socket.emit('unlisten', ['wheel']);
    };
  }, [socket]);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <RandomWheel items={participants} wheelRef={wheelRef} />
    </div>
  );
};

export default WheelOverlayPage;
