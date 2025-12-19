import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Socket, io } from 'socket.io-client';

import { overlaysControllerGetOptions, overlaysControllerGetQueryKey } from '@api/openapi/@tanstack/react-query.gen';
import { client } from '@api/openapi/client.gen';
import { AuctionOverlayDto, WheelOverlayDto } from '@api/openapi/types.gen';
import { Broadcasting } from '@domains/broadcasting/model/types';
import { getSocketIOUrl } from '@utils/url.utils';

import AuctionOverlayPage from '../../../Auction/ui/View';
import WheelOverlayPage from '../../../Wheel/ui/View';
import OverlayStatusMessage from '../OverlayStatusMessage';

interface OverlayViewPageProps {}

const OverlayViewPage: FC<OverlayViewPageProps> = () => {
  const [socketLoading, setSocketLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();
  const isTokenInitialized = useRef(false);

  // Extract token from URL query parameters and overlay ID from route params
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();

  const token = searchParams.get('token');

  // Setup authorization header for API requests
  if (!isTokenInitialized.current && token) {
    client.instance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    isTokenInitialized.current = true;
  }

  // Fetch overlay data
  const overlayQuery = useQuery({
    ...overlaysControllerGetOptions({ path: { id: id! } }),
    enabled: !!id && !!token,
  });

  const overlay = overlayQuery.data;

  // Setup socket connection
  useEffect(() => {
    if (!token) {
      return;
    }

    setSocketLoading(true);
    const socket = io(`${getSocketIOUrl()}/broadcasting`, { auth: { token } });

    console.log('Overlay socket connecting...');

    socket.on('dataUpdate', (data: Broadcasting.DataUpdatePayload) => {
      console.log('data', data);
      if (data.dataType === `overlays:${id}`) {
        queryClient.setQueryData(overlaysControllerGetQueryKey({ path: { id: id! } }), data.data);
      }
    });

    socket.on('connect', () => {
      setSocketLoading(false);
      setSocket(socket);
      socket.emit('listen', [`overlays:${id}`]);
      console.log('Overlay socket connected successfully');
    });

    socket.on('disconnect', () => {
      console.log('Overlay socket disconnected');
    });

    // Cleanup
    return () => {
      socket?.off('auth_error');
      socket?.off('connect');
      socket?.off('disconnect');
      socket?.off('dataUpdate');
      socket?.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
  }, []);

  // Show loading state while fetching overlay data
  if (overlayQuery.isLoading || socketLoading) {
    return <OverlayStatusMessage type='loading' messageKey='loading' />;
  }

  // Show error state if overlay fetch failed
  if (overlayQuery.isError || !overlay || !socket) {
    return <OverlayStatusMessage type='error' messageKey='error' />;
  }

  const { origin, size } = overlay.transform ?? { origin: { X: 0, Y: 0 }, size: { width: '100%', height: '100%' } };

  return (
    <div style={{ position: 'absolute', top: origin.Y, left: origin.X, width: size.width, height: size.height }}>
      {overlay.type === 'Auction' ? (
        <AuctionOverlayPage socket={socket} overlay={overlay as AuctionOverlayDto} />
      ) : (
        <WheelOverlayPage socket={socket} overlay={overlay as WheelOverlayDto} />
      )}
    </div>
  );
};

export default OverlayViewPage;
