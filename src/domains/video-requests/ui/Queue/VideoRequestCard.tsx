import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconPhotoVideo, IconTrash } from '@tabler/icons-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { VideoRequest, VideoRequestHistoryRecord } from '@domains/video-requests/model/types';
import {
  formatCompactNumber,
  formatDuration,
  formatLikePercentage,
  formatRelativeDate,
  getVideoRequestTitle,
} from '@domains/video-requests/ui/lib/videoRequestUiFormatters';

interface VideoRequestCardProps {
  request: VideoRequest | VideoRequestHistoryRecord;
  isActive?: boolean;
  compact?: boolean;
  showStatus?: boolean;
  onRemove?: (id: string) => void;
}

const sourceColorById: Record<VideoRequest['sourceId'], string> = {
  youtube: 'red',
  twitchClip: 'violet',
  twitchVod: 'indigo',
};

const VideoRequestCard = ({
  request,
  isActive = false,
  compact = false,
  showStatus = false,
  onRemove,
}: VideoRequestCardProps) => {
  const { t } = useTranslation();
  const title = getVideoRequestTitle(request.metadata);
  const duration = formatDuration(request.metadata.durationSeconds);
  const views = formatCompactNumber(request.metadata.viewCount);
  const likePercentage = formatLikePercentage(request.metadata.likeCount, request.metadata.viewCount);
  const age = formatRelativeDate(request.metadata.publishedAt ?? request.metadata.createdAt);
  const hasRemove = Boolean(onRemove);

  return (
    <article
      className={clsx(
        'flex min-w-0 gap-3 rounded-md border p-2 transition-colors',
        isActive
          ? 'border-primary-400 bg-primary-light'
          : 'border-paper-700 bg-paper-800 hover:border-paper-500',
        compact && 'max-w-[22rem]',
      )}
    >
      <div className='relative h-20 w-32 shrink-0 overflow-hidden rounded bg-paper-800'>
        {request.metadata.thumbnailUrl ? (
          <img src={request.metadata.thumbnailUrl} alt='' className='h-full w-full object-cover' />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-dimmed'>
            <IconPhotoVideo size={28} />
          </div>
        )}
        {duration && (
          <span className='absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[0.68rem] font-semibold text-white'>
            {duration}
          </span>
        )}
      </div>

      <div className='flex min-w-0 flex-1 flex-col justify-between gap-1'>
        <div className='min-w-0'>
          <Text
            fw={650}
            size={compact ? 'xs' : 'sm'}
            title={title}
            className='line-clamp-2 leading-snug text-paper-50'
          >
            {title}
          </Text>
          {request.metadata.authorName && (
            <Text size='xs' title={request.metadata.authorName} className='truncate text-dimmed'>
              {request.metadata.authorName}
            </Text>
          )}
        </div>

        <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] text-dimmed'>
          {views && <span>{t('videoRequests.card.views', { value: views })}</span>}
          {likePercentage && <span>{t('videoRequests.card.likes', { percentage: likePercentage })}</span>}
          {age && <span>{age}</span>}
          {request.requestedBy && <span className='truncate'>{t('videoRequests.card.by', { name: request.requestedBy })}</span>}
        </div>
      </div>

      <div className='flex shrink-0 flex-col items-end justify-between gap-2'>
        <Group gap={4} justify='end'>
          <Badge size='xs' color={sourceColorById[request.sourceId]} variant='light'>
            {t(`videoRequests.sources.${request.sourceId}`)}
          </Badge>
          {showStatus && (
            <Badge size='xs' color='gray' variant='light'>
              {t(`videoRequests.history.status.${request.status}`)}
            </Badge>
          )}
        </Group>
        {hasRemove && (
          <Tooltip label={t('videoRequests.queue.remove')} position='left'>
            <ActionIcon
              variant='subtle'
              color='red'
              size='sm'
              aria-label={t('videoRequests.queue.remove')}
              onClick={() => onRemove?.(request.id)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>
    </article>
  );
};

export default VideoRequestCard;
