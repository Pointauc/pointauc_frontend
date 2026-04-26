import { ActionIcon } from '@mantine/core';
import { IconArrowsSort } from '@tabler/icons-react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import EditableTimer from './EditableTimer';
import classes from './Stopwatch.module.css';
import { TimerPriority, TimerType } from './stopwatch.constants';
import { TimerController } from './useTimerController';

interface SwappableTimerProps {
  mainTimer: TimerType;
  showControls: boolean;
  showTotalTime: boolean;
  checkIsStopwatchStopped: boolean;
  stopwatchController: TimerController;
  totalTimeController: TimerController;
  onMainTimerChange: (timerType: TimerType) => void;
  onPauseStopwatch: () => void;
  onResumeStopwatch: () => void;
  onStopwatchTimeChanged: (timeLeft: number) => void;
  onTimeEdited?: (timerType: TimerType) => void;
  onSwapTimers: () => void;
}

const SwappableTimer: FC<SwappableTimerProps> = ({
  mainTimer,
  showControls,
  showTotalTime,
  checkIsStopwatchStopped,
  stopwatchController,
  totalTimeController,
  onMainTimerChange,
  onPauseStopwatch,
  onResumeStopwatch,
  onStopwatchTimeChanged,
  onTimeEdited,
  onSwapTimers,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <EditableTimer
        controller={stopwatchController}
        stopwatchController={stopwatchController}
        priority={mainTimer === 'stopwatch' ? TimerPriority.Primary : TimerPriority.Secondary}
        showControls={showControls}
        tooltipLabel={t('stopwatch.clickToEdit')}
        checkIsStopwatchStopped={checkIsStopwatchStopped}
        onMainTimerChange={onMainTimerChange}
        onPauseStopwatch={onPauseStopwatch}
        onResumeStopwatch={onResumeStopwatch}
        onTimeChanged={onStopwatchTimeChanged}
        onTimeEdited={onTimeEdited}
      />
      {showTotalTime && (
        <>
          <EditableTimer
            controller={totalTimeController}
            stopwatchController={stopwatchController}
            priority={mainTimer === 'total' ? TimerPriority.Primary : TimerPriority.Secondary}
            showControls={showControls}
            tooltipLabel={t('stopwatch.clickToEdit')}
            checkIsStopwatchStopped={checkIsStopwatchStopped}
            onMainTimerChange={onMainTimerChange}
            onPauseStopwatch={onPauseStopwatch}
            onResumeStopwatch={onResumeStopwatch}
            onTimeEdited={onTimeEdited}
          />
          <div className={classes.swapTimers}>
            <ActionIcon
              size='xs'
              variant='subtle'
              c='gray.0'
              radius='xl'
              className={classes.swapTimersButton}
              onClick={onSwapTimers}
            >
              <IconArrowsSort size={18} />
            </ActionIcon>
          </div>
        </>
      )}
    </>
  );
};

export default SwappableTimer;
