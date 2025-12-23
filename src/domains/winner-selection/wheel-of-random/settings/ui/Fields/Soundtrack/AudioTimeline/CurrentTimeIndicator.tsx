import { FC, useCallback, useRef, useState, useEffect } from 'react';
import classNames from 'classnames';

import classes from './AudioTimeline.module.css';

interface CurrentTimeIndicatorProps {
  currentTime: number;
  offset: number;
  timelineWidth: number;
  containerWidth: number;
  formatTime: (seconds: number) => string;
  onCurrentTimeChange: (time: number) => void;
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

  const pixelsPerSecond = containerWidth / timelineWidth;
  const leftPos = currentTime * pixelsPerSecond;

  console.log('currentTime', currentTime, 'leftPos', leftPos);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      console.log('handleMouseDown', e);
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

      onCurrentTimeChange(newTime);
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

  return (
    <div
      className={classNames(classes.currentTimeIndicator, { [classes.dragging]: isDragging })}
      style={{ left: `${leftPos}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className={classes.currentTimeLine} />
      <div className={classes.currentTimeThumb} onMouseDown={handleMouseDown} />
      {isPlaying && <div className={classes.currentTimeLabel}>{formatTime(currentTime)}</div>}
    </div>
  );
};

export default CurrentTimeIndicator;
