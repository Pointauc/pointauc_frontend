import { FC, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getSocketIOUrl } from '@utils/url.utils';
import { overlaysControllerGetOptions, overlaysControllerGetQueryKey } from '@api/openapi/@tanstack/react-query.gen';
import { client } from '@api/openapi/client.gen';
import { AuctionOverlayDto, WheelOverlayDto } from '@api/openapi/types.gen';
import { Broadcasting } from '@features/broadcasting/model/types';

import OverlayStatusMessage from './shared/OverlayStatusMessage';
import AuctionOverlayPage from './Auction';
import WheelOverlayPage from './Wheel';

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

  // Show loading state while fetching overlay data
  if (overlayQuery.isLoading || socketLoading) {
    return <OverlayStatusMessage type='loading' message='Loading overlay...' />;
  }

  // Show error state if overlay fetch failed
  if (overlayQuery.isError || !overlay || !socket) {
    return (
      <OverlayStatusMessage type='error' message='Error loading overlay. Please check your connection and try again.' />
    );
  }

  // Render appropriate overlay component based on type
  switch (overlay.type) {
    case 'Auction':
      return <AuctionOverlayPage socket={socket} overlay={overlay as AuctionOverlayDto} />;
    case 'Wheel':
      return <WheelOverlayPage socket={socket} overlay={overlay as WheelOverlayDto} />;
    default:
      return <OverlayStatusMessage type='error' message={`Unknown overlay type: ${overlay.type}`} />;
  }
};

export default OverlayViewPage;
