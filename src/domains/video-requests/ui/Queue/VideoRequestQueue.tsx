import clsx from 'clsx';
import { Button, Divider, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlaylist, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { VideoRequest } from '@domains/video-requests/model/types';
import IntegrationListenerControls from '@domains/video-requests/ui/Controls/IntegrationListenerControls';
import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';
import VideoRequestCard from '@domains/video-requests/ui/Queue/VideoRequestCard';
import Paper from '@shared/ui/Paper/Paper';

interface VideoRequestQueueProps {
  requests: VideoRequest[];
  currentRequestId: string | null;
  listener: ReturnType<typeof useVideoRequestListener>;
  isClearing: boolean;
  isTheaterMode?: boolean;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const VideoRequestQueue = ({
  requests,
  currentRequestId,
  listener,
  isClearing,
  isTheaterMode = false,
  onRemove,
  onClear,
}: VideoRequestQueueProps) => {
  const { t } = useTranslation();

  const openClearConfirmation = () => {
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

  return (
    <aside
      className={clsx(
        'flex h-full min-h-0 w-full flex-col lg:w-[24rem]',
        isTheaterMode ? 'bg-transparent' : 'border-paper-800 bg-paper-950 border-l',
      )}
    >
      <Paper
        component='header'
        variant='glass'
        // glassTint='cool'
        // className={clsx(
        //   'shrink-0 p-4',
        //   isTheaterMode && 'border-paper-transparent-700 bg-paper-transparent-900 rounded-md border backdrop-blur-md',
        // )}
      >
        <Group justify='space-between' align='center' wrap='nowrap'>
          <Group gap='xs' wrap='nowrap'>
            <IconPlaylist size={22} className='text-primary-300' />
            <div>
              <Text fw={750} className='text-paper-50'>
                {t('videoRequests.queue.title')}
              </Text>
            </div>
          </Group>
          <IntegrationListenerControls listener={listener} variant='queue' />
        </Group>
      </Paper>

      {!isTheaterMode && <Divider className='border-paper-800' />}

      <ScrollArea className='min-h-0 flex-1'>
        <Stack gap='sm' className='p-3'>
          {requests.length === 0 ? (
            <div className='border-paper-800 rounded-md border border-dashed p-5 text-center'>
              <Text fw={650} className='text-paper-100'>
                {t('videoRequests.queue.emptyTitle')}
              </Text>
              <Text size='sm' className='text-dimmed mt-1'>
                {t('videoRequests.queue.emptyDescription')}
              </Text>
            </div>
          ) : (
            requests.map((request) => (
              <VideoRequestCard
                key={request.id}
                request={request}
                isActive={request.id === currentRequestId}
                onRemove={onRemove}
              />
            ))
          )}
        </Stack>
      </ScrollArea>

      <div className={clsx('shrink-0 p-3', !isTheaterMode && 'border-paper-800 border-t')}>
        <Button
          fullWidth
          variant='light'
          color='red'
          leftSection={<IconTrash size={16} />}
          disabled={requests.length === 0}
          loading={isClearing}
          onClick={openClearConfirmation}
        >
          {t('videoRequests.queue.clearWithCount', { count: requests.length })}
        </Button>
      </div>
    </aside>
  );
};

export default VideoRequestQueue;
