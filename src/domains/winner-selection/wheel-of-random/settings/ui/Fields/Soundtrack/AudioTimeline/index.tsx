import { FC, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Stack, Text, Group, Tooltip, ActionIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { clamp } from 'es-toolkit';

import WaveformCanvas from './WaveformCanvas';
import SpinTimeSlider from './SpinTimeSlider';
import LoopMarkers from './LoopMarkers';
import CurrentTimeIndicator from './CurrentTimeIndicator';
import classes from './AudioTimeline.module.css';

interface AudioTimelineProps {
  waveform: number[];
  source: Wheel.SoundtrackSource;
  offset: number;
  spinTime: number;
  minSpinTime?: number;
  maxSpinTime?: number;
  isRandomSpin: boolean;
  currentPlayTime: number;
  onOffsetChange: (offset: number) => void;
  onSpinTimeChange: (spinTime: number, minSpinTime?: number) => void;
  onCurrentTimeChange: (time: number) => void;
}

/**
 * Audio timeline component with waveform visualization and draggable spin time slider
 * Shows which portion of the audio will play during the wheel spin
 */
const AudioTimeline: FC<AudioTimelineProps> = ({
  waveform,
  source,
  offset,
  spinTime,
  minSpinTime,
  maxSpinTime,
  isRandomSpin,
  currentPlayTime,
  onOffsetChange,
  onSpinTimeChange,
  onCurrentTimeChange,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  const audioDuration = source.duration;
  const effectiveSpinTime = isRandomSpin && maxSpinTime ? maxSpinTime : spinTime;
  const timelineWidth = Math.max(audioDuration, effectiveSpinTime);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCurrentTimeChange = useCallback(
    (time: number) => {
      onCurrentTimeChange(clamp(time, 0, timelineWidth));
    },
    [onCurrentTimeChange, timelineWidth],
  );

  return (
    <Stack gap='sm'>
      <Group justify='space-between' align='center'>
        <Text fw={500} size='sm'>
          {t('wheel.soundtrack.audioSegment.label')}
        </Text>
        <Tooltip label={t('wheel.soundtrack.audioSegment.tooltip')} position='left'>
          <ActionIcon variant='subtle' size='sm'>
            <HelpOutlineIcon fontSize='small' />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Text size='xs' c='dimmed'>
        {t('wheel.soundtrack.audioSegment.dragHint')}
      </Text>

      <div ref={containerRef} className={classes.timelineContainer}>
        <WaveformCanvas waveform={waveform} width={containerWidth} height={80} />

        <div className={classes.sliderOverlay}>
          <LoopMarkers audioDuration={audioDuration} timelineWidth={timelineWidth} containerWidth={containerWidth} />
          <SpinTimeSlider
            offset={offset}
            spinTime={spinTime}
            minSpinTime={minSpinTime}
            maxSpinTime={maxSpinTime}
            isRandomSpin={isRandomSpin}
            audioDuration={audioDuration}
            timelineWidth={timelineWidth}
            containerWidth={containerWidth}
            onOffsetChange={onOffsetChange}
            onSpinTimeChange={onSpinTimeChange}
            formatTime={formatTime}
            currentPlayTime={currentPlayTime}
            onCurrentTimeChange={handleCurrentTimeChange}
          />
        </div>

        <div className={classes.timeLabels}>
          <Text size='xs'>{formatTime(0)}</Text>
          <Text size='xs'>{formatTime(timelineWidth)}</Text>
        </div>
      </div>

      <Text size='xs' c='dimmed' ta='center'>
        {t('wheel.soundtrack.audioSegment.selectedRange', {
          start: formatTime(offset),
          end: formatTime(offset + effectiveSpinTime),
        })}
      </Text>
    </Stack>
  );
};

export default AudioTimeline;
