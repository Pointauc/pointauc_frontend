import React, { ReactText, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Stopwatch.scss';
import { IconButton } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReplayIcon from '@material-ui/icons/Replay';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import KeyboardCapslockIcon from '@material-ui/icons/KeyboardCapslock';
import PauseIcon from '@material-ui/icons/Pause';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { RootState } from '../../../reducers';
import { Slot } from '../../../models/slot.model';
import { MESSAGE_TYPES } from '../../../constants/webSocket.constants';
import { sendCpSubscribedState } from '../../../reducers/Subscription/Subscription';

export const STOPWATCH = {
  FORMAT: 'mm:ss:SSS',
};

const Stopwatch: React.FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
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
      isNewSlotIncrement,
      newSlotIncrement,
    },
    integration: {
      twitch: { dynamicRewards },
      da,
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
  const daSettings = useRef(da);

  useEffect(() => {
    daSettings.current = da;
  }, [da]);

  useEffect(() => {
    if (!dynamicRewards || loadingTwitchSub || !isStopwatchChanged || isStopped !== actualTwitchSub) {
      return;
    }

    setIsStopwatchChanged(false);
    dispatch(sendCpSubscribedState(!isStopped));
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
        // const { name } = winnerRef.current || {};
        // dispatch(setNotification(`${name || DEFAULT_SLOT_NAME} победил!`));
      }
      stopwatchElement.current.innerHTML = dayjs(time.current).format(STOPWATCH.FORMAT).slice(0, -1);
    }
  }, []);

  const autoUpdateTimer = useCallback(
    (timeChange: number) => {
      const maxMilliseconds = maxTime * 60 * 1000;
      if (isMaxTimeActive) {
        if (time.current < maxMilliseconds) {
          updateStopwatch(time.current + timeChange > maxMilliseconds ? maxMilliseconds - time.current : timeChange);
        }
      } else {
        updateStopwatch(timeChange);
      }
    },
    [isMaxTimeActive, maxTime, updateStopwatch],
  );

  const handleDonation = useCallback(
    ({ data }: MessageEvent) => {
      const { type, purchase } = JSON.parse(data);
      const { isIncrementActive, incrementTime } = daSettings.current;

      if (isIncrementActive && type === MESSAGE_TYPES.PURCHASE && purchase.isDonation) {
        autoUpdateTimer(incrementTime * 1000);
      }
    },
    [autoUpdateTimer],
  );

  useEffect(() => {
    webSocket?.addEventListener('message', handleDonation);
  }, [handleDonation, webSocket]);

  useEffect(() => updateStopwatch(), [updateStopwatch]);

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
    }
    prevTimestamp.current = timestamp;
    frameId.current = time.current ? requestAnimationFrame(updateTimeOnFrame) : undefined;
  };
  const handleStop = (): void => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
      frameId.current = undefined;
    }
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
    <div className="stopwatch-wrapper">
      <div className="stopwatch" ref={stopwatchElement} />
      <div className="stopwatch-controls">
        {isStopped ? (
          <IconButton onClick={handleStart} title="Продолжить">
            <PlayArrowIcon fontSize="large" />
          </IconButton>
        ) : (
          <IconButton onClick={handleStop} title="Пауза">
            <PauseIcon fontSize="large" />
          </IconButton>
        )}
        <IconButton onClick={handleReset} title="Обнулить">
          <ReplayIcon fontSize="large" />
        </IconButton>
        <IconButton onClick={handleAdd} title="Добавить время">
          <ExpandLessIcon fontSize="large" />
        </IconButton>
        <IconButton onClick={handleSubtract} title="Уменьшить время">
          <ExpandMoreIcon fontSize="large" />
        </IconButton>
        <IconButton onClick={handleAddDouble} title="Добавить время Х2">
          <KeyboardCapslockIcon fontSize="large" />
        </IconButton>
      </div>
    </div>
  );
};

export default Stopwatch;
