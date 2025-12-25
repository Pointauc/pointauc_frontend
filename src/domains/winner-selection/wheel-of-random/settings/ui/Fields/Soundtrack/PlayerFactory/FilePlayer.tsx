import { useEffect, useImperativeHandle, useMemo } from 'react';

import { PlayerProps, PlayerRef } from './types';

type FilePlayerProps = PlayerProps<Wheel.SoundtrackSourceFile>;

const FilePlayer = ({ source, ref, onTimeUpdate, onReady }: FilePlayerProps) => {
  const audio = useMemo(() => {
    // console.log('source.dataUrl', source.dataUrl);
    const audio = new Audio(source.dataUrl);
    audio.preload = 'auto';
    audio.loop = true;
    return audio;
  }, [source.dataUrl]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      onTimeUpdate?.(audio.currentTime);
      console.log(audio.currentTime, audio.duration);
    };
    const handleCanPlay = () => {
      onReady?.();
    };
    const handleEnded = () => {
      audio.currentTime = 0;
      console.log('audio ended');
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audio, onTimeUpdate, onReady]);

  useImperativeHandle(
    ref,
    () => ({
      play: (offset: number, volume: number) => {
        audio.volume = volume;
        audio.currentTime = offset;
        audio.play();
      },
      stop: () => {
        audio.pause();
      },
      setVolume: (volume: number) => {
        audio.volume = volume;
      },
    }),
    [audio],
  );

  return null;
};

export default FilePlayer;
