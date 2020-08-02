import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Stopwatch.scss';
import { IconButton } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import KeyboardCapslockIcon from '@material-ui/icons/KeyboardCapslock';
import PauseIcon from '@material-ui/icons/Pause';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { setNotification } from '../../reducers/notifications/notifications';
import { getWinnerSlot } from '../../utils/slots.utils';
import { RootState } from '../../reducers';
import { DEFAULT_SLOT_NAME } from '../../constants/slots.constants';

export const STOPWATCH = {
  DEFAULT_TIME: 3 * 1000,
  FORMAT: 'mm:ss:SS',
  MINUTE: 60 * 1000,
  TWO_MINUTES: 120 * 1000,
};

const Stopwatch: React.FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((root: RootState) => root.slots);
  const [isStopped, setIsStopped] = useState<boolean>(true);
  const time = useRef<number>(STOPWATCH.DEFAULT_TIME);
  const frameId = useRef<number>();
  const prevTimestamp = useRef<number>();
  const stopwatchElement = useRef<HTMLDivElement>(null);

  const handleReset = useCallback((): void => {
    setIsStopped(true);
    time.current = 0;
    const { name } = getWinnerSlot(slots);
    dispatch(setNotification(`${name || DEFAULT_SLOT_NAME} победил!`));
  }, [dispatch, slots]);

  const updateStopwatch = useCallback(
    (timeDifference = 0): void => {
      if (stopwatchElement.current) {
        time.current += timeDifference;
        if (time.current < 0) {
          handleReset();
        }
        stopwatchElement.current.innerHTML = moment(time.current).format(STOPWATCH.FORMAT);
      }
    },
    [handleReset],
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

  const handleStart = (): void => {
    if (time.current) {
      setIsStopped(false);
      prevTimestamp.current = undefined;
      frameId.current = requestAnimationFrame(updateTimeOnFrame);
    }
  };

  const handleAdd = (): void => {
    updateStopwatch(STOPWATCH.MINUTE);
  };
  const handleAddDouble = (): void => {
    updateStopwatch(STOPWATCH.TWO_MINUTES);
  };
  const handleSubtract = (): void => {
    updateStopwatch(-STOPWATCH.MINUTE);
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
          <StopIcon fontSize="large" />
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
