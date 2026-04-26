import clsx from 'clsx';
import { RefObject, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';
import { useHeadroom } from '@shared/lib/scroll';

import classes from './Stopwatch.module.css';
import StopwatchControls from './StopwatchControls';
import SwappableTimer from './SwappableTimer';
import { STOPWATCH_STEP, TimerType } from './stopwatch.constants';
import { formatStopwatchTime, formatTotalTime } from './stopwatch.utils';
import useTimerAutoUpdateRules from './useTimerAutoUpdateRules';
import useTimerController from './useTimerController';

export interface StopwatchController {
  getTimeLeft: () => number;
  getState: () => 'paused' | 'running';
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
}

export interface StopwatchProps {
  controller?: RefObject<StopwatchController | null>;
  showControls?: boolean;
  onPause?: (timeLeft: number) => void;
  onStart?: (timeLeft: number) => void;
  onReset?: (timeLeft: number) => void;
  onTimeChanged?: (timeLeft: number, state: 'paused' | 'running') => void;
  onTimeEdited?: (timerType: TimerType) => void;
  onEnd?: () => void;
}

const Stopwatch: React.FC<StopwatchProps> = ({
  controller,
  showControls = true,
  onPause,
  onStart,
  onReset,
  onTimeChanged,
  onTimeEdited,
  onEnd,
}) => {
  const startTime = useSelector((root: RootState) => root.aucSettings.settings.startTime);
  const showTotalTime = useSelector((root: RootState) => root.aucSettings.settings.showTotalTime);
  const defaultTime = Number(startTime) * 60 * 1000;
  const controlsCompact = useHeadroom({ fixedAt: 60 });

  const [isStopped, setIsStopped] = useState<boolean>(true);
  const frameId = useRef<number | undefined>(undefined);
  const prevTimestamp = useRef<number | undefined>(undefined);
  const [mainTimer, setMainTimer] = useState<TimerType>('stopwatch');

  const handleStopwatchEnd = useCallback((): void => {
    setIsStopped(true);
    onEnd?.();
  }, [onEnd]);

  const notifyStopwatchTimeChanged = useCallback(
    (timeLeft: number): void => {
      onTimeChanged?.(timeLeft, isStopped ? 'paused' : 'running');
    },
    [isStopped, onTimeChanged],
  );

  const notifyStopwatchEditingTimeChanged = useCallback(
    (timeLeft: number): void => {
      onTimeChanged?.(timeLeft, 'paused');
    },
    [onTimeChanged],
  );

  const stopwatchController = useTimerController({
    timerType: 'stopwatch',
    initialTime: defaultTime,
    formatTime: formatStopwatchTime,
    throttleWait: 68,
    onTimeAdded: notifyStopwatchTimeChanged,
    onTimeSubtracted: notifyStopwatchTimeChanged,
    onTimeSet: notifyStopwatchEditingTimeChanged,
    onTimeReset: onReset,
    onTimeEnd: handleStopwatchEnd,
  });

  const totalTimeController = useTimerController({
    timerType: 'total',
    initialTime: 0,
    formatTime: formatTotalTime,
  });

  useEffect(() => {
    if (!showTotalTime) {
      setMainTimer('stopwatch');
    } else {
      totalTimeController.updateTime(0);
    }
  }, [showTotalTime, totalTimeController]);

  const mainTimerController = useMemo(
    () => (mainTimer === 'stopwatch' ? stopwatchController : totalTimeController),
    [mainTimer, stopwatchController, totalTimeController],
  );

  const updateStopwatchAutomatically = useCallback(
    (timeChange: number): void => {
      stopwatchController.updateTime(timeChange);
    },
    [stopwatchController],
  );

  useTimerAutoUpdateRules({
    getTime: stopwatchController.getTime,
    updateTimer: updateStopwatchAutomatically,
  });

  const updateTimeOnFrame = useCallback(
    (timestamp: number): void => {
      if (prevTimestamp.current) {
        const timeDifference = prevTimestamp.current - timestamp;
        stopwatchController.updateTime(timeDifference);
        totalTimeController.updateTime(-timeDifference);
      }

      prevTimestamp.current = timestamp;
      frameId.current = stopwatchController.getTime() ? requestAnimationFrame(updateTimeOnFrame) : undefined;
    },
    [stopwatchController, totalTimeController],
  );

  const stopTimer = useCallback((): void => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
      frameId.current = undefined;
    }

    setIsStopped(true);
    onPause?.(stopwatchController.getTime());
  }, [onPause, stopwatchController]);

  const startTimer = useCallback((): void => {
    if (stopwatchController.getTime() && !frameId.current) {
      setIsStopped(false);
      prevTimestamp.current = undefined;
      frameId.current = requestAnimationFrame(updateTimeOnFrame);
      onStart?.(stopwatchController.getTime());
    }
  }, [onStart, stopwatchController, updateTimeOnFrame]);

  useEffect(
    () => () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    },
    [],
  );

  const resetTimer = useCallback((): void => {
    if (mainTimer === 'stopwatch') {
      stopTimer();
      stopwatchController.resetTime(defaultTime);
      return;
    }

    totalTimeController.resetTime(0);
  }, [defaultTime, mainTimer, stopwatchController, stopTimer, totalTimeController]);

  const addTime = (): number => mainTimerController.addTime(STOPWATCH_STEP);
  const addDoubleTime = (): number => mainTimerController.addTime(STOPWATCH_STEP * 2);
  const subtractTime = (): number => mainTimerController.subtractTime(STOPWATCH_STEP);

  const swapTimers = useCallback(() => setMainTimer((type) => (type === 'stopwatch' ? 'total' : 'stopwatch')), []);
  useImperativeHandle(controller, () => ({
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
    setTime: (time: number) => {
      stopwatchController.setTime(time);
    },
    getTimeLeft: () => stopwatchController.getTime(),
    getState: () => (isStopped ? 'paused' : 'running'),
  }));

  return (
    <div className={clsx(classes.wrapper, { [classes.wrapperCompact]: controlsCompact })}>
      <SwappableTimer
        mainTimer={mainTimer}
        showControls={showControls}
        showTotalTime={showTotalTime}
        checkIsStopwatchStopped={isStopped}
        stopwatchController={stopwatchController}
        totalTimeController={totalTimeController}
        onMainTimerChange={setMainTimer}
        onPauseStopwatch={stopTimer}
        onResumeStopwatch={startTimer}
        onStopwatchTimeChanged={notifyStopwatchEditingTimeChanged}
        onTimeEdited={onTimeEdited}
        onSwapTimers={swapTimers}
      />
      {showControls && (
        <StopwatchControls
          checkIsStopped={isStopped}
          onStart={startTimer}
          onStop={stopTimer}
          onReset={resetTimer}
          onAddTime={addTime}
          onSubtractTime={subtractTime}
          onAddDoubleTime={addDoubleTime}
        />
      )}
    </div>
  );
};

export default Stopwatch;
