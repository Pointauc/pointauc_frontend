import { FC } from 'react';

import { VideoSnippet } from '@models/youtube.ts';
import VideoPreview from '@components/TrailersContainer/VideoPreview/VideoPreview';

interface YouTubePreviewProps {
  source: Wheel.SoundtrackSourceYoutube;
}

/**
 * Displays YouTube video preview using existing VideoPreview component
 */
const YouTubePreview: FC<YouTubePreviewProps> = ({ source }) => {
  // Convert to VideoSnippet format
  const videoSnippet: VideoSnippet = {
    id: {
      videoId: source.videoId,
    },
    snippet: {
      title: source.title,
      channelTitle: source.channelTitle,
      publishedAt: '',
      thumbnails: {
        high: { url: source.thumbnailUrl },
      },
    },
  };

  return <VideoPreview {...videoSnippet} blurred={false} />;
};

export default YouTubePreview;
