import { FC, useState, useCallback } from 'react';
import { Stack, TextInput, Button, Loader, Center, Text, Card } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';

import { VideoSnippet } from '@models/youtube.ts';
import { searchYoutubeVideos } from '@api/youtubeApi.ts';
import VideoPreview from '@components/TrailersContainer/VideoPreview/VideoPreview';
import withLoading from '@decorators/withLoading';

import SuggestedTracks from './SuggestedTracks';

interface YouTubeSearchProps {
  onSelect: (source: Wheel.SoundtrackSourceYoutube) => void;
}

/**
 * YouTube search and selection component
 * Allows users to search for videos or select from suggested tracks
 */
const YouTubeSearch: FC<YouTubeSearchProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    const videosData = await searchYoutubeVideos(searchQuery);
    setVideos(videosData ?? []);
  }, [searchQuery]);

  const onSubmit = withLoading(setIsLoading, handleSearch);

  const handleVideoSelect = useCallback(
    (videoId: string) => {
      const video = videos.find((v) => v.id.videoId === videoId);
      if (!video) return;

      const source: Wheel.SoundtrackSourceYoutube = {
        type: 'youtube',
        videoId: video.id.videoId,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        duration: 0, // Will be determined by player
        thumbnailUrl:
          video.snippet.thumbnails.high?.url ||
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default?.url ||
          '',
      };

      onSelect(source);
    },
    [videos, onSelect],
  );

  const handleSuggestedTrackSelect = useCallback(
    (track: Wheel.SoundtrackSourceYoutube) => {
      onSelect(track);
    },
    [onSelect],
  );

  return (
    <Stack gap='md'>
      <TextInput
        placeholder={t('wheel.soundtrack.sourceSelector.youtubeSearch')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
        leftSection={<SearchIcon />}
        rightSection={
          <Button size='xs' onClick={onSubmit} disabled={!searchQuery.trim()}>
            {t('common.search')}
          </Button>
        }
        rightSectionWidth={80}
      />

      {isLoading && (
        <Center py='xl'>
          <Loader size='lg' />
        </Center>
      )}

      {!isLoading && videos.length > 0 && (
        <Stack gap='xs'>
          {videos.map((video) => (
            <VideoPreview key={video.id.videoId} {...video} onSelect={handleVideoSelect} />
          ))}
        </Stack>
      )}

      {!isLoading && videos.length === 0 && !searchQuery && <SuggestedTracks onSelect={handleSuggestedTrackSelect} />}

      {!isLoading && videos.length === 0 && searchQuery && (
        <Card withBorder padding='md'>
          <Text c='dimmed'>{t('trailerWindow.noResults')}</Text>
        </Card>
      )}
    </Stack>
  );
};

export default YouTubeSearch;
