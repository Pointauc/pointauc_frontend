import { useCallback, useImperativeHandle, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

import { PlayerProps } from './types';

type YoutubePlayerProps = PlayerProps<Wheel.SoundtrackSourceYoutube>;

const YoutubePlayer = ({ source, ref, displayAs = 'thumbnail', onReady, onTimeUpdate }: YoutubePlayerProps) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [volume, setVolume] = useState(0.5);
  const loopCounterRef = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      play: (offset: number, volume: number) => {
        if (!playerRef.current) return;
        playerRef.current.currentTime = offset;
        playerRef.current.volume = volume;
        playerRef.current.play();
      },
      stop: () => {
        if (!playerRef.current) return;
        playerRef.current.pause();
        loopCounterRef.current = 0;
      },
      setVolume: (volume: number) => {
        setVolume(volume);
      },
    }),
    [],
  );

  const handleTimeUpdate = useCallback(() => {
    if (!playerRef.current) return;
    onTimeUpdate?.(loopCounterRef.current * playerRef.current.duration + playerRef.current.currentTime);
  }, [onTimeUpdate]);

  const handleEnded = useCallback(() => {
    loopCounterRef.current++;
  }, []);

  return (
    <ReactPlayer
      ref={playerRef}
      src={`https://www.youtube.com/watch?v=${source.videoId}`}
      volume={volume}
      onLoad={onReady}
      loop
      onEnded={handleEnded}
      preload='auto'
      onTimeUpdate={handleTimeUpdate}
      width={displayAs === 'thumbnail' ? '320px' : undefined}
      height={displayAs === 'thumbnail' ? '180px' : undefined}
      controls={false}
      style={{
        position: 'absolute',
        left: displayAs === 'thumbnail' ? '-80px' : '-9999px',
        top: displayAs === 'thumbnail' ? '-45px' : undefined,
        scale: displayAs === 'thumbnail' ? 0.5 : undefined,
      }}
    />
  );
};

export default YoutubePlayer;
