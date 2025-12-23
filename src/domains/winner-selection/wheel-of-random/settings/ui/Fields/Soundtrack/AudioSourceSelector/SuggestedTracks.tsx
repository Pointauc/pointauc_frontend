import { FC } from 'react';
import { Stack, Text, Card, Group, Image, AspectRatio } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type { Wheel } from '@models/wheel.d.ts';
import { DEFAULT_SUGGESTED_TRACKS } from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/constants';

interface SuggestedTracksProps {
  onSelect: (track: Wheel.SoundtrackSourceYoutube) => void;
}

/**
 * Displays suggested epic/dramatic music tracks for wheel soundtrack
 */
const SuggestedTracks: FC<SuggestedTracksProps> = ({ onSelect }) => {
  const { t } = useTranslation();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Stack gap="sm">
      <Text fw={500}>{t('wheel.soundtrack.sourceSelector.suggestedTracks')}</Text>
      <Stack gap="xs">
        {DEFAULT_SUGGESTED_TRACKS.map((track) => (
          <Card
            key={track.videoId}
            withBorder
            padding="sm"
            radius="md"
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(track)}
          >
            <Group align="flex-start" wrap="nowrap">
              <div style={{ width: 160, flexShrink: 0 }}>
                <AspectRatio ratio={16 / 9}>
                  <Image src={track.thumbnailUrl} alt={track.title} />
                </AspectRatio>
              </div>
              <Stack style={{ flex: 1 }} gap={0}>
                <Text fw={500} lineClamp={2} size="md">
                  {track.title}
                </Text>
                <Text size="sm" c="dark.2">
                  {track.channelTitle}
                </Text>
                <Text size="sm" c="dark.2">
                  {formatDuration(track.duration)}
                </Text>
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

export default SuggestedTracks;

