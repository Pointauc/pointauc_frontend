import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { Slot } from '@models/slot.model';
import { AuctionOverlayDto } from '@api/openapi/types.gen';
import { Broadcasting } from '@features/broadcasting/model/types';

import Layout, { TimerProps } from './ui/Layout/Layout';

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
          break;
        case 'timer':
          setTimer(data.data);
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

  return (
    <Layout
      lots={overlay.settings.showTable ? { items: lots, autoScroll: true, scrollSpeed: 100 } : undefined}
      rules={overlay.settings.showRules ? { rules: '' } : undefined}
      timer={overlay.settings.showTimer ? timer : undefined}
      darkAlpha={0.5}
    />
  );
};

export default AuctionOverlayPage;
