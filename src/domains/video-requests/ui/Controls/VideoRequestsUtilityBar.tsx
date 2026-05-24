import { ActionIcon, Button, Group, Switch, Text, Tooltip } from '@mantine/core';
import { IconHistory, IconPlayerSkipBack, IconPlayerSkipForward, IconSettings, IconTheater } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { VideoRequest, VideoRequestHistoryRecord } from '@domains/video-requests/model/types';
import VideoRequestCard from '@domains/video-requests/ui/Queue/VideoRequestCard';
import { getVideoRequestTitle } from '@domains/video-requests/ui/lib/videoRequestUiFormatters';

interface VideoRequestsUtilityBarProps {
  currentRequest: VideoRequest | null;
  previousRequest: VideoRequestHistoryRecord | null;
  nextRequest: VideoRequest | null;
  isAutoplayEnabled: boolean;
  isTheaterMode: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleAutoplay: (isEnabled: boolean) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onToggleTheater: () => void;
}

const TargetTooltip = ({
  request,
  fallback,
}: {
  request: VideoRequest | VideoRequestHistoryRecord | null;
  fallback: string;
}) => {
  if (!request) {
    return <Text size='xs'>{fallback}</Text>;
  }

  return <VideoRequestCard request={request} compact />;
};

const VideoRequestsUtilityBar = ({
  currentRequest,
  previousRequest,
  nextRequest,
  isAutoplayEnabled,
  isTheaterMode,
  onPrevious,
  onNext,
  onToggleAutoplay,
  onOpenHistory,
  onOpenSettings,
  onToggleTheater,
}: VideoRequestsUtilityBarProps) => {
  const { t } = useTranslation();

  return (
    <footer
      className={clsx(
        'shrink-0',
        isTheaterMode
          ? 'border-paper-transparent-700 bg-paper-transparent-900 rounded-md border p-3 backdrop-blur-md'
          : 'flex min-h-16 flex-col justify-center gap-3 bg-transparent px-5 py-2 lg:flex-row lg:items-center lg:justify-between',
      )}
    >
      <div className={clsx('min-w-0', isTheaterMode ? 'mb-3' : 'flex-1')}>
        <Text size='xs' className='text-dimmed'>
          {t('videoRequests.utility.nowPlaying')}
        </Text>
        <Text fw={750} className='truncate'>
          {currentRequest ? getVideoRequestTitle(currentRequest.metadata) : t('videoRequests.utility.noCurrent')}
        </Text>
        {currentRequest?.metadata.authorName && (
          <Text size='xs' className='text-dimmed truncate'>
            {currentRequest.metadata.authorName}
          </Text>
        )}
      </div>

      <Group gap='md' justify={isTheaterMode ? 'space-between' : 'center'} wrap='wrap'>
        <Tooltip
          label={<TargetTooltip request={previousRequest} fallback={t('videoRequests.utility.noPrevious')} />}
          position='top'
          withArrow
          multiline
        >
          <Button
            variant='light'
            color='gray'
            size='sm'
            disabled={!previousRequest}
            onClick={onPrevious}
            leftSection={<IconPlayerSkipBack size={18} />}
            aria-label={t('videoRequests.utility.previous')}
          >
            {t('videoRequests.utility.previous')}
          </Button>
        </Tooltip>

        <Tooltip
          label={<TargetTooltip request={nextRequest} fallback={t('videoRequests.utility.noNext')} />}
          position='top'
          withArrow
          multiline
        >
          <Button
            variant='light'
            color='cyan'
            size='sm'
            disabled={!currentRequest && !nextRequest}
            onClick={onNext}
            rightSection={<IconPlayerSkipForward size={18} />}
            aria-label={t('videoRequests.utility.next')}
          >
            {t('videoRequests.utility.next')}
          </Button>
        </Tooltip>

        <Switch
          size='sm'
          checked={isAutoplayEnabled}
          onChange={(event) => onToggleAutoplay(event.currentTarget.checked)}
          label={t('videoRequests.utility.autoplay')}
        />

        <Group gap='xs' wrap='nowrap'>
          <Tooltip label={t('videoRequests.utility.history')}>
            <ActionIcon
              variant='light'
              color='gray'
              size='lg'
              onClick={onOpenHistory}
              aria-label={t('videoRequests.utility.history')}
            >
              <IconHistory size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t('videoRequests.utility.settings')}>
            <ActionIcon
              variant='light'
              color='gray'
              size='lg'
              onClick={onOpenSettings}
              aria-label={t('videoRequests.utility.settings')}
            >
              <IconSettings size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={isTheaterMode ? t('videoRequests.utility.exitTheater') : t('videoRequests.utility.theater')}>
            <ActionIcon
              variant='light'
              color='gray'
              size='lg'
              onClick={onToggleTheater}
              aria-label={t('videoRequests.utility.theater')}
            >
              <IconTheater size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </footer>
  );
};

export default VideoRequestsUtilityBar;
