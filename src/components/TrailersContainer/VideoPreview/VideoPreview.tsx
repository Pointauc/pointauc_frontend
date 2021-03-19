import React, { FC, useCallback } from 'react';
import { Button } from '@material-ui/core';
import { VideoSnippet } from '../../../models/youtube';
import './VideoPreview.scss';

interface VideoPreviewProps extends VideoSnippet {
  onSelect: (id: string) => void;
}

const VideoPreview: FC<VideoPreviewProps> = ({ onSelect, id: { videoId }, snippet: { title } }) => {
  const handleSelect = useCallback(() => {
    onSelect(videoId);
  }, [onSelect, videoId]);

  return (
    <div className="video-preview">
      <Button onClick={handleSelect} className="video-preview-button">
        {title}
      </Button>
    </div>
  );
};

export default VideoPreview;
