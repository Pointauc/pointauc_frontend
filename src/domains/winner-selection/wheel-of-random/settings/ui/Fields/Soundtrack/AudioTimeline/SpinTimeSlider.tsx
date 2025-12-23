import { FC, useCallback, useRef, useState, useEffect } from 'react';
import classNames from 'classnames';

import classes from './AudioTimeline.module.css';
import CurrentTimeIndicator from './CurrentTimeIndicator';

interface SpinTimeSliderProps {
  offset: number;
  spinTime: number;
  minSpinTime?: number;
  maxSpinTime?: number;
  isRandomSpin: boolean;
  audioDuration: number;
  timelineWidth: number;
  containerWidth: number;
  currentPlayTime: number;
  onOffsetChange: (offset: number) => void;
  onSpinTimeChange: (spinTime: number, minSpinTime?: number) => void;
  formatTime: (seconds: number) => string;
  onCurrentTimeChange: (time: number) => void;
}

const minSpinTimeAllowed = 5;

/**
 * Draggable slider showing which portion of audio plays during spin
 * Supports 1-3 thumbs depending on random spin configuration
 */
const SpinTimeSlider: FC<SpinTimeSliderProps> = ({
  offset,
  spinTime,
  minSpinTime,
  maxSpinTime,
  isRandomSpin,
  audioDuration: _audioDuration,
  timelineWidth: _timelineWidth,
  containerWidth,
  onOffsetChange,
  onSpinTimeChange,
  formatTime,
  currentPlayTime,
  onCurrentTimeChange,
}) => {
  const [isDragging, setIsDragging] = useState<'region' | 'left' | 'middle' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, initialOffset: 0, initialSpinTime: 0, initialMinSpinTime: 0 });

  const timelineWidth = Math.floor(_timelineWidth);
  const audioDuration = Math.floor(_audioDuration);

  const pixelsPerSecond = containerWidth / timelineWidth;

  // Calculate positions
  const leftPos = offset * pixelsPerSecond;
  const width = (isRandomSpin && maxSpinTime ? maxSpinTime : spinTime) * pixelsPerSecond;
  const minWidth = isRandomSpin && minSpinTime ? minSpinTime * pixelsPerSecond : 0;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: 'region' | 'left' | 'middle' | 'right') => {
      e.stopPropagation();
      setIsDragging(type);
      setDragStart({
        x: e.clientX,
        initialOffset: offset,
        initialSpinTime: spinTime,
        initialMinSpinTime: minSpinTime || 0,
      });
    },
    [offset, spinTime, minSpinTime],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaTime = Math.round(deltaX / pixelsPerSecond);

      if (isDragging === 'region') {
        // Move entire region (change offset only)
        const newOffset = Math.max(0, Math.min(timelineWidth - spinTime, dragStart.initialOffset + deltaTime));
        onOffsetChange(newOffset);
      } else if (isDragging === 'left') {
        // Adjust offset and min spin time (for random spin) or just offset
        if (isRandomSpin && minSpinTime !== undefined) {
          const newOffset = Math.max(0, dragStart.initialOffset + deltaTime);
          const newMinSpinTime = Math.max(minSpinTimeAllowed, dragStart.initialMinSpinTime - deltaTime);
          console.log('deltaTime', deltaTime, 'newMinSpinTime', newMinSpinTime);
          onOffsetChange(newOffset);
          onSpinTimeChange(dragStart.initialSpinTime - deltaTime, newMinSpinTime);
        } else {
          const newOffset = Math.max(0, dragStart.initialOffset + deltaTime);
          const newSpinTime = Math.max(minSpinTimeAllowed, dragStart.initialSpinTime - deltaTime);

          onOffsetChange(newOffset);
          onSpinTimeChange(newSpinTime);
        }
      } else if (isDragging === 'middle' && isRandomSpin && minSpinTime !== undefined) {
        // Adjust min spin time only
        const newMinSpinTime = Math.max(1, Math.min(maxSpinTime || spinTime, dragStart.initialMinSpinTime + deltaTime));
        onSpinTimeChange(spinTime, newMinSpinTime);
      } else if (isDragging === 'right') {
        // Update offset value when the boundary is reached
        const adjustOffset = (newSpinTime: number) => {
          const isOverflowed = newSpinTime + dragStart.initialOffset > timelineWidth;
          if (isOverflowed && dragStart.initialSpinTime <= timelineWidth) {
            onOffsetChange(Math.max(0, audioDuration - newSpinTime));
          }
        };

        // Adjust max spin time (or spin time if not random)
        if (isRandomSpin && maxSpinTime !== undefined) {
          const newMaxSpinTime = Math.max((minSpinTime || 1) + 1, dragStart.initialSpinTime + deltaTime);
          onSpinTimeChange(newMaxSpinTime, minSpinTime);
          adjustOffset(newMaxSpinTime);
        } else {
          const newSpinTime = Math.max(minSpinTimeAllowed, dragStart.initialSpinTime + deltaTime);
          onSpinTimeChange(newSpinTime);
          adjustOffset(newSpinTime);
        }
      }
    },
    [
      isDragging,
      dragStart.x,
      dragStart.initialOffset,
      dragStart.initialMinSpinTime,
      dragStart.initialSpinTime,
      pixelsPerSecond,
      isRandomSpin,
      minSpinTime,
      timelineWidth,
      spinTime,
      onOffsetChange,
      onSpinTimeChange,
      maxSpinTime,
      audioDuration,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
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
    <>
      <div
        className={classNames(classes.sliderRegion)}
        style={{
          left: `${leftPos}px`,
          width: `${width}px`,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'region')}
      >
        {/* filled areas */}
        <div className={classes.sliderStaticRegionFilled} style={{ left: `0px`, width: `${width || width}px` }} />
        {isRandomSpin && minSpinTime !== undefined && (
          <div
            className={classes.sliderRandomRegionFilled}
            style={{ left: `${minWidth}px`, width: `${width - minWidth}px` }}
          />
        )}
      </div>

      <CurrentTimeIndicator
        currentTime={currentPlayTime}
        offset={offset}
        timelineWidth={timelineWidth}
        containerWidth={containerWidth}
        formatTime={formatTime}
        onCurrentTimeChange={onCurrentTimeChange}
      />
      <div
        style={{
          position: 'absolute',
          left: `${leftPos}px`,
          top: 0,
          bottom: 0,
          width: `${width}px`,
          height: '100%',
        }}
      >
        {/* Left thumb */}
        <div
          className={classNames(classes.sliderThumb, classes.sliderThumbLeft)}
          onMouseDown={(e) => handleMouseDown(e, 'left')}
        >
          <div className={classes.thumbLabel}>{formatTime(offset)}</div>
        </div>

        {/* Middle thumb (only for random spin) */}
        {isRandomSpin && minSpinTime !== undefined && (
          <div
            className={classNames(classes.sliderThumb, classes.sliderThumbMiddle)}
            style={{ left: `${minWidth}px` }}
            onMouseDown={(e) => handleMouseDown(e, 'middle')}
          >
            <div className={classes.thumbLabel}>{formatTime(offset + minSpinTime)}</div>
          </div>
        )}

        {/* Right thumb */}
        <div
          className={classNames(classes.sliderThumb, classes.sliderThumbRight)}
          onMouseDown={(e) => handleMouseDown(e, 'right')}
        >
          <div className={classes.thumbLabel}>
            {formatTime(offset + (isRandomSpin && maxSpinTime ? maxSpinTime : spinTime))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SpinTimeSlider;
