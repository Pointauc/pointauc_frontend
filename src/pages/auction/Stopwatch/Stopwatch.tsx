import { ReactText, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, Typography } from '@mui/material';
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

import { RootState } from '@reducers';
import { Slot } from '@models/slot.model.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import twitch from '@components/Integration/Twitch';
import './Stopwatch.scss';
import { timedFunction } from '@utils/dataType/function.utils.ts';

export const STOPWATCH = {
  FORMAT: 'mm:ss:SSS',
  HOUR_FORMAT: 'mm:ss',
};
const HOUR = 60 * 60 * 1000;

const Stopwatch: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { daSocket } = useSelector((root: RootState) => root.socketIo);
  const {
    twitch: { actual: actualTwitchSub, loading: loadingTwitchSub },
  } = useSelector((root: RootState) => root.subscription);
  const {
    settings: {
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
      ...restSettings
    },
  } = useSelector((root: RootState) => root.aucSettings);
  const defaultTime = Number(startTime) * 60 * 1000;
  const stopwatchStep = Number(timeStep) * 1000;
  const stopwatchAutoincrement = Number(autoincrementTime) * 1000;

  const [isStopped, setIsStopped] = useState<boolean>(true);
  const [isStopwatchChanged, setIsStopwatchChanged] = useState<boolean>(false);
  const previousSlotsLength = useRef(1);
  const time = useRef<number>(defaultTime);
  const frameId = useRef<number>();
  const prevTimestamp = useRef<number>();
  const stopwatchElement = useRef<HTMLDivElement>(null);
  const winnerRef = useRef<Slot>();
  const daSettings = useRef(restSettings);

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
      time.current += timeDifference;
      if (time.current < 0) {
        time.current = 0;
        setIsStopped(true);
        setIsStopwatchChanged(true);
      }
      const date = dayjs(time.current);
      const hours = Math.floor(time.current / HOUR);
      const formatted = hours ? date.format(STOPWATCH.HOUR_FORMAT) : date.format(STOPWATCH.FORMAT).slice(0, -2) + '0';
      stopwatchElement.current.innerHTML = hours ? `${hours > 9 ? hours : `0${hours}`}:${formatted}` : formatted;
    }
  }, []);

  const autoUpdateTimer = useCallback(
    (timeChange: number) => {
      const maxMilliseconds = maxTime * 60 * 1000;

      if (isMinTimeActive && time.current > minTime * 60 * 1000) return;

      if (isMaxTimeActive) {
        if (time.current < maxMilliseconds) {
          updateStopwatch(time.current + timeChange > maxMilliseconds ? maxMilliseconds - time.current : timeChange);
        }

        return;
      }

      updateStopwatch(timeChange);
    },
    [isMaxTimeActive, isMinTimeActive, maxTime, minTime, updateStopwatch],
  );

  const handleDonation = useCallback(() => {
    const { isIncrementActive, incrementTime } = daSettings.current;

    if (isIncrementActive) {
      autoUpdateTimer(incrementTime * 1000);
    }
  }, [autoUpdateTimer]);

  useEffect(() => {
    daSocket?.on('Bid', handleDonation);
  }, [daSocket, handleDonation]);

  useEffect(() => updateStopwatch(), [updateStopwatch]);

  useEffect(() => {
    if (slots.length > previousSlotsLength.current && isNewSlotIncrement) {
      autoUpdateTimer(Number(newSlotIncrement) * 1000);
    }

    previousSlotsLength.current = slots.length;
  }, [autoUpdateTimer, isNewSlotIncrement, newSlotIncrement, slots.length]);

  const { cancel: cancelUpdate, callback: throttledUpdate } = useMemo(() => {
    let time = 0;
    const { callable, cancel } = timedFunction((diff: number) => {
      time = 0;
      updateStopwatch(diff);
    }, 55);

    const callback = (diff: number) => {
      time += diff;
      callable(time);
    };

    return { cancel, callback };
  }, [updateStopwatch]);

  const updateTimeOnFrame = (timestamp: number): void => {
    if (prevTimestamp.current) {
      const timeDifference = prevTimestamp.current - timestamp;
      throttledUpdate(timeDifference);
    }
    prevTimestamp.current = timestamp;
    frameId.current = time.current ? requestAnimationFrame(updateTimeOnFrame) : undefined;
  };
  const handleStop = (): void => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
      frameId.current = undefined;
    }
    cancelUpdate();
    setIsStopped(true);
    setIsStopwatchChanged(true);
  };

  const handleReset = useCallback((): void => {
    handleStop();
    time.current = defaultTime;
    updateStopwatch();
  }, [defaultTime, updateStopwatch]);

  const handleStart = (): void => {
    if (time.current) {
      setIsStopped(false);
      setIsStopwatchChanged(true);
      prevTimestamp.current = undefined;
      frameId.current = requestAnimationFrame(updateTimeOnFrame);
      setInterval(() => {
        if (stopwatchElement.current) {
          if (time.current < 0) {
            time.current = 0;
            setIsStopped(true);
            setIsStopwatchChanged(true);
          }
          const date = dayjs(time.current);
          const hours = Math.floor(time.current / HOUR);
          const formatted = hours ? date.format(STOPWATCH.HOUR_FORMAT) : date.format(STOPWATCH.FORMAT).slice(0, -1);
          const x = hours ? `${hours > 9 ? hours : `0${hours}`}:${formatted}` : formatted;
          console.log('10 sec passed', x);
        }
      }, 10000);
    }
  };

  const handleAdd = (): void => {
    updateStopwatch(stopwatchStep);
  };
  const handleAddDouble = (): void => {
    updateStopwatch(stopwatchStep * 2);
  };
  const handleSubtract = (): void => {
    updateStopwatch(-stopwatchStep);
  };

  useEffect(() => {
    if (isAutoincrementActive && winnerSlot.amount && previousWinnerSlotId.current !== winnerSlot.id) {
      autoUpdateTimer(Number(stopwatchAutoincrement));
    }
    previousWinnerSlotId.current = winnerSlot.id;
  }, [autoUpdateTimer, isAutoincrementActive, stopwatchAutoincrement, updateStopwatch, winnerSlot]);

  return (
    <div className='stopwatch-wrapper'>
      <Typography className='stopwatch' ref={stopwatchElement} />
      <div className='stopwatch-controls'>
        {isStopped ? (
          <IconButton onClick={handleStart} title={t('stopwatch.continue')} size='large'>
            <PlayArrowIcon fontSize='large' />
          </IconButton>
        ) : (
          <IconButton onClick={handleStop} title={t('stopwatch.pause')} size='large'>
            <PauseIcon fontSize='large' />
          </IconButton>
        )}
        <IconButton onClick={handleReset} title={t('stopwatch.reset')} size='large'>
          <ReplayIcon fontSize='large' />
        </IconButton>
        <IconButton onClick={handleAdd} title={t('stopwatch.addTime')} size='large'>
          <ExpandLessIcon fontSize='large' />
        </IconButton>
        <IconButton onClick={handleSubtract} title={t('stopwatch.reduceTime')} size='large'>
          <ExpandMoreIcon fontSize='large' />
        </IconButton>
        <IconButton onClick={handleAddDouble} title={t('stopwatch.addTimex2')} size='large'>
          <KeyboardCapslockIcon fontSize='large' />
        </IconButton>
      </div>
    </div>
  );
};

export default Stopwatch;
