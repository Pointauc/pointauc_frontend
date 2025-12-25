import { FC, useCallback, useState, useEffect, useRef } from 'react';
import { Divider, Text, Group, Button, CloseIcon, Switch, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { IconPlayerSkipForwardFilled } from '@tabler/icons-react';
import clsx from 'clsx';

import { useAudioPlayback } from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/useAudioPlayback';
import { useWaveformExtractor } from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/useWaveformExtractor';
import { DEFAULT_SOUNDTRACK_CONFIG } from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/constants';
import OutlineInput from '@shared/mantine/ui/Input/Outline/OutlineInput';

import AudioPreview from './AudioPreview';
import AudioTimeline from './AudioTimeline';
import VolumeSlider from './VolumeSlider';
import classes from './SoundtrackModal.module.css';
import SpinTimeComposed from './SpinTimeComposed';
import PlayerFactory from './PlayerFactory';
import { PlayerRef } from './PlayerFactory/types';

interface SoundtrackSourceConfigProps {
  onClose: () => void;
}

/**
 * Component for configuring soundtrack source settings
 * Handles audio preview, timeline, volume, and playback testing
 */
const SoundtrackSourceConfig: FC<SoundtrackSourceConfigProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { setValue, control } = useFormContext<Wheel.Settings>();
  const playerRef = useRef<PlayerRef | null>(null);

  // Watch current form values
  const source = useWatch({ name: 'soundtrack.source', control }) ?? DEFAULT_SOUNDTRACK_CONFIG.source;
  const offset = useWatch({ name: 'soundtrack.offset', control }) ?? 0;
  const volume = useWatch({ name: 'soundtrack.volume', control }) ?? 50;
  const spinTime = useWatch({ name: 'spinTime', control }) ?? 20;
  const randomSpinEnabled = useWatch({ name: 'randomSpinEnabled', control });
  const randomSpinConfig = useWatch({ name: 'randomSpinConfig', control });

  // Audio playback and waveform
  const { waveform, isExtracting } = useAudioPlayback({ source });

  // Current playback time state
  const [currentPlayTime, setCurrentPlayTime] = useState(offset ?? 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleStop = useCallback(() => {
    playerRef.current?.stop();
    setIsPlaying(false);

    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }

    // Reset to start of spin segment
    setCurrentPlayTime(offset ?? 0);
  }, [offset]);

  const handleTimeUpdate = useCallback(
    (progress: number) => {
      // console.log('handleTimeUpdate', progress, effectiveSpinTime);
      if (isPlaying) {
        setCurrentPlayTime(progress);

        if (progress >= effectiveSpinTime + offset) {
          handleStop();
        }
      }
    },
    [isPlaying, effectiveSpinTime, offset, handleStop],
  );

  const handleTestPlay = useCallback(() => {
    playerRef.current?.play(currentPlayTime, volume ?? 0);
    setIsPlaying(true);

    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }

    // playbackTimeoutRef.current = setTimeout(() => {
    //   handleTestStop();
    // }, effectiveSpinTime * 1000);
  }, [currentPlayTime, volume]);

  const handleRemoveAudio = useCallback(() => {
    setValue('soundtrack.source', null);
    playerRef.current?.stop();
    setIsPlaying(false);
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
  }, [setValue]);

  const handlePlayLastSection = useCallback(() => {
    setCurrentPlayTime(effectiveSpinTime - 3 + offset);
    playerRef.current?.play(effectiveSpinTime - 3 + offset, volume ?? 0);
    setIsPlaying(true);

    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }

    // playbackTimeoutRef.current = setTimeout(() => {
    //   handleTestStop();
    // }, 3000);
  }, [effectiveSpinTime, offset, volume]);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  if (!source) {
    return null;
  }

  return (
    <>
      <AudioPreview
        source={source}
        thumbnailContent={
          <PlayerFactory source={source} ref={playerRef} onTimeUpdate={handleTimeUpdate} onReady={handleReady} />
        }
      />

      <Divider />

      <Group justify='space-between'>
        <Group gap='xs'>
          <Controller
            name='soundtrack.offset'
            render={({ field: { onChange, value } }) => (
              <OutlineInput
                w={100}
                label={t('wheel.soundtrack.offset')}
                type='number'
                onChange={(e) => (e.target.value === '' ? onChange(null) : onChange(Number(e.target.value)))}
                value={Number.isNaN(value) || value == null ? '' : value}
              />
            )}
          />
          <Divider orientation='vertical' />
          <div className='max-w-3xs'>
            <SpinTimeComposed />
          </div>
        </Group>
        <Controller
          name='soundtrack.enabled'
          render={({ field: { onChange, value } }) => (
            <Switch
              className={clsx(classes.enabledSwitch, value && classes.enabled)}
              label={t('wheel.soundtrack.enabledSwitchLabel')}
              checked={value}
              onChange={(e) => onChange(e.currentTarget.checked)}
            />
          )}
        />
      </Group>

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
          isPlaying={isPlaying}
        />
      )}

      {isExtracting && (
        <Text size='sm' c='dimmed' ta='center'>
          {t('common.loading')}...
        </Text>
      )}

      <Group justify='space-between'>
        <Group gap='xs'>
          {isPlaying && (
            <Button variant='light' leftSection={<StopIcon />} onClick={handleStop}>
              {t('common.stop')}
            </Button>
          )}
          {!isPlaying && (
            <>
              <Button variant='light' leftSection={<PlayArrowIcon />} onClick={handleTestPlay}>
                {t('wheel.soundtrack.actions.testPlay')}
              </Button>
              <Button variant='light' leftSection={<IconPlayerSkipForwardFilled />} onClick={handlePlayLastSection}>
                {t('wheel.soundtrack.actions.lastSection')}
              </Button>
            </>
          )}
        </Group>
        <VolumeSlider value={volume ?? 0} onChange={handleVolumeChange} />
      </Group>

      <Divider />

      <Group justify='space-between'>
        <Button variant='outline' color='red' leftSection={<DeleteIcon />} onClick={handleRemoveAudio}>
          {t('wheel.soundtrack.actions.removeAudio')}
        </Button>
        <Button variant='outline' color='gray.3' onClick={onClose}>
          {t('wheel.soundtrack.actions.closeModal')}
        </Button>
      </Group>
    </>
  );
};

export default SoundtrackSourceConfig;
