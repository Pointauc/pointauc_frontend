import { FC, useCallback, useState, useEffect, useRef } from 'react';
import { Divider, Text, Group, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

import { useAudioPlayback } from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/useAudioPlayback';
import { useWaveformExtractor } from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/useWaveformExtractor';
import { DEFAULT_SOUNDTRACK_CONFIG } from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/constants';

import AudioPreview from './AudioPreview';
import AudioTimeline from './AudioTimeline';
import VolumeSlider from './VolumeSlider';
import classes from './SoundtrackModal.module.css';
import SpinTimeComposed from './SpinTimeComposed';
import PlayerFactory from './PlayerFactory';
import { PlayerRef } from './PlayerFactory/types';

/**
 * Component for configuring soundtrack source settings
 * Handles audio preview, timeline, volume, and playback testing
 */
const SoundtrackSourceConfig: FC = () => {
  const { t } = useTranslation();
  const { setValue, control } = useFormContext<Wheel.Settings>();
  const playerRef = useRef<PlayerRef | null>(null);

  // Watch current form values
  const source = useWatch({ name: 'soundtrack.source', control }) ?? DEFAULT_SOUNDTRACK_CONFIG.source;
  const offset = useWatch({ name: 'soundtrack.offset', control });
  const volume = useWatch({ name: 'soundtrack.volume', control });
  const spinTime = useWatch({ name: 'spinTime', control });
  const randomSpinEnabled = useWatch({ name: 'randomSpinEnabled', control });
  const randomSpinConfig = useWatch({ name: 'randomSpinConfig', control });

  // Audio playback and waveform
  const { waveform, isExtracting } = useAudioPlayback({ source });

  // Current playback time state
  const [currentPlayTime, setCurrentPlayTime] = useState(offset ?? 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackIntervalRef = useRef<number | null>(null);

  const handleOffsetChange = useCallback(
    (offset: number) => {
      setValue('soundtrack.offset', offset);
      // Reset current play time to start of spin segment
      setCurrentPlayTime(offset);
    },
    [setValue],
  );

  const handleVolumeChange = useCallback(
    (volume: number) => {
      setValue('soundtrack.volume', volume);
    },
    [setValue],
  );

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume ?? 0);
    }
  }, [volume]);

  const handleSpinTimeChange = useCallback(
    (newSpinTime: number, newMinSpinTime?: number) => {
      if (randomSpinEnabled && newMinSpinTime !== undefined) {
        setValue('randomSpinConfig', {
          min: Math.round(newMinSpinTime),
          max: Math.round(newSpinTime),
        });
      } else {
        setValue('spinTime', Math.round(newSpinTime));
      }
      // Reset current play time to start of spin segment
      setCurrentPlayTime(offset ?? 0);
    },
    [randomSpinEnabled, setValue, offset],
  );

  const handleTestStop = useCallback(() => {
    playerRef.current?.stop();
    setIsPlaying(false);

    // Clear polling interval
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }

    // Reset to start of spin segment
    setCurrentPlayTime(offset ?? 0);
  }, [offset]);

  const handleTestPlay = useCallback(() => {
    playerRef.current?.play(currentPlayTime);
    setIsPlaying(true);

    // Start polling current time
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
  }, [currentPlayTime]);

  const handleRemoveAudio = useCallback(() => {
    setValue('soundtrack.source', null);
    playerRef.current?.stop();
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  }, [setValue]);

  const handleCurrentTimeChange = useCallback((time: number) => {
    setCurrentPlayTime(time);
  }, []);

  // Reset current play time when offset changes from form
  useEffect(() => {
    if (!isPlaying) {
      setCurrentPlayTime(offset ?? 0);
    }
  }, [offset, isPlaying]);

  const effectiveSpinTime = randomSpinEnabled && randomSpinConfig ? randomSpinConfig.max : spinTime ?? 20;
  const minSpinTime = randomSpinEnabled && randomSpinConfig ? randomSpinConfig.min : undefined;

  const handleTimeUpdate = useCallback((progress: number) => {
    console.log('handleTimeUpdate', progress);
    setCurrentPlayTime(progress);
  }, []);

  if (!source) {
    return null;
  }

  return (
    <>
      <PlayerFactory source={source} ref={playerRef} onTimeUpdate={handleTimeUpdate} />
      <AudioPreview source={source} />

      <Divider />

      <div className='max-w-3xs'>
        <SpinTimeComposed />
      </div>

      {!isExtracting && waveform.length > 0 && (
        <AudioTimeline
          waveform={waveform}
          source={source}
          offset={offset ?? 0}
          spinTime={effectiveSpinTime}
          minSpinTime={minSpinTime}
          maxSpinTime={randomSpinEnabled ? randomSpinConfig?.max : undefined}
          isRandomSpin={randomSpinEnabled}
          currentPlayTime={currentPlayTime}
          onOffsetChange={handleOffsetChange}
          onSpinTimeChange={handleSpinTimeChange}
          onCurrentTimeChange={handleCurrentTimeChange}
        />
      )}

      {isExtracting && (
        <Text size='sm' c='dimmed' ta='center'>
          {t('common.loading')}...
        </Text>
      )}

      <VolumeSlider value={volume ?? 0} onChange={handleVolumeChange} />

      <div className={classes.actionButtons}>
        <Group>
          <Button
            variant='light'
            leftSection={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
            onClick={isPlaying ? handleTestStop : handleTestPlay}
          >
            {isPlaying ? t('common.stop') : t('wheel.soundtrack.actions.testPlay')}
          </Button>
        </Group>
        <Button variant='outline' color='red' leftSection={<DeleteIcon />} onClick={handleRemoveAudio}>
          {t('wheel.soundtrack.actions.removeAudio')}
        </Button>
      </div>
    </>
  );
};

export default SoundtrackSourceConfig;
