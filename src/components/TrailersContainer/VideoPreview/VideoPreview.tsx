import { FC, useCallback } from 'react';
import { Button } from '@mui/material';

import { VideoSnippet } from '@models/youtube.ts';
import './VideoPreview.scss';

interface VideoPreviewProps extends VideoSnippet {
  onSelect: (id: string) => void;
}

const VideoPreview: FC<VideoPreviewProps> = ({ onSelect, id: { videoId }, snippet: { title } }) => {
  const handleSelect = useCallback(() => {
    onSelect(videoId);
  }, [onSelect, videoId]);

  return (
    <div className='video-preview'>
      <Button onClick={handleSelect} className='video-preview-button'>
        {title}
      </Button>
    </div>
  );
};

export default VideoPreview;
