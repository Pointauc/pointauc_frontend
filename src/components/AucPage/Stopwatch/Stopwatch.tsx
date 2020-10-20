import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Stopwatch.scss';
import { IconButton } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ReplayIcon from '@material-ui/icons/Replay';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import KeyboardCapslockIcon from '@material-ui/icons/KeyboardCapslock';
import PauseIcon from '@material-ui/icons/Pause';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../reducers';
import { getWinnerSlot } from '../../../utils/slots.utils';
import { setNotification } from '../../../reducers/notifications/notifications';
import { DEFAULT_SLOT_NAME } from '../../../constants/slots.constants';

export const STOPWATCH = {
  FORMAT: 'mm:ss:SS',
};

const Stopwatch: React.FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((root: RootState) => root.slots);
  const {
    settings: { startTime, timeStep },
  } = useSelector((root: RootState) => root.aucSettings);
  const defaultTime = Number(startTime) * 60 * 1000;
  const stopwatchStep = Number(timeStep) * 1000;

  const [isStopped, setIsStopped] = useState<boolean>(true);
  const time = useRef<number>(defaultTime);
  const frameId = useRef<number>();
  const prevTimestamp = useRef<number>();
  const stopwatchElement = useRef<HTMLDivElement>(null);

  const updateStopwatch = useCallback(
    (timeDifference = 0): void => {
      if (stopwatchElement.current) {
        time.current += timeDifference;
        if (time.current < 0) {
          time.current = 0;
          const { name } = getWinnerSlot(slots);
          dispatch(setNotification(`${name || DEFAULT_SLOT_NAME} победил!`));
        }
        stopwatchElement.current.innerHTML = moment(time.current).format(STOPWATCH.FORMAT);
      }
    },
    [dispatch, slots],
  );

  useEffect(() => updateStopwatch(), [updateStopwatch]);

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
  };

  const handleReset = useCallback((): void => {
    handleStop();
    time.current = defaultTime;
    updateStopwatch();
  }, [defaultTime, updateStopwatch]);

  const handleStart = (): void => {
    if (time.current) {
      setIsStopped(false);
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
