import {
  ReactText,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconButton, Typography, darken, emphasize } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock';
import PauseIcon from '@mui/icons-material/Pause';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { ThunkDispatch } from 'redux-thunk';
import { useTranslation } from 'react-i18next';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import classNames from 'classnames';
import clsx from 'clsx';
import { debounce, throttle } from '@tanstack/react-pacer';

import { RootState } from '@reducers';
import { Slot } from '@models/slot.model.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import twitch from '@components/Integration/Twitch';
import donatePay from '@components/Integration/DonatePay';
import da from '@components/Integration/DA';
import { useHeadroom } from '@shared/lib/scroll';

import './Stopwatch.scss';

export const STOPWATCH = {
  FORMAT: 'mm:ss:SSS',
  HOUR_FORMAT: 'mm:ss',
  TOTAL_FORMAT: 'HH:mm:ss',
};
const HOUR = 60 * 60 * 1000;

type TimerType = 'stopwatch' | 'total';

export interface StopwatchController {
  getTimeLeft: () => number;
  getState: () => 'paused' | 'running';
  start: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
}

export interface StopwatchProps {
  controller?: RefObject<StopwatchController>;
  showControls?: boolean;
  onPause?: (timeLeft: number) => void;
  onStart?: (timeLeft: number) => void;
  onReset?: (timeLeft: number) => void;
  onTimeChanged?: (timeLeft: number, state: 'paused' | 'running') => void;
  onEnd?: () => void;
}

const Stopwatch: React.FC<StopwatchProps> = ({
  controller,
  showControls = true,
  onPause,
  onStart,
  onReset,
  onTimeChanged,
  onEnd,
}) => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const {
    twitch: { actual: actualTwitchSub, loading: loadingTwitchSub },
  } = useSelector((root: RootState) => root.subscription);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const {
    startTime,
    timeStep,
    isAutoincrementActive,
    autoincrementTime,
    maxTime = 15,
    isMaxTimeActive,
    minTime,
    isMinTimeActive,
    isNewSlotIncrement,
    newSlotIncrement,
    dynamicRewards,
    showTotalTime,
    ...restSettings
  } = settings;
  const defaultTime = Number(startTime) * 60 * 1000;
  const stopwatchStep = Number(timeStep) * 1000;
  const stopwatchAutoincrement = Number(autoincrementTime) * 1000;
  const controlsCompact = useHeadroom({ fixedAt: 60 });

  const [isStopped, setIsStopped] = useState<boolean>(true);
  const [isStopwatchChanged, setIsStopwatchChanged] = useState<boolean>(false);
  const previousSlotsLength = useRef(1);
  const timeLeft = useRef<number>(defaultTime);
  const totalTime = useRef<number>(0);
  const frameId = useRef<number>();
  const prevTimestamp = useRef<number>();
  const stopwatchElement = useRef<HTMLDivElement>(null);
  const totalTimeElement = useRef<HTMLDivElement>(null);
  const winnerRef = useRef<Slot>();
  const daSettings = useRef(restSettings);
  const [focusedTimer, setFocusedTimer] = useState<TimerType>('stopwatch');

  useEffect(() => {
    daSettings.current = restSettings;
  }, [restSettings]);

  useEffect(() => {
    if (!dynamicRewards || loadingTwitchSub || !isStopwatchChanged || isStopped !== actualTwitchSub) {
      return;
    }

    setIsStopwatchChanged(false);
    integrationUtils.setSubscribeState(twitch, !isStopped);
  }, [actualTwitchSub, dispatch, dynamicRewards, isStopped, isStopwatchChanged, loadingTwitchSub]);

  const winnerSlot = useMemo(() => {
    [winnerRef.current] = slots;

    return slots[0];
  }, [slots]);
  const previousWinnerSlotId = useRef<ReactText>(winnerSlot.id);

  const updateTimerUIDebounced = useMemo(
    () =>
      throttle(
        (timeLeft: number): void => {
          const date = dayjs(timeLeft);
          const hours = Math.floor(timeLeft / HOUR);
          const formatted = hours ? date.format(STOPWATCH.HOUR_FORMAT) : date.format(STOPWATCH.FORMAT).slice(0, -1);
          if (stopwatchElement.current) {
            stopwatchElement.current.textContent = hours
              ? `${hours > 9 ? hours : `0${hours}`}:${formatted}`
              : formatted;
          }
        },
        { wait: 68, leading: true, trailing: true },
      ),
    [],
  );

  const updateStopwatch = useCallback(
    (timeDifference = 0): void => {
      if (stopwatchElement.current) {
        timeLeft.current += timeDifference;
        if (timeLeft.current < 0) {
          timeLeft.current = 0;
          setIsStopped(true);
          setIsStopwatchChanged(true);
          onEnd?.();
        }
        updateTimerUIDebounced(timeLeft.current);
      }
    },
    [onEnd, updateTimerUIDebounced],
  );

  const updateTotalTime = useCallback((timeDifference = 0) => {
    totalTime.current += timeDifference;
    if (totalTime.current < 0) {
      totalTime.current = 0;
    }

    if (totalTimeElement.current) {
      const date = dayjs.duration(totalTime.current);
      totalTimeElement.current.textContent = date.format(STOPWATCH.TOTAL_FORMAT);
    }
  }, []);

  useEffect(() => {
    if (!showTotalTime) {
      setFocusedTimer('stopwatch');
    } else {
      updateTotalTime();
    }
  }, [showTotalTime, updateTotalTime]);

  const updateFocusedTimer = useMemo(
    () => (focusedTimer === 'stopwatch' ? updateStopwatch : updateTotalTime),
    [focusedTimer, updateStopwatch, updateTotalTime],
  );

  const autoUpdateTimer = useCallback(
    (timeChange: number) => {
      const maxMilliseconds = maxTime * 60 * 1000;

      if (isMinTimeActive && timeLeft.current > minTime * 60 * 1000) return;

      // if (isMaxTimeActive) {
      //   if (timeLeft.current < maxMilliseconds) {
      //     updateStopwatch(
      //       timeLeft.current + timeChange > maxMilliseconds ? maxMilliseconds - timeLeft.current : timeChange,
      //     );
      //   }

      //   return;
      // }

      updateStopwatch(timeChange);
    },
    [isMinTimeActive, maxTime, minTime, updateStopwatch],
  );

  const handleDonation = useCallback(() => {
    const { isIncrementActive, incrementTime } = daSettings.current;

    if (isIncrementActive) {
      autoUpdateTimer(incrementTime * 1000);
    }
  }, [autoUpdateTimer]);

  useEffect(() => {
    const unsubDonatePay = donatePay.pubsubFlow.events.on('bid', handleDonation);
    const unsubDa = da.pubsubFlow.events.on('bid', handleDonation);

    return () => {
      unsubDa();
      unsubDonatePay();
    };
  }, [handleDonation]);

  useEffect(() => {
    updateStopwatch();
  }, [updateStopwatch, updateTotalTime]);

  useEffect(() => {
    if (slots.length > previousSlotsLength.current && isNewSlotIncrement) {
      autoUpdateTimer(Number(newSlotIncrement) * 1000);
    }

    previousSlotsLength.current = slots.length;
  }, [autoUpdateTimer, isNewSlotIncrement, newSlotIncrement, slots.length]);

  const updateTimeOnFrame = (timestamp: number): void => {
    if (prevTimestamp.current) {
      const timeDifference = prevTimestamp.current - timestamp;
      updateStopwatch(timeDifference);
      updateTotalTime(-timeDifference);
    }
    prevTimestamp.current = timestamp;
    frameId.current = timeLeft.current ? requestAnimationFrame(updateTimeOnFrame) : undefined;
  };
  const stopTimer = (): void => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
      frameId.current = undefined;
    }
    setIsStopped(true);
    setIsStopwatchChanged(true);
    onPause?.(timeLeft.current);
  };

  const resetTimer = useCallback((): void => {
    if (focusedTimer === 'stopwatch') {
      stopTimer();
      timeLeft.current = defaultTime;
      updateStopwatch();
      onReset?.(timeLeft.current);
    } else {
      totalTime.current = 0;
      updateTotalTime();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTime, focusedTimer, onReset, updateTotalTime, updateStopwatch]);

  const startTimer = (): void => {
    if (timeLeft.current) {
      setIsStopped(false);
      setIsStopwatchChanged(true);
      prevTimestamp.current = undefined;
      frameId.current = requestAnimationFrame(updateTimeOnFrame);
      onStart?.(timeLeft.current);
    }
  };

  const addTime = (): void => {
    updateFocusedTimer(stopwatchStep);
    onTimeChanged?.(timeLeft.current, isStopped ? 'paused' : 'running');
  };
  const addDoubleTime = (): void => {
    updateFocusedTimer(stopwatchStep * 2);
    onTimeChanged?.(timeLeft.current, isStopped ? 'paused' : 'running');
  };
  const subtractTime = (): void => {
    updateFocusedTimer(-stopwatchStep);
    onTimeChanged?.(timeLeft.current, isStopped ? 'paused' : 'running');
  };

  useEffect(() => {
    if (isAutoincrementActive && winnerSlot.amount && previousWinnerSlotId.current !== winnerSlot.id) {
      autoUpdateTimer(Number(stopwatchAutoincrement));
    }
    previousWinnerSlotId.current = winnerSlot.id;
  }, [autoUpdateTimer, isAutoincrementActive, stopwatchAutoincrement, updateStopwatch, winnerSlot]);

  const swapTimers = () => setFocusedTimer((type) => (type === 'stopwatch' ? 'total' : 'stopwatch'));
  const timerClasses = (type: TimerType) => ({ [focusedTimer === type ? 'timer-primary' : 'timer-secondary']: true });

  useImperativeHandle(controller, () => ({
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
    setTime: (time: number) => {
      timeLeft.current = time;
      updateStopwatch();
    },
    getTimeLeft: () => timeLeft.current,
    getState: () => (isStopped ? 'paused' : 'running'),
  }));

  return (
    <div className={clsx('stopwatch-wrapper', { 'stopwatch-wrapper-compact': controlsCompact })}>
      <Typography className={classNames('stopwatch', timerClasses('stopwatch'))} ref={stopwatchElement} />
      {showTotalTime && (
        <>
          <Typography
            className={classNames('total-time', timerClasses('total'))}
            ref={totalTimeElement}
            sx={(theme) => ({ color: theme.palette.primary.main })}
          />
          <div className='swap-timers'>
            <IconButton size='small' className='swap-timers-button' onClick={swapTimers}>
              <SwapVertIcon fontSize='medium' />
            </IconButton>
          </div>
        </>
      )}
      {showControls && (
        <div className={clsx('stopwatch-controls')}>
          {isStopped ? (
            <IconButton onClick={startTimer} title={t('stopwatch.continue')} size='large'>
              <PlayArrowIcon fontSize='large' />
            </IconButton>
          ) : (
            <IconButton onClick={stopTimer} title={t('stopwatch.pause')} size='large'>
              <PauseIcon fontSize='large' />
            </IconButton>
          )}
          <IconButton onClick={resetTimer} title={t('stopwatch.reset')} size='large'>
            <ReplayIcon fontSize='large' />
          </IconButton>
          <IconButton onClick={addTime} title={t('stopwatch.addTime')} size='large'>
            <ExpandLessIcon fontSize='large' />
          </IconButton>
          <IconButton onClick={subtractTime} title={t('stopwatch.reduceTime')} size='large'>
            <ExpandMoreIcon fontSize='large' />
          </IconButton>
          <IconButton onClick={addDoubleTime} title={t('stopwatch.addTimex2')} size='large'>
            <KeyboardCapslockIcon fontSize='large' />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;
