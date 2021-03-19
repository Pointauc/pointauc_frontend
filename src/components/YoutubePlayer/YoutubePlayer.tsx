import React, { FC, useEffect, useRef, useState } from 'react';
import PlayerFactory from 'youtube-player';
import { YouTubePlayer } from 'youtube-player/dist/types';

interface YoutubePlayerProps {
  width: number;
  height: number;
  videoId?: string;
}

const YoutubePlayer: FC<YoutubePlayerProps> = ({ width, videoId, height }) => {
  const container = useRef<HTMLDivElement>(null);
  const [playerInstance, setPlayerInstance] = useState<YouTubePlayer>();

  useEffect(() => {
    if (container.current) {
      setPlayerInstance(PlayerFactory(container.current, { width, videoId, height }));
    }

    return (): void => {
      if (playerInstance) {
        playerInstance.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (playerInstance) {
      playerInstance.setSize(width, height);
    }
  }, [height, playerInstance, width]);

  return <div ref={container} />;
};

export default YoutubePlayer;
