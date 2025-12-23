import { FC } from 'react';
import { Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import classes from './AudioTimeline.module.css';

interface LoopMarkersProps {
  audioDuration: number;
  timelineWidth: number;
  containerWidth: number;
}

/**
 * Visual markers showing where audio loops
 * Displayed when spin time exceeds audio duration
 */
const LoopMarkers: FC<LoopMarkersProps> = ({ audioDuration, timelineWidth, containerWidth }) => {
  const { t } = useTranslation();

  if (timelineWidth <= audioDuration) {
    return null; // No looping needed
  }

  const markers: number[] = [];
  let loopPosition = audioDuration;

  // Calculate loop marker positions
  while (loopPosition < timelineWidth) {
    markers.push(loopPosition);
    loopPosition += audioDuration;
  }

  const pixelsPerSecond = containerWidth / timelineWidth;

  return (
    <>
      {markers.map((position, index) => (
        <Tooltip key={index} label={t('wheel.soundtrack.audioSegment.loopTooltip')} position="top">
          <div
            className={classes.loopMarker}
            style={{ left: `${position * pixelsPerSecond}px` }}
          />
        </Tooltip>
      ))}
    </>
  );
};

export default LoopMarkers;

