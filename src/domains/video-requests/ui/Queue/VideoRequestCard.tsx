import { ActionIcon, Badge, Group, Menu, Text } from '@mantine/core';
import {
  IconBrandTwitch,
  IconBrandYoutubeFilled,
  IconCoin,
  IconDotsVertical,
  IconEyeFilled,
  IconHeartFilled,
  IconPhotoVideo,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { VideoRequest, VideoRequestHistoryRecord } from '@domains/video-requests/model/types';
import {
  formatBidAmount,
  formatCompactNumber,
  formatDuration,
  formatLikePercentage,
  formatRelativeDate,
  getVideoRequestTitle,
} from '@domains/video-requests/ui/lib/videoRequestUiFormatters';
import PointsIcon from '@assets/icons/channelPoints.svg?react';

export interface VideoRequestCardAction {
  label: string;
  icon: React.ReactNode;
  color?: string;
  onClick: () => void;
}

interface VideoRequestCardProps {
  request: VideoRequest | VideoRequestHistoryRecord;
  isActive?: boolean;
  compact?: boolean;
  showStatus?: boolean;
  actions?: VideoRequestCardAction[];
  borders?: boolean;
}

const sourceIconById: Record<VideoRequest['sourceId'], React.ReactNode> = {
  youtube: <IconBrandYoutubeFilled size={16} className='text-red-500' />,
  twitchClip: <IconBrandTwitch size={16} className='text-purple-500' />,
  twitchVod: <IconBrandTwitch size={16} className='text-purple-500' />,
};

const VideoRequestCard = ({
  request,
  isActive = false,
  showStatus = false,
  actions = [],
  borders = true,
}: VideoRequestCardProps) => {
  const { t } = useTranslation();
  const title = getVideoRequestTitle(request.metadata);
  const duration = formatDuration(request.metadata.durationSeconds);
  const views = formatCompactNumber(request.metadata.viewCount);
  const likePercentage = formatLikePercentage(request.metadata.likeCount, request.metadata.viewCount);
  const likeCount = formatCompactNumber(request.metadata.likeCount);
  const age = formatRelativeDate(request.metadata.publishedAt ?? request.metadata.createdAt);
  const bidAmount = formatBidAmount(request.bidSnapshot?.cost);
  const hasActions = actions.length > 0;

  return (
    <article
      className={clsx(
        'group relative flex min-w-0 gap-3 p-2.5 transition-colors',
        isActive
          ? 'border-primary-700/30 bg-primary-light/40 hover:bg-primary-light/60 border-t-2'
          : 'border-paper-600 bg-paper-800/60 hover:bg-paper-700',
        borders ? 'border-b-2 last:border-b-0' : 'border-b-0',
      )}
    >
      <div className='bg-paper-800 relative h-20 w-32 shrink-0 overflow-hidden rounded'>
        {request.metadata.thumbnailUrl ? (
          <img src={request.metadata.thumbnailUrl} alt='' className='h-full w-full object-cover' />
        ) : (
          <div className='text-dimmed flex h-full w-full items-center justify-center'>
            <IconPhotoVideo size={28} />
          </div>
        )}
        {duration && (
          <span className='absolute right-1 bottom-1 rounded bg-black/80 px-1.5 py-0.5 text-[0.68rem] font-semibold text-white'>
            {duration}
          </span>
        )}

        {hasActions && (
          <div className='absolute top-0 left-0 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'>
            <Menu trigger='hover' position='left-start' radius='sm' withArrow shadow='md'>
              <Menu.Target>
                <ActionIcon
                  variant='filled'
                  color='dark.9'
                  size='md'
                  radius='0'
                  className='rounded-br-md'
                  title={t('videoRequests.card.actions')}
                  aria-label={t('videoRequests.card.actions')}
                >
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown className='bg-paper-600'>
                {actions.map((action) => (
                  <Menu.Item key={action.label} color={action.color} leftSection={action.icon} onClick={action.onClick}>
                    {action.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </div>
        )}
      </div>

      <div className='flex min-w-0 flex-1 flex-col justify-between gap-1'>
        <div className='min-w-0'>
          <div className='flex items-start justify-between gap-1'>
            <Text fw={650} size={'sm'} title={title} className='line-clamp-2 leading-snug'>
              {title}
            </Text>
            <div className='flex shrink-0 flex-col items-end justify-between gap-1'>
              <Group gap={4} justify='end'>
                {sourceIconById[request.sourceId]}
                {showStatus && (
                  <Badge size='xs' color='gray' variant='light'>
                    {t(`videoRequests.history.status.${request.status}`)}
                  </Badge>
                )}
              </Group>
            </div>
          </div>
          {request.metadata.authorName && (
            <Text size='xs' title={request.metadata.authorName} className='text-dimmed truncate'>
              {request.metadata.authorName}
            </Text>
          )}
        </div>

        <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] text-neutral-400'>
          {views && (
            <span className='flex gap-1'>
              <Text size='xs' fw={700}>
                {views}
              </Text>
              <IconEyeFilled size={14} className='text-neutral-600' />
            </span>
          )}
          {likePercentage && (
            <span className='flex gap-1'>
              <Text size='xs' fw={700}>
                {likeCount}
              </Text>
              <IconHeartFilled size={14} className='text-neutral-600' />
            </span>
          )}
          {age && (
            <span className='flex items-center gap-1'>
              <Text size='xs' fw={700}>
                {age}
              </Text>
            </span>
          )}
          {(request.requestedBy || bidAmount) && (
            <span className='text-dimmed flex w-full min-w-0 items-center justify-between gap-1 truncate'>
              {request.requestedBy && (
                <span className='truncate'>{t('videoRequests.card.by', { name: request.requestedBy })}</span>
              )}
              {bidAmount && (
                <span className='text-paper-200 flex shrink-0 items-center gap-0.5 font-semibold'>
                  {request.bidSnapshot?.isDonation ? (
                    <span className='text-donation text-[14px]'>{t('common.currencySign')}</span>
                  ) : (
                    <PointsIcon className='text-points' width={14} height={14} />
                  )}
                  <span
                    className={clsx(
                      'text-sm font-bold',
                      request.bidSnapshot?.isDonation ? 'text-donation' : 'text-points',
                    )}
                  >
                    {bidAmount}
                  </span>
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default VideoRequestCard;
