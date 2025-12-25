import { FC, useCallback, useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import { Transition } from '@mantine/core';

import classes from './AudioTimeline.module.css';

interface CurrentTimeIndicatorProps {
  currentTime: number;
  offset: number;
  timelineWidth: number;
  containerWidth: number;
  formatTime: (seconds: number) => string;
  onCurrentTimeChange?: (time: number) => void;
  isPlaying?: boolean;
}

/**
 * Red vertical line indicating current playback position
 * Can be dragged to seek to a different position
 */
const CurrentTimeIndicator: FC<CurrentTimeIndicatorProps> = ({
  currentTime,
  offset,
  timelineWidth,
  containerWidth,
  formatTime,
  onCurrentTimeChange,
  isPlaying = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [showTimeLabel, setShowTimeLabel] = useState(false);

  const pixelsPerSecond = containerWidth / timelineWidth;
  const leftPos = currentTime * pixelsPerSecond;
  const isEditable = onCurrentTimeChange != null;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartTime(currentTime);
    },
    [currentTime],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX;
      const deltaTime = deltaX / pixelsPerSecond;
      const newTime = Math.max(0, Math.min(timelineWidth, dragStartTime + deltaTime));

      onCurrentTimeChange?.(newTime);
    },
    [isDragging, dragStartX, dragStartTime, pixelsPerSecond, timelineWidth, onCurrentTimeChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isPlaying && !isEditable) {
    return null;
  }

  return (
    <div
      className={classNames(classes.currentTimeIndicator, {
        [classes.dragging]: isDragging,
        [classes.editable]: isEditable,
      })}
      style={{ left: `${leftPos}px` }}
      onMouseDown={isEditable ? handleMouseDown : undefined}
      onMouseEnter={() => setShowTimeLabel(true)}
      onMouseLeave={() => setShowTimeLabel(false)}
    >
      <div className={classes.currentTimeLine} />
      <div className={classes.currentTimeThumb} />
      <Transition
        transition='fade-down'
        duration={200}
        exitDelay={200}
        mounted={isPlaying || showTimeLabel || isDragging}
      >
        {(styles) => (
          <div style={styles} className={classes.currentTimeLabel}>
            {formatTime(currentTime)}
          </div>
        )}
      </Transition>
    </div>
  );
};

export default CurrentTimeIndicator;
