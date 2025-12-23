import { useCallback, useImperativeHandle, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

import { PlayerProps, PlayerRef } from './types';

type YoutubePlayerProps = PlayerProps<Wheel.SoundtrackSourceYoutube>;

const YoutubePlayer = ({ source, ref, onReady, onTimeUpdate }: YoutubePlayerProps) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useImperativeHandle(
    ref,
    () => ({
      play: (offset: number) => {
        console.log('play');
        if (!playerRef.current) return;
        playerRef.current.currentTime = offset;
        setPlaying(true);
      },
      stop: () => {
        console.log('stop');
        setPlaying(false);
      },
      setVolume: (volume: number) => {
        console.log('setVolume', volume);
        setVolume(volume);
      },
    }),
    [],
  );

  const handleTimeUpdate = useCallback(() => {
    if (!playerRef.current) return;
    console.log('progress', playerRef.current.currentTime);
    onTimeUpdate?.(playerRef.current.currentTime);
  }, [onTimeUpdate]);

  return (
    <ReactPlayer
      ref={playerRef}
      src={`https://www.youtube.com/watch?v=${source.videoId}`}
      volume={volume}
      playing={playing}
      onReady={onReady}
      preload='auto'
      onTimeUpdate={handleTimeUpdate}
    />
  );
};

export default YoutubePlayer;
