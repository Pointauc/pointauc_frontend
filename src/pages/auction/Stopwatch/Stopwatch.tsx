import { ActionIcon, Group } from '@mantine/core';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { IconArrowsSort } from '@tabler/icons-react';
import { throttle } from '@tanstack/react-pacer';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { RefObject, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { globalBidsEventBus } from '@domains/bids/lib/globalBidsEventBus.ts';
import { Slot } from '@models/slot.model.ts';
import { RootState } from '@reducers';
import { Purchase } from '@reducers/Purchases/Purchases';
import { useHeadroom } from '@shared/lib/scroll';

import EditableTimer from './EditableTimer';
import classes from './Stopwatch.module.css';
import { HOUR, STOPWATCH, TimerType } from './stopwatch.constants';
import useTimerEditing from './useTimerEditing';

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
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const {
    startTime,
    isAutoincrementActive,
    autoincrementTime,
    maxTime = 15,
    minTime,
    isMinTimeActive,
    isNewSlotIncrement,
    newSlotIncrement,
    showTotalTime,
    isIncrementActive,
    incrementTime,
  } = settings;
  const defaultTime = Number(startTime) * 60 * 1000;
  const stopwatchStep = 60 * 1000;
  const stopwatchAutoincrement = Number(autoincrementTime) * 1000;
  const controlsCompact = useHeadroom({ fixedAt: 60 });

  const [isStopped, setIsStopped] = useState<boolean>(true);
  const previousSlotsLength = useRef(1);
  const timeLeft = useRef<number>(defaultTime);
  const totalTime = useRef<number>(0);
  const frameId = useRef<number | undefined>(undefined);
  const prevTimestamp = useRef<number | undefined>(undefined);
  const stopwatchElement = useRef<HTMLDivElement>(null);
  const totalTimeElement = useRef<HTMLDivElement>(null);
  const winnerRef = useRef<Slot | undefined>(undefined);
  const [focusedTimer, setFocusedTimer] = useState<TimerType>('stopwatch');
  const editingTimerRef = useRef<TimerType | null>(null);

  const formatStopwatchTime = useCallback((currentTime: number): string => {
    const date = dayjs(currentTime);
    const hours = Math.floor(currentTime / HOUR);
    const formatted = hours ? date.format(STOPWATCH.HOUR_FORMAT) : date.format(STOPWATCH.FORMAT).slice(0, -1);

    return hours ? `${hours > 9 ? hours : `0${hours}`}:${formatted}` : formatted;
  }, []);

  const formatTotalTime = useCallback((currentTime: number): string => {
    const date = dayjs.duration(currentTime);

    return date.format(STOPWATCH.TOTAL_FORMAT);
  }, []);

  const winnerSlot = useMemo(() => {
    [winnerRef.current] = slots;

    return slots[0];
  }, [slots]);
  const previousWinnerSlotId = useRef<string | undefined>(winnerSlot.id);

  const updateTimerUIDebounced = useMemo(
    () =>
      throttle(
        (currentTimeLeft: number): void => {
          if (stopwatchElement.current && editingTimerRef.current !== 'stopwatch') {
            stopwatchElement.current.textContent = formatStopwatchTime(currentTimeLeft);
          }
        },
        { wait: 68, leading: true, trailing: true },
      ),
    [formatStopwatchTime],
  );

  const updateStopwatch = useCallback(
    (timeDifference = 0): void => {
      timeLeft.current += timeDifference;
      if (timeLeft.current < 0) {
        timeLeft.current = 0;
        setIsStopped(true);
        onEnd?.();
      }
      updateTimerUIDebounced(timeLeft.current);
    },
    [onEnd, updateTimerUIDebounced],
  );

  const updateTotalTime = useCallback(
    (timeDifference = 0): void => {
      totalTime.current += timeDifference;
      if (totalTime.current < 0) {
        totalTime.current = 0;
      }

      if (totalTimeElement.current && editingTimerRef.current !== 'total') {
        totalTimeElement.current.textContent = formatTotalTime(totalTime.current);
      }
    },
    [formatTotalTime],
  );

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
      if (isMinTimeActive && timeLeft.current > minTime * 60 * 1000) {
        return;
      }

      updateStopwatch(timeChange);
    },
    [isMinTimeActive, minTime, updateStopwatch],
  );

  useEffect(() => {
    const handleBid = (bid: Purchase) => {
      if (isIncrementActive && bid.isDonation) {
        autoUpdateTimer(incrementTime * 1000);
      }
    };

    globalBidsEventBus.on('bid', handleBid);

    return () => {
      globalBidsEventBus.off('bid', handleBid);
    };
  }, [autoUpdateTimer, incrementTime, isIncrementActive]);

  useEffect(() => {
    updateStopwatch();
  }, [updateStopwatch]);

  useEffect(() => {
    if (slots.length > previousSlotsLength.current && isNewSlotIncrement) {
      autoUpdateTimer(Number(newSlotIncrement) * 1000);
    }

    previousSlotsLength.current = slots.length;
  }, [autoUpdateTimer, isNewSlotIncrement, newSlotIncrement, slots.length]);

  const updateTimeOnFrame = useCallback(
    (timestamp: number): void => {
      if (prevTimestamp.current) {
        const timeDifference = prevTimestamp.current - timestamp;
        updateStopwatch(timeDifference);
        updateTotalTime(-timeDifference);
      }

      prevTimestamp.current = timestamp;
      frameId.current = timeLeft.current ? requestAnimationFrame(updateTimeOnFrame) : undefined;
    },
    [updateStopwatch, updateTotalTime],
  );

  const stopTimer = useCallback((): void => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
      frameId.current = undefined;
    }

    setIsStopped(true);
    onPause?.(timeLeft.current);
  }, [onPause]);

  const startTimer = useCallback((): void => {
    if (timeLeft.current) {
      setIsStopped(false);
      prevTimestamp.current = undefined;
      frameId.current = requestAnimationFrame(updateTimeOnFrame);
      onStart?.(timeLeft.current);
    }
  }, [onStart, updateTimeOnFrame]);

  const { editingState, startEditing, updateEditingValue, commitEditing, cancelEditing } = useTimerEditing({
    showControls,
    checkIsStopped: isStopped,
    getStopwatchTime: () => timeLeft.current,
    getTotalTime: () => totalTime.current,
    formatStopwatchTime,
    formatTotalTime,
    stopTimer,
    startTimer,
    setFocusedTimer,
    applyStopwatchTime: (nextTime) => {
      timeLeft.current = nextTime;
      updateStopwatch();
      onTimeChanged?.(timeLeft.current, 'paused');
    },
    applyTotalTime: (nextTime) => {
      totalTime.current = nextTime;
      updateTotalTime();
    },
  });

  useEffect(() => {
    editingTimerRef.current = editingState?.type ?? null;
  }, [editingState]);

  const resetTimer = useCallback((): void => {
    if (focusedTimer === 'stopwatch') {
      stopTimer();
      timeLeft.current = defaultTime;
      updateStopwatch();
      onReset?.(timeLeft.current);
      return;
    }

    totalTime.current = 0;
    updateTotalTime();
  }, [defaultTime, focusedTimer, onReset, stopTimer, updateStopwatch, updateTotalTime]);

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
      autoUpdateTimer(stopwatchAutoincrement);
    }

    previousWinnerSlotId.current = winnerSlot.id;
  }, [autoUpdateTimer, isAutoincrementActive, stopwatchAutoincrement, winnerSlot]);

  const swapTimers = () => setFocusedTimer((type) => (type === 'stopwatch' ? 'total' : 'stopwatch'));
  const getTimerClass = (type: TimerType) => (focusedTimer === type ? classes.timerPrimary : classes.timerSecondary);

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

  const renderTimer = (timerType: TimerType) => {
    const checkIsEditing = editingState?.type === timerType;

    return (
      <EditableTimer
        timerType={timerType}
        checkIsEditing={checkIsEditing}
        displayClassName={clsx(getTimerClass(timerType), {
          [classes.timerEditable]: showControls,
          [classes.timerEditing]: checkIsEditing,
        })}
        inputClassName={clsx(classes.timerInput, {
          [classes.timerPrimaryInput]: timerType === 'stopwatch',
          [classes.timerSecondaryInput]: timerType === 'total',
        })}
        showControls={showControls}
        tooltipLabel={t('stopwatch.clickToEdit')}
        textRef={timerType === 'stopwatch' ? stopwatchElement : totalTimeElement}
        color={timerType === 'total' ? 'primary' : undefined}
        editingValue={checkIsEditing ? editingState?.value ?? '' : ''}
        onStartEditing={startEditing}
        onEditingValueChange={updateEditingValue}
        onCommitEditing={commitEditing}
        onCancelEditing={cancelEditing}
      />
    );
  };

  return (
    <div className={clsx(classes.wrapper, { [classes.wrapperCompact]: controlsCompact })}>
      {renderTimer('stopwatch')}
      {showTotalTime && (
        <>
          {renderTimer('total')}
          <div className={classes.swapTimers}>
            <ActionIcon
              size='xs'
              variant='subtle'
              c='gray.0'
              radius='xl'
              className={classes.swapTimersButton}
              onClick={swapTimers}
            >
              <IconArrowsSort size={18} />
            </ActionIcon>
          </div>
        </>
      )}
      {showControls && (
        <Group className={classes.controls} gap='xs'>
          {isStopped ? (
            <ActionIcon
              color='gray.0'
              onClick={startTimer}
              title={t('stopwatch.continue')}
              size='xl'
              variant='subtle'
              radius='xl'
              className={classes.actionIcon}
            >
              <PlayArrowIcon fontSize='large' />
            </ActionIcon>
          ) : (
            <ActionIcon
              color='gray.0'
              onClick={stopTimer}
              title={t('stopwatch.pause')}
              size='xl'
              variant='subtle'
              radius='xl'
              className={classes.actionIcon}
            >
              <PauseIcon fontSize='large' />
            </ActionIcon>
          )}
          <ActionIcon
            color='gray.0'
            onClick={resetTimer}
            title={t('stopwatch.reset')}
            size='xl'
            variant='subtle'
            radius='xl'
            className={classes.actionIcon}
          >
            <ReplayIcon fontSize='large' />
          </ActionIcon>
          <ActionIcon
            color='gray.0'
            onClick={addTime}
            title={t('stopwatch.addTime')}
            size='xl'
            variant='subtle'
            radius='xl'
            className={classes.actionIcon}
          >
            <ExpandLessIcon fontSize='large' />
          </ActionIcon>
          <ActionIcon
            color='gray.0'
            onClick={subtractTime}
            title={t('stopwatch.reduceTime')}
            size='xl'
            variant='subtle'
            radius='xl'
            className={classes.actionIcon}
          >
            <ExpandMoreIcon fontSize='large' />
          </ActionIcon>
          <ActionIcon
            color='gray.0'
            onClick={addDoubleTime}
            title={t('stopwatch.addTimex2')}
            size='xl'
            variant='subtle'
            radius='xl'
            className={classes.actionIcon}
          >
            <KeyboardCapslockIcon fontSize='large' />
          </ActionIcon>
        </Group>
      )}
    </div>
  );
};

export default Stopwatch;
