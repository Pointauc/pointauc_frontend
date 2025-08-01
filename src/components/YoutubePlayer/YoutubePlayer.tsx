import { FC, useEffect, useRef, useState } from 'react';
import PlayerFactory from 'youtube-player';
import { YouTubePlayer } from 'youtube-player/dist/types';

interface YoutubePlayerProps {
  width: number;
  height: number;
  videoId?: string | null;
}

const YoutubePlayer: FC<YoutubePlayerProps> = ({ width, videoId, height }) => {
  const container = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YouTubePlayer>();

  useEffect(() => {
    if (container.current && videoId) {
      playerInstanceRef.current = PlayerFactory(container.current, { width, videoId, height });
    }

    return (): void => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useEffect(() => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.setSize(width, height);
    }
  }, [height, width]);

  return <div ref={container} />;
};

export default YoutubePlayer;
