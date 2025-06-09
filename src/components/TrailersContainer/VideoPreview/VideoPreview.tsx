import { FC, useCallback } from 'react';
import { Card, Image, Text, Group, Stack, AspectRatio } from '@mantine/core';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import dayjs from 'dayjs';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { VideoSnippet } from '@models/youtube.ts';
import './VideoPreview.scss';

interface VideoPreviewProps extends VideoSnippet {
  onSelect: (id: string) => void;
}

const VideoPreview: FC<VideoPreviewProps> = ({
  onSelect,
  id: { videoId },
  snippet: { title, channelTitle, publishedAt, thumbnails, viewCount, likeCount },
}) => {
  const handleSelect = useCallback(() => {
    onSelect(videoId);
  }, [onSelect, videoId]);

  const thumbnailUrl = thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url;
  const formattedDate = dayjs(publishedAt).fromNow();
  const formattedViews = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(viewCount || 0);

  const formattedLikes = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(likeCount || 0);

  return (
    <Card
      className='video-preview-card'
      onClick={handleSelect}
      withBorder
      padding='sm'
      radius='md'
      style={{ cursor: 'pointer' }}
    >
      <Group align='flex-start' wrap='nowrap'>
        <div className='thumbnail-container'>
          <AspectRatio ratio={16 / 9} w={160}>
            <Image src={thumbnailUrl} alt={title} className='video-thumbnail' />
          </AspectRatio>
        </div>
        <Stack style={{ flex: 1 }} gap={0}>
          <Text fw={500} lineClamp={2} size='md'>
            {title}
          </Text>

          <Group gap='xs' wrap='nowrap' mb='xs'>
            <Text size='sm' c='dark.2'>
              {channelTitle}
            </Text>
            <FiberManualRecordIcon className='video-preview-icon' sx={{ fontSize: 8, color: 'gray' }} />
            <Text size='sm' c='dark.2'>
              {formattedDate}
            </Text>
          </Group>

          <Group gap='xs' wrap='nowrap'>
            <Group gap={4} wrap='nowrap'>
              <VisibilityIcon className='video-preview-icon' sx={{ fontSize: 16 }} />
              <Text size='sm'>{formattedViews}</Text>
            </Group>
            <Group gap={4} wrap='nowrap'>
              <ThumbUpIcon className='video-preview-icon' sx={{ fontSize: 16 }} />
              <Text size='sm'>{formattedLikes}</Text>
            </Group>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};

export default VideoPreview;
