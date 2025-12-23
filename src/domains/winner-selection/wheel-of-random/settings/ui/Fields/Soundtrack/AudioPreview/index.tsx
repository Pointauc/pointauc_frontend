import { FC } from 'react';
import { Card, Text, Group, Stack } from '@mantine/core';
import AudioFileIcon from '@mui/icons-material/AudioFile';

import YouTubePreview from './YouTubePreview';

interface AudioPreviewProps {
  source: Wheel.SoundtrackSource;
}

/**
 * Displays preview of selected audio source
 * Shows YouTube video card or file info depending on source type
 */
const AudioPreview: FC<AudioPreviewProps> = ({ source }) => {
  if (source.type === 'youtube') {
    return <YouTubePreview source={source} />;
  }

  // File preview
  const fileSizeMB = (source.fileSize / (1024 * 1024)).toFixed(2);
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card withBorder padding='md' radius='md'>
      <Group align='flex-start' wrap='nowrap'>
        <AudioFileIcon style={{ fontSize: 48, opacity: 0.7 }} />
        <Stack gap={0} style={{ flex: 1 }}>
          <Text fw={500} size='md' lineClamp={1}>
            {source.fileName}
          </Text>
          <Text size='sm' c='dark.2'>
            {formatDuration(source.duration)} • {fileSizeMB} MB
          </Text>
          <Text size='xs' c='dark.2'>
            {source.mimeType}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
};

export default AudioPreview;
