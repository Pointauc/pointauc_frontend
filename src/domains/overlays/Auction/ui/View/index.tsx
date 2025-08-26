import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { AuctionOverlayDto } from '@api/openapi/types.gen';
import { Broadcasting } from '@domains/broadcasting/model/types';
import { Slot } from '@models/slot.model';

import OverlayStatusMessage from '../../../ui/View/OverlayStatusMessage';
import Layout, { TimerProps } from '../Layout/Layout';

const generateMockLots = (count: number): Slot[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${index + 1}`,
    name: `Lot ${index + 1}`,
    amount: Math.floor(Math.random() * 1000) + 100,
    extra: Math.floor(Math.random() * 500) + 50,
    fastId: index + 1,
  }));
};

interface AuctionOverlayPageProps {
  socket: Socket;
  overlay: AuctionOverlayDto;
}

const defaultTimer: TimerProps = { state: 'paused', timeLeft: 1000 * 60 * 10 };

const AuctionOverlayPage: FC<AuctionOverlayPageProps> = ({ socket, overlay }) => {
  const [lots, setLots] = useState<Slot[]>([]);
  const [rules, setRules] = useState<string>('');
  const [timer, setTimer] = useState<TimerProps>(defaultTimer);
  const [hasReceivedLotsData, setHasReceivedLotsData] = useState(false);

  const previousScopes = useRef<Broadcasting.DataType[]>([]);

  const scopesToListen = useMemo<Broadcasting.DataType[]>(() => {
    return [
      overlay.settings.showTable ? 'lots' : null,
      overlay.settings.showRules ? 'rules' : null,
      overlay.settings.showTimer ? 'timer' : null,
    ].filter(Boolean) as Broadcasting.DataType[];
  }, [overlay.settings.showTable, overlay.settings.showRules, overlay.settings.showTimer]);

  useEffect(() => {
    socket.on('dataUpdate', (data: Broadcasting.DataUpdatePayload) => {
      switch (data.dataType) {
        case 'lots':
          setLots(
            data.data.map((lot) => ({
              id: lot.id,
              name: lot.name,
              amount: lot.amount,
              extra: 0,
              fastId: lot.fastId,
            })),
          );
          setHasReceivedLotsData(true);
          break;
        case 'timer':
          setTimer(data.data);
          break;
        case 'rules':
          setRules(data.data.text);
          break;
      }
    });

    return () => {
      socket.off('dataUpdate');
    };
  }, [socket]);

  useEffect(() => {
    const newScopes = scopesToListen.filter((scope) => !previousScopes.current.includes(scope));
    const removedScopes = previousScopes.current.filter((scope) => !scopesToListen.includes(scope));

    if (newScopes.length > 0) {
      socket.emit('listen', newScopes);
    }

    if (removedScopes.length > 0) {
      socket.emit('unlisten', removedScopes);
    }

    previousScopes.current = scopesToListen;
  }, [socket, scopesToListen]);

  // Show status message if we're supposed to show the table but haven't received lots data yet
  if (overlay.settings.showTable && !hasReceivedLotsData) {
    return (
      <OverlayStatusMessage
        type='info'
        message='Overlay is waiting for data... Please open the Auction page on the main website to initialize the overlay.'
      />
    );
  }

  return (
    <Layout
      lots={
        overlay.settings.showTable
          ? { items: lots, autoScroll: overlay.settings.autoscroll, scrollSpeed: overlay.settings.autoscrollSpeed }
          : undefined
      }
      rules={overlay.settings.showRules ? { rules } : undefined}
      timer={overlay.settings.showTimer ? timer : undefined}
      transparency={overlay.settings.backgroundTransparency}
    />
  );
};

export default AuctionOverlayPage;
