import { throttle } from '@tanstack/react-pacer';
import { Ref, RefObject, useCallback, useMemo, useRef } from 'react';

import { HOUR, TimerType } from './stopwatch.constants';

interface UseTimerControllerParams {
  timerType: TimerType;
  initialTime: number;
  formatTime: (currentTime: number) => string;
  throttleWait?: number;
  onTimeAdded?: (nextTime: number) => void;
  onTimeSubtracted?: (nextTime: number) => void;
  onTimeSet?: (nextTime: number) => void;
  onTimeReset?: (nextTime: number) => void;
  onTimeEnd?: () => void;
}

export interface TimerController {
  timerType: TimerType;
  textRef: Ref<HTMLDivElement | null>;
  getTime: () => number;
  setTime: (nextTime: number) => number;
  updateTime: (timeDifference?: number) => number;
  addTime: (timeDifference: number) => number;
  subtractTime: (timeDifference: number) => number;
  resetTime: (nextTime?: number) => number;
  formatTime: (currentTime?: number) => string;
  parseInput: (value: string) => number | null;
  setEditing: (checkIsEditing: boolean) => void;
}

const parseStopwatchInput = (value: string, currentTime: number): number | null => {
  const parts = value.split(':').map(Number);
  const [firstPart, secondPart, thirdPart] = parts;
  const checkUsesHourFormat = currentTime >= HOUR;

  if (parts.length !== 3 || secondPart > 59) {
    return null;
  }

  if (checkUsesHourFormat) {
    if (thirdPart > 59) {
      return null;
    }

    return ((firstPart * 60 + secondPart) * 60 + thirdPart) * 1000;
  }

  if (thirdPart > 99) {
    return null;
  }

  return (firstPart * 60 + secondPart) * 1000 + thirdPart * 10;
};

const parseTotalTimeInput = (value: string): number | null => {
  const parts = value.split(':').map(Number);
  const [hours, minutes, seconds] = parts;

  if (parts.length !== 3 || minutes > 59 || seconds > 59) {
    return null;
  }

  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
};

const normalizeTimerInput = (value: string): string | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parts = trimmedValue.split(':').map((part) => part.trim());
  if (parts.some((part) => part === '' || !/^\d+$/.test(part))) {
    return null;
  }

  return parts.join(':');
};

const useTimerController = ({
  timerType,
  initialTime,
  formatTime,
  throttleWait,
  onTimeAdded,
  onTimeSubtracted,
  onTimeSet,
  onTimeReset,
  onTimeEnd,
}: UseTimerControllerParams): TimerController => {
  const timeRef = useRef(initialTime);
  const textRef = useRef<HTMLDivElement>(null);
  const checkIsEditingRef = useRef(false);

  const renderTime = useCallback(
    (currentTime: number): void => {
      if (textRef.current && !checkIsEditingRef.current) {
        textRef.current.textContent = formatTime(currentTime);
      }
    },
    [formatTime],
  );

  const updateDisplay = useMemo(
    () =>
      throttleWait
        ? throttle(renderTime, { wait: throttleWait, leading: true, trailing: true })
        : (currentTime: number): void => renderTime(currentTime),
    [renderTime, throttleWait],
  );

  const setTime = useCallback(
    (nextTime: number, bypassThrottle = false): number => {
      timeRef.current = Math.max(nextTime, 0);
      if (bypassThrottle) {
        renderTime(timeRef.current);
      } else {
        updateDisplay(timeRef.current);
      }

      return timeRef.current;
    },
    [updateDisplay, renderTime],
  );

  const setTimeWithCallback = useCallback(
    (nextTime: number): number => {
      const appliedTime = setTime(nextTime);
      onTimeSet?.(appliedTime);

      return appliedTime;
    },
    [onTimeSet, setTime],
  );

  const updateTime = useCallback(
    (timeDifference = 0, bypassThrottle = false): number => {
      const previousTime = timeRef.current;
      const nextTime = setTime(previousTime + timeDifference, bypassThrottle);

      if (previousTime > 0 && nextTime === 0 && timeDifference < 0) {
        onTimeEnd?.();
      }

      return nextTime;
    },
    [onTimeEnd, setTime],
  );

  const addTime = useCallback(
    (timeDifference: number): number => {
      const nextTime = updateTime(timeDifference, true);
      onTimeAdded?.(nextTime);

      return nextTime;
    },
    [onTimeAdded, updateTime],
  );

  const subtractTime = useCallback(
    (timeDifference: number): number => {
      const nextTime = updateTime(-Math.abs(timeDifference), true);
      onTimeSubtracted?.(nextTime);

      return nextTime;
    },
    [onTimeSubtracted, updateTime],
  );

  const resetTime = useCallback(
    (nextTime = initialTime): number => {
      const appliedTime = setTime(nextTime, true);
      onTimeReset?.(appliedTime);

      return appliedTime;
    },
    [initialTime, onTimeReset, setTime],
  );

  const getTime = useCallback((): number => timeRef.current, []);

  const getFormattedTime = useCallback(
    (currentTime = timeRef.current): string => formatTime(currentTime),
    [formatTime],
  );

  const parseInput = useCallback(
    (value: string): number | null => {
      const normalizedValue = normalizeTimerInput(value);

      if (normalizedValue == null) {
        return null;
      }

      return timerType === 'stopwatch'
        ? parseStopwatchInput(normalizedValue, timeRef.current)
        : parseTotalTimeInput(normalizedValue);
    },
    [timerType],
  );

  const setEditing = useCallback((checkIsEditing: boolean): void => {
    checkIsEditingRef.current = checkIsEditing;
  }, []);

  const textRefCallback = useCallback(
    (element: HTMLInputElement | null): void => {
      textRef.current = element;
      updateTime(0, true);
    },
    [updateTime],
  );

  return useMemo(
    () => ({
      timerType,
      textRef: textRefCallback,
      getTime,
      setTime: setTimeWithCallback,
      updateTime,
      addTime,
      subtractTime,
      resetTime,
      formatTime: getFormattedTime,
      parseInput,
      setEditing,
    }),
    [
      addTime,
      getFormattedTime,
      getTime,
      parseInput,
      resetTime,
      setEditing,
      setTimeWithCallback,
      subtractTime,
      textRefCallback,
      timerType,
      updateTime,
    ],
  );
};

export default useTimerController;
