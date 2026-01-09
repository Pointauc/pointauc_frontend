import { FC, useState, useCallback } from 'react';
import { Stack, Select, TextInput, Button, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';

import { fetchYoutubeVideoById } from '@api/youtubeApi';

import FileUpload from './FileUpload';
import SuggestedTracks from './SuggestedTracks';

interface AudioSourceSelectorProps {
  onSourceSelect: (source: Wheel.SoundtrackSource) => void;
}

type SourceType = 'youtube' | 'file' | null;

/**
 * Component for selecting audio source (YouTube or File)
 * Displays source type selector, recommended tracks, and conditional input form
 */
const AudioSourceSelector: FC<AudioSourceSelectorProps> = ({ onSourceSelect }) => {
  const { t } = useTranslation();
  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Extracts YouTube video ID from various URL formats
   */
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  /**
   * Fetches video metadata from YouTube API
   */
  const fetchVideoMetadata = async (videoId: string): Promise<Wheel.SoundtrackSourceYoutube | null> => {
    try {
      const videoDetails = await fetchYoutubeVideoById(videoId);

      if (!videoDetails) {
        return null;
      }

      return {
        type: 'youtube',
        videoId: videoDetails.videoId,
        title: videoDetails.title,
        channelTitle: videoDetails.channelTitle,
        duration: videoDetails.duration,
        thumbnailUrl: videoDetails.thumbnailUrl,
      };
    } catch (err) {
      console.error('Failed to fetch video metadata:', err);
      return null;
    }
  };

  const handleYoutubeSubmit = useCallback(async () => {
    if (!youtubeUrl.trim()) return;

    setIsLoading(true);

    const videoId = extractVideoId(youtubeUrl.trim());

    if (!videoId) {
      notifications.show({
        title: t('wheel.soundtrack.errors.invalidUrl'),
        message: t('wheel.soundtrack.errors.invalidUrl'),
        color: 'red',
      });
      setIsLoading(false);
      return;
    }

    const metadata = await fetchVideoMetadata(videoId);

    if (!metadata) {
      notifications.show({
        title: t('wheel.soundtrack.errors.loadFailed'),
        message: t('wheel.soundtrack.errors.loadFailedMessage'),
        color: 'red',
      });
      setIsLoading(false);
      return;
    }

    onSourceSelect(metadata);
    setIsLoading(false);
  }, [youtubeUrl, onSourceSelect, t]);

  const handleSuggestedTrackSelect = useCallback(
    (track: Wheel.SoundtrackSourceYoutube) => {
      onSourceSelect(track);
    },
    [onSourceSelect],
  );

  return (
    <Stack gap='md'>
      <Select
        label={t('wheel.soundtrack.sourceSelector.sourceType')}
        placeholder={t('wheel.soundtrack.sourceSelector.selectSourceType')}
        value={sourceType}
        onChange={(value) => setSourceType(value as SourceType)}
        data={[
          { value: 'youtube', label: t('wheel.soundtrack.sourceSelector.youtube') },
          { value: 'file', label: t('wheel.soundtrack.sourceSelector.file') },
        ]}
      />

      {sourceType === 'youtube' && (
        <Group align='flex-end' gap='xs'>
          <TextInput
            style={{ flex: 1 }}
            placeholder={t('wheel.soundtrack.sourceSelector.youtubeUrlPlaceholder')}
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleYoutubeSubmit()}
          />
          <Button onClick={handleYoutubeSubmit} loading={isLoading} disabled={!youtubeUrl.trim()}>
            {t('common.apply')}
          </Button>
        </Group>
      )}

      {sourceType === 'file' && <FileUpload onSelect={onSourceSelect} />}

      <SuggestedTracks onSelect={handleSuggestedTrackSelect} />
    </Stack>
  );
};

export default AudioSourceSelector;
