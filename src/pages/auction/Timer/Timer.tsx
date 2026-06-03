import clsx from 'clsx';
import { RefObject, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@reducers';
import { useHeadroom } from '@shared/lib/scroll';
import useStorageState from '@hooks/useStorageState';

import classes from './Timer.module.css';
import TimerControls from './TimerControls';
import SwappableTimer from './SwappableTimer';
import { TIMER_STEP, TimerType } from './timer.constants';
import { formatTimerTime, formatTotalTime } from './timer.utils';
import useTimerAutoUpdateRules from './useTimerAutoUpdateRules';
import useTimerController from './useTimerController';

export interface TimerControllerHandle {
  getTimeLeft: () => number;
  getState: () => 'paused' | 'running';
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
  getTotalTime: () => number;
}

export interface TimerProps {
  controller?: RefObject<TimerControllerHandle | null>;
  showControls?: boolean;
  onPause?: (timeLeft: number) => void;
  onStart?: (timeLeft: number) => void;
  onReset?: (timeLeft: number) => void;
  onTimeChanged?: (timeLeft: number, state: 'paused' | 'running') => void;
  onTotalTimeChanged?: (totalTime: number) => void;
  onTimeEdited?: (timerType: TimerType) => void;
  onEnd?: () => void;
}

const FAST_CLICK_THRESHOLD = 8;
const FAST_CLICK_WINDOW_MS = 4000;

const Timer: React.FC<TimerProps> = ({
  controller,
  showControls = true,
  onPause,
  onStart,
  onReset,
  onTimeChanged,
  onTotalTimeChanged,
  onTimeEdited,
  onEnd,
}) => {
  const startTime = useSelector((root: RootState) => root.aucSettings.settings.startTime);
  const showTotalTime = useSelector((root: RootState) => root.aucSettings.settings.showTotalTime);
  const timerResetRequestId = useSelector((root: RootState) => root.activeAuctionHistory.timerResetRequestId);
  const defaultTime = Number(startTime) * 60 * 1000;
  const controlsCompact = useHeadroom({ fixedAt: 60 });

  const [isStopped, setIsStopped] = useState<boolean>(true);
  const [showManualEditHint, setShowManualEditHint] = useState(false);
  const frameId = useRef<number | undefined>(undefined);
  const prevTimestamp = useRef<number | undefined>(undefined);
  const previousTimerResetRequestId = useRef(timerResetRequestId);
  const [checkIsManualEditHintAlreadyShown, setCheckIsManualEditHintAlreadyShown] = useStorageState(
    'checkIsManualEditHintAlreadyShown',
    false,
  );
  const lastControlClick = useRef<{ buttonName: string; timestamp: number; count: number } | null>(null);
  const [mainTimer, setMainTimer] = useState<TimerType>('timer');

  const handleTimerEnd = useCallback((): void => {
    setIsStopped(true);
    onEnd?.();
  }, [onEnd]);

  const notifyTimerTimeChanged = useCallback(
    (timeLeft: number): void => {
      onTimeChanged?.(timeLeft, isStopped ? 'paused' : 'running');
    },
    [isStopped, onTimeChanged],
  );

  const notifyTimerEditingTimeChanged = useCallback(
    (timeLeft: number): void => {
      onTimeChanged?.(timeLeft, 'paused');
    },
    [onTimeChanged],
  );

  const countdownTimerController = useTimerController({
    timerType: 'timer',
    initialTime: defaultTime,
    formatTime: formatTimerTime,
    throttleWait: 68,
    onTimeAdded: notifyTimerTimeChanged,
    onTimeSubtracted: notifyTimerTimeChanged,
    onTimeSet: notifyTimerEditingTimeChanged,
    onTimeReset: onReset,
    onTimeEnd: handleTimerEnd,
  });

  const totalTimeController = useTimerController({
    timerType: 'total',
    initialTime: 0,
    formatTime: formatTotalTime,
  });

  useEffect(() => {
    if (!showTotalTime) {
      setMainTimer('timer');
    } else {
      totalTimeController.updateTime(0);
    }
  }, [showTotalTime, totalTimeController]);

  const mainTimerController = useMemo(
    () => (mainTimer === 'timer' ? countdownTimerController : totalTimeController),
    [mainTimer, countdownTimerController, totalTimeController],
  );

  const updateTimerAutomatically = useCallback(
    (timeChange: number): void => {
      countdownTimerController.updateTime(timeChange);
    },
    [countdownTimerController],
  );

  useTimerAutoUpdateRules({
    getTime: countdownTimerController.getTime,
    updateTimer: updateTimerAutomatically,
  });

  const updateTimeOnFrame = useCallback(
    (timestamp: number): void => {
      if (prevTimestamp.current) {
        const timeDifference = prevTimestamp.current - timestamp;
        countdownTimerController.updateTime(timeDifference);
        totalTimeController.updateTime(-timeDifference);
      }

      prevTimestamp.current = timestamp;
      frameId.current = countdownTimerController.getTime() ? requestAnimationFrame(updateTimeOnFrame) : undefined;
    },
    [countdownTimerController, totalTimeController],
  );

  const stopTimer = useCallback((): void => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
      frameId.current = undefined;
    }

    setIsStopped(true);
    onPause?.(countdownTimerController.getTime());
  }, [countdownTimerController, onPause]);

  const startTimer = useCallback((): void => {
    if (countdownTimerController.getTime() && !frameId.current) {
      setIsStopped(false);
      prevTimestamp.current = undefined;
      frameId.current = requestAnimationFrame(updateTimeOnFrame);
      onStart?.(countdownTimerController.getTime());
    }
  }, [countdownTimerController, onStart, updateTimeOnFrame]);

  useEffect(
    () => () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    },
    [],
  );

  const resetTimer = useCallback((): void => {
    stopTimer();
    countdownTimerController.resetTime(defaultTime);
    totalTimeController.resetTime(0);
    onTotalTimeChanged?.(0);
  }, [countdownTimerController, defaultTime, onTotalTimeChanged, stopTimer, totalTimeController]);

  useEffect(() => {
    if (previousTimerResetRequestId.current === timerResetRequestId) {
      return;
    }

    previousTimerResetRequestId.current = timerResetRequestId;
    stopTimer();
    setMainTimer('timer');
    countdownTimerController.setTime(defaultTime);
    totalTimeController.setTime(0);
    onTotalTimeChanged?.(0);
  }, [countdownTimerController, defaultTime, onTotalTimeChanged, stopTimer, timerResetRequestId, totalTimeController]);

  const applyTimeControl = (timeDifference: number): number => {
    const nextTime =
      timeDifference >= 0
        ? mainTimerController.addTime(timeDifference)
        : mainTimerController.subtractTime(Math.abs(timeDifference));

    if (mainTimer === 'total') {
      onTotalTimeChanged?.(nextTime);
    }

    return nextTime;
  };

  const addTime = (): number => applyTimeControl(TIMER_STEP);
  const addDoubleTime = (): number => applyTimeControl(TIMER_STEP * 2);
  const subtractTime = (): number => applyTimeControl(-TIMER_STEP);

  const handleControlButtonClick = useCallback(
    (buttonName: string): void => {
      if (checkIsManualEditHintAlreadyShown) {
        return;
      }

      const timestampNow = Date.now();
      const previousClick = lastControlClick.current;

      if (
        !previousClick ||
        previousClick.buttonName !== buttonName ||
        timestampNow - previousClick.timestamp > FAST_CLICK_WINDOW_MS
      ) {
        lastControlClick.current = { buttonName, timestamp: timestampNow, count: 1 };
        return;
      }

      const nextCount = previousClick.count + 1;
      lastControlClick.current = { buttonName, timestamp: timestampNow, count: nextCount };

      if (nextCount > FAST_CLICK_THRESHOLD) {
        setCheckIsManualEditHintAlreadyShown(true);
        setShowManualEditHint(true);
      }
    },
    [checkIsManualEditHintAlreadyShown, setCheckIsManualEditHintAlreadyShown, setShowManualEditHint],
  );

  const swapTimers = useCallback(() => setMainTimer((type) => (type === 'timer' ? 'total' : 'timer')), []);
  useImperativeHandle(controller, () => ({
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
    setTime: (time: number) => {
      countdownTimerController.setTime(time);
    },
    getTimeLeft: () => countdownTimerController.getTime(),
    getState: () => (isStopped ? 'paused' : 'running'),
    getTotalTime: () => totalTimeController.getTime(),
  }));

  return (
    <div className={clsx(classes.wrapper, { [classes.wrapperCompact]: controlsCompact })}>
      <SwappableTimer
        mainTimer={mainTimer}
        showControls={showControls}
        showTotalTime={showTotalTime}
        checkIsTimerStopped={isStopped}
        timerController={countdownTimerController}
        totalTimeController={totalTimeController}
        onMainTimerChange={setMainTimer}
        onPauseTimer={stopTimer}
        onResumeTimer={startTimer}
        onTimerTimeChanged={notifyTimerEditingTimeChanged}
        onTotalTimeChanged={onTotalTimeChanged}
        onTimeEdited={onTimeEdited}
        onSwapTimers={swapTimers}
        showManualEditHint={showManualEditHint}
        hideManualEditHint={() => setShowManualEditHint(false)}
      />
      {showControls && (
        <TimerControls
          checkIsStopped={isStopped}
          onStart={startTimer}
          onStop={stopTimer}
          onReset={resetTimer}
          onAddTime={addTime}
          onSubtractTime={subtractTime}
          onAddDoubleTime={addDoubleTime}
          onControlButtonClick={handleControlButtonClick}
        />
      )}
    </div>
  );
};

export default Timer;
