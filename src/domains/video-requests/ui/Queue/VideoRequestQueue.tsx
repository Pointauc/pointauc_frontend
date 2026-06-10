import clsx from 'clsx';
import { Badge, Button, Divider, Group, ScrollArea, SegmentedControl, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconArrowBarToUp, IconPlayerPlay, IconRestore, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VideoRequest, VideoRequestHistoryRecord } from '@domains/video-requests/model/types';
import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';
import VideoRequestCard from '@domains/video-requests/ui/Queue/VideoRequestCard';
import { formatDuration } from '@domains/video-requests/ui/lib/videoRequestUiFormatters';

import IntegrationListenerButtonGroup from '../Controls/IntegrationListenerButtonGroup';

type VideoRequestQueueTab = 'queue' | 'history';

interface VideoRequestQueueProps {
  requests: VideoRequest[];
  history: VideoRequestHistoryRecord[];
  currentRequestId: string | null;
  listener: ReturnType<typeof useVideoRequestListener>;
  isClearing: boolean;
  isClearingHistory: boolean;
  isTheaterMode?: boolean;
  onPlay: (id: string) => void;
  onMoveToTop: (id: string) => void;
  onRemove: (id: string) => void;
  onRestoreHistory: (id: string) => void;
  onPlayHistory: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onClear: () => void;
  onClearHistory: () => void;
}

const VideoRequestQueue = ({
  requests,
  history,
  currentRequestId,
  listener,
  isClearing,
  isClearingHistory,
  isTheaterMode = false,
  onPlay,
  onMoveToTop,
  onRemove,
  onRestoreHistory,
  onPlayHistory,
  onDeleteHistory,
  onClear,
  onClearHistory,
}: VideoRequestQueueProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<VideoRequestQueueTab>('queue');
  const queueDuration =
    formatDuration(
      requests.reduce((totalDuration, request) => totalDuration + (request.metadata.durationSeconds ?? 0), 0),
    ) ?? '0:00';
  const isQueueTab = activeTab === 'queue';
  const hasVisibleItems = isQueueTab ? requests.length > 0 : history.length > 0;

  const openClearConfirmation = () => {
    if (!isQueueTab) {
      modals.openConfirmModal({
        title: t('videoRequests.history.clearConfirmTitle'),
        children: (
          <Text size='sm'>{t('videoRequests.history.clearConfirmDescription', { count: history.length })}</Text>
        ),
        labels: {
          confirm: t('videoRequests.history.clear'),
          cancel: t('common.cancel'),
        },
        confirmProps: { color: 'red' },
        onConfirm: onClearHistory,
      });
      return;
    }

    modals.openConfirmModal({
      title: t('videoRequests.queue.clearConfirmTitle'),
      children: <Text size='sm'>{t('videoRequests.queue.clearConfirmDescription', { count: requests.length })}</Text>,
      labels: {
        confirm: t('videoRequests.queue.clear'),
        cancel: t('common.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: onClear,
    });
  };

  const renderTabLabel = (tab: VideoRequestQueueTab) => (
    <div className='flex items-center justify-center gap-1.5'>
      <span>{t(`videoRequests.${tab}.title`)}</span>
      {tab === 'queue' && (
        <>
          <Badge size='xs' fw={700} variant='light' color='primary'>
            {requests.length}
          </Badge>
        </>
      )}
      {tab === 'history' && activeTab === 'history' && (
        <Badge size='xs' variant='light' color='gray'>
          {history.length}
        </Badge>
      )}
    </div>
  );

  return (
    <aside
      className={clsx(
        'flex h-full min-h-0 w-full flex-col lg:w-[24rem]',
        isTheaterMode ? 'bg-transparent' : 'bg-transparent',
      )}
    >
      <header
        className={clsx(
          'flex shrink-0 gap-2 px-3 pt-3 pb-2',
          isTheaterMode && 'border-paper-transparent-700 bg-paper-transparent-900 rounded-md border backdrop-blur-md',
        )}
      >
        <IntegrationListenerButtonGroup listener={listener} variant='queue' />
        <SegmentedControl
          fullWidth
          bd={0}
          size='xs'
          className='flex-1 bg-black'
          value={activeTab}
          onChange={(value) => setActiveTab(value as VideoRequestQueueTab)}
          data={[
            { value: 'queue', label: renderTabLabel('queue') },
            { value: 'history', label: renderTabLabel('history') },
          ]}
        />
      </header>

      {!isTheaterMode && <Divider className='border-paper-800' />}

      <ScrollArea className='min-h-0 flex-1' scrollbarSize={8}>
        <div className='flex flex-col'>
          {!hasVisibleItems ? (
            <div className='border-paper-800 rounded-md border border-dashed p-5 text-center'>
              <Text fw={650} className='text-paper-100'>
                {t(isQueueTab ? 'videoRequests.queue.emptyTitle' : 'videoRequests.history.emptyTitle')}
              </Text>
              <Text size='sm' className='text-dimmed mt-1'>
                {t(isQueueTab ? 'videoRequests.queue.emptyDescription' : 'videoRequests.history.emptyDescription')}
              </Text>
            </div>
          ) : isQueueTab ? (
            requests.map((request) => (
              <VideoRequestCard
                key={request.id}
                request={request}
                isActive={request.id === currentRequestId}
                actions={[
                  {
                    label: t('videoRequests.card.play'),
                    icon: <IconPlayerPlay size={16} />,
                    onClick: () => onPlay(request.id),
                  },
                  {
                    label: t('videoRequests.card.moveToTop'),
                    icon: <IconArrowBarToUp size={16} />,
                    onClick: () => onMoveToTop(request.id),
                  },
                  {
                    label: t('videoRequests.card.delete'),
                    icon: <IconTrash size={16} />,
                    color: 'red',
                    onClick: () => onRemove(request.id),
                  },
                ]}
              />
            ))
          ) : (
            history.map((request) => (
              <VideoRequestCard
                key={`${request.id}-${request.completedAt}`}
                request={request}
                showStatus
                actions={[
                  {
                    label: t('videoRequests.card.restore'),
                    icon: <IconRestore size={16} />,
                    onClick: () => onRestoreHistory(request.id),
                  },
                  {
                    label: t('videoRequests.card.play'),
                    icon: <IconPlayerPlay size={16} />,
                    onClick: () => onPlayHistory(request.id),
                  },
                  {
                    label: t('videoRequests.card.delete'),
                    icon: <IconTrash size={16} />,
                    color: 'red',
                    onClick: () => onDeleteHistory(request.id),
                  },
                ]}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {hasVisibleItems && (
        <div className={clsx('shrink-0 p-1', !isTheaterMode && 'border-paper-800 border-t')}>
          <Button
            fullWidth
            variant='transparent'
            color='red'
            size='sm'
            leftSection={<IconTrash size={16} />}
            disabled={!hasVisibleItems}
            loading={isQueueTab ? isClearing : isClearingHistory}
            onClick={openClearConfirmation}
            className='text-red-400 hover:text-red-300'
          >
            {isQueueTab
              ? t('videoRequests.queue.clearWithDuration', { duration: queueDuration })
              : t('videoRequests.history.clearWithCount', { count: history.length })}
          </Button>
        </div>
      )}
    </aside>
  );
};

export default VideoRequestQueue;
