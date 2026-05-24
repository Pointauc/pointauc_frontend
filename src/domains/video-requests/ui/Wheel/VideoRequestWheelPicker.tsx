import { Text } from '@mantine/core';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import RandomWheel from '@domains/winner-selection/wheel-of-random/ui/FullWheelUI';
import { getWeightedRequestAmount } from '@domains/video-requests/lib/requestSelection';
import { VideoRequest } from '@domains/video-requests/model/types';
import { WheelItem } from '@models/wheel.model';

interface VideoRequestWheelItem extends WheelItem {
  requestId: string;
}

interface VideoRequestWheelPickerProps {
  requests: VideoRequest[];
  onWin: (requestId: string) => void;
}

const wheelColors = ['#22d3ee', '#a78bfa', '#f87171', '#34d399', '#fbbf24', '#60a5fa'];

const buildWheelItems = (requests: VideoRequest[]): VideoRequestWheelItem[] =>
  requests.map((request, index) => ({
    id: request.id,
    requestId: request.id,
    name: request.metadata.title ?? request.parsedVideoReference.canonicalUrl,
    displayName: request.metadata.title ?? request.parsedVideoReference.canonicalUrl,
    amount: getWeightedRequestAmount(request),
    color: wheelColors[index % wheelColors.length],
  }));

const VideoRequestWheelPicker = ({ requests, onWin }: VideoRequestWheelPickerProps) => {
  const { t } = useTranslation();
  const wheelContainerRef = useRef<HTMLDivElement | null>(null);
  const wheelItems = useMemo(() => buildWheelItems(requests), [requests]);

  useEffect(() => {
    if (wheelItems.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const submitButton = wheelContainerRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]');
      submitButton?.click();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [wheelItems.length]);

  return (
    <div ref={wheelContainerRef} className='h-full min-h-[28rem] bg-paper-950 p-4'>
      {wheelItems.length > 0 ? (
        <RandomWheel<VideoRequestWheelItem>
          items={wheelItems}
          shouldShuffle={false}
          elements={{ import: false, preview: false }}
          onWin={(winner) => onWin(winner.requestId)}
        />
      ) : (
        <div className='flex h-full items-center justify-center'>
          <Text className='text-dimmed'>{t('videoRequests.queue.emptyTitle')}</Text>
        </div>
      )}
    </div>
  );
};

export default VideoRequestWheelPicker;
