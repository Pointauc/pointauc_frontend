import { ActionIcon } from '@mantine/core';
import { IconArrowsSort } from '@tabler/icons-react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import EditableTimer from './EditableTimer';
import classes from './Timer.module.css';
import { TimerPriority, TimerType } from './timer.constants';
import { TimerController } from './useTimerController';

interface SwappableTimerProps {
  mainTimer: TimerType;
  showControls: boolean;
  showTotalTime: boolean;
  checkIsTimerStopped: boolean;
  timerController: TimerController;
  totalTimeController: TimerController;
  onMainTimerChange: (timerType: TimerType) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onTimerTimeChanged: (timeLeft: number) => void;
  onTotalTimeChanged?: (totalTime: number) => void;
  onTimeEdited?: (timerType: TimerType) => void;
  onSwapTimers: () => void;
  showManualEditHint?: boolean;
  hideManualEditHint?: () => void;
}

const SwappableTimer: FC<SwappableTimerProps> = ({
  mainTimer,
  showControls,
  showTotalTime,
  checkIsTimerStopped,
  timerController,
  totalTimeController,
  onMainTimerChange,
  onPauseTimer,
  onResumeTimer,
  onTimerTimeChanged,
  onTotalTimeChanged,
  onTimeEdited,
  onSwapTimers,
  showManualEditHint = false,
  hideManualEditHint,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <EditableTimer
        controller={timerController}
        timerController={timerController}
        priority={mainTimer === 'timer' ? TimerPriority.Primary : TimerPriority.Secondary}
        showControls={showControls}
        tooltipLabel={t('stopwatch.clickToEdit')}
        checkIsTimerStopped={checkIsTimerStopped}
        onMainTimerChange={onMainTimerChange}
        onPauseTimer={onPauseTimer}
        onResumeTimer={onResumeTimer}
        onTimeChanged={onTimerTimeChanged}
        onTimeEdited={onTimeEdited}
        showManualEditHint={showManualEditHint && mainTimer === 'timer'}
        hideManualEditHint={hideManualEditHint}
      />
      {showTotalTime && (
        <>
          <EditableTimer
            controller={totalTimeController}
            timerController={timerController}
            priority={mainTimer === 'total' ? TimerPriority.Primary : TimerPriority.Secondary}
            showControls={showControls}
            tooltipLabel={t('stopwatch.clickToEdit')}
            checkIsTimerStopped={checkIsTimerStopped}
            onMainTimerChange={onMainTimerChange}
            onPauseTimer={onPauseTimer}
            onResumeTimer={onResumeTimer}
            onTimeChanged={onTotalTimeChanged}
            onTimeEdited={onTimeEdited}
            showManualEditHint={showManualEditHint && mainTimer === 'total'}
            hideManualEditHint={hideManualEditHint}
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
