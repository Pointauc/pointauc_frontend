import { ReactText, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

import { RootState } from '@reducers';
import { Slot } from '@models/slot.model.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import twitch from '@components/Integration/Twitch';
import donatePay from '@components/Integration/DonatePay';
import './Stopwatch.scss';

export const STOPWATCH = {
  FORMAT: 'mm:ss:SSS',
  HOUR_FORMAT: 'mm:ss',
  TOTAL_FORMAT: 'HH:mm:ss',
};
const HOUR = 60 * 60 * 1000;

type TimerType = 'stopwatch' | 'total';

const Stopwatch: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { daSocket } = useSelector((root: RootState) => root.socketIo);
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

  const updateStopwatch = useCallback((timeDifference = 0): void => {
    if (stopwatchElement.current) {
      timeLeft.current += timeDifference;
      if (timeLeft.current < 0) {
        timeLeft.current = 0;
        setIsStopped(true);
        setIsStopwatchChanged(true);
      }
      const date = dayjs(timeLeft.current);
      const hours = Math.floor(timeLeft.current / HOUR);
      const formatted = hours ? date.format(STOPWATCH.HOUR_FORMAT) : date.format(STOPWATCH.FORMAT).slice(0, -1);
      stopwatchElement.current.innerHTML = hours ? `${hours > 9 ? hours : `0${hours}`}:${formatted}` : formatted;
    }
  }, []);

  const updateTotalTime = useCallback((timeDifference = 0) => {
    totalTime.current += timeDifference;
    if (totalTime.current < 0) {
      totalTime.current = 0;
    }

    if (totalTimeElement.current) {
      const date = dayjs.duration(totalTime.current);
      totalTimeElement.current.innerHTML = date.format(STOPWATCH.TOTAL_FORMAT);
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

      if (isMaxTimeActive) {
        if (timeLeft.current < maxMilliseconds) {
          updateStopwatch(
            timeLeft.current + timeChange > maxMilliseconds ? maxMilliseconds - timeLeft.current : timeChange,
          );
        }

        return;
      }

      updateStopwatch(timeChange);
    },
    [isMaxTimeActive, isMinTimeActive, maxTime, minTime, updateStopwatch],
  );

  const handleDonation = useCallback(() => {
    console.log('on donation');
    const { isIncrementActive, incrementTime } = daSettings.current;

    if (isIncrementActive) {
      autoUpdateTimer(incrementTime * 1000);
    }
  }, [autoUpdateTimer]);

  useEffect(() => {
    daSocket?.on('Bid', handleDonation);
    const unsub = donatePay.pubsubFlow.events.on('bid', handleDonation);

    return () => {
      daSocket?.off('Bid', handleDonation);
      unsub();
    };
  }, [daSocket, handleDonation]);

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
  };

  const resetTimer = useCallback((): void => {
    if (focusedTimer === 'stopwatch') {
      stopTimer();
      timeLeft.current = defaultTime;
      updateStopwatch();
    } else {
      totalTime.current = 0;
      updateTotalTime();
    }
  }, [defaultTime, focusedTimer, updateStopwatch, updateTotalTime]);

  const startTimer = (): void => {
    if (timeLeft.current) {
      setIsStopped(false);
      setIsStopwatchChanged(true);
      prevTimestamp.current = undefined;
      frameId.current = requestAnimationFrame(updateTimeOnFrame);
    }
  };

  const addTime = (): void => updateFocusedTimer(stopwatchStep);
  const addDoubleTime = (): void => updateFocusedTimer(stopwatchStep * 2);
  const subtractTime = (): void => updateFocusedTimer(-stopwatchStep);

  useEffect(() => {
    if (isAutoincrementActive && winnerSlot.amount && previousWinnerSlotId.current !== winnerSlot.id) {
      autoUpdateTimer(Number(stopwatchAutoincrement));
    }
    previousWinnerSlotId.current = winnerSlot.id;
  }, [autoUpdateTimer, isAutoincrementActive, stopwatchAutoincrement, updateStopwatch, winnerSlot]);

  const swapTimers = () => setFocusedTimer((type) => (type === 'stopwatch' ? 'total' : 'stopwatch'));
  const timerClasses = (type: TimerType) => ({ [focusedTimer === type ? 'timer-primary' : 'timer-secondary']: true });

  return (
    <div className='stopwatch-wrapper'>
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
      <div className='stopwatch-controls'>
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
    </div>
  );
};

export default Stopwatch;
