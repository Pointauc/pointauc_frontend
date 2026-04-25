import { useCallback, useRef, useState } from 'react';

import { HOUR, TimerType } from './stopwatch.constants';

interface EditingState {
  type: TimerType;
  value: string;
}

interface UseTimerEditingParams {
  showControls: boolean;
  checkIsStopped: boolean;
  getStopwatchTime: () => number;
  getTotalTime: () => number;
  formatStopwatchTime: (currentTime: number) => string;
  formatTotalTime: (currentTime: number) => string;
  stopTimer: () => void;
  startTimer: () => void;
  setFocusedTimer: (timerType: TimerType) => void;
  applyStopwatchTime: (nextTime: number) => void;
  applyTotalTime: (nextTime: number) => void;
}

interface UseTimerEditingResult {
  editingState: EditingState | null;
  startEditing: (timerType: TimerType) => void;
  updateEditingValue: (value: string) => void;
  commitEditing: () => void;
  cancelEditing: () => void;
}

const useTimerEditing = ({
  showControls,
  checkIsStopped,
  getStopwatchTime,
  getTotalTime,
  formatStopwatchTime,
  formatTotalTime,
  stopTimer,
  startTimer,
  setFocusedTimer,
  applyStopwatchTime,
  applyTotalTime,
}: UseTimerEditingParams): UseTimerEditingResult => {
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const checkShouldResumeAfterEditing = useRef(false);

  const parseTimerInput = useCallback(
    (value: string, timerType: TimerType): number | null => {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        return null;
      }

      const parts = trimmedValue.split(':').map((part) => part.trim());
      if (parts.some((part) => part === '' || !/^\d+$/.test(part))) {
        return null;
      }

      if (timerType === 'total') {
        if (parts.length > 3) {
          return null;
        }

        const normalizedParts = [0, 0, 0];
        parts.forEach((part, index) => {
          normalizedParts[normalizedParts.length - parts.length + index] = Number(part);
        });

        const [hours, minutes, seconds] = normalizedParts;
        if (minutes > 59 || seconds > 59) {
          return null;
        }

        return ((hours * 60 + minutes) * 60 + seconds) * 1000;
      }

      if (parts.length < 2 || parts.length > 3) {
        return null;
      }

      if (parts.length === 2) {
        const [minutes, seconds] = parts.map(Number);
        if (seconds > 59) {
          return null;
        }

        return (minutes * 60 + seconds) * 1000;
      }

      const [firstPart, secondPart, thirdPart] = parts.map(Number);
      const checkUsesHourFormat = getStopwatchTime() >= HOUR;

      if (checkUsesHourFormat) {
        if (secondPart > 59 || thirdPart > 59) {
          return null;
        }

        return ((firstPart * 60 + secondPart) * 60 + thirdPart) * 1000;
      }

      if (secondPart > 59 || thirdPart > 99) {
        return null;
      }

      return (firstPart * 60 + secondPart) * 1000 + thirdPart * 10;
    },
    [getStopwatchTime],
  );

  const finishEditing = useCallback(
    (checkCommit: boolean) => {
      if (!editingState) {
        return;
      }

      if (checkCommit) {
        const nextTime = parseTimerInput(editingState.value, editingState.type);

        if (nextTime != null) {
          if (editingState.type === 'stopwatch') {
            applyStopwatchTime(nextTime);
          } else {
            applyTotalTime(nextTime);
          }
        }
      }

      const checkShouldResume = checkShouldResumeAfterEditing.current;
      checkShouldResumeAfterEditing.current = false;
      setEditingState(null);

      if (checkShouldResume && getStopwatchTime() > 0) {
        startTimer();
      }
    },
    [applyStopwatchTime, applyTotalTime, editingState, getStopwatchTime, parseTimerInput, startTimer],
  );

  const startEditing = useCallback(
    (timerType: TimerType) => {
      if (!showControls) {
        return;
      }

      checkShouldResumeAfterEditing.current = !checkIsStopped;
      if (!checkIsStopped) {
        stopTimer();
      }

      setFocusedTimer(timerType);
      setEditingState({
        type: timerType,
        value: timerType === 'stopwatch' ? formatStopwatchTime(getStopwatchTime()) : formatTotalTime(getTotalTime()),
      });
    },
    [
      checkIsStopped,
      formatStopwatchTime,
      formatTotalTime,
      getStopwatchTime,
      getTotalTime,
      setFocusedTimer,
      showControls,
      stopTimer,
    ],
  );

  const updateEditingValue = useCallback((value: string) => {
    setEditingState((currentState) => (currentState ? { ...currentState, value } : currentState));
  }, []);

  const commitEditing = useCallback(() => {
    finishEditing(true);
  }, [finishEditing]);

  const cancelEditing = useCallback(() => {
    finishEditing(false);
  }, [finishEditing]);

  return {
    editingState,
    startEditing,
    updateEditingValue,
    commitEditing,
    cancelEditing,
  };
};

export default useTimerEditing;
