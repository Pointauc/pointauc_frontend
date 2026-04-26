import { InputBase, Text, Tooltip } from '@mantine/core';
import clsx from 'clsx';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { IMaskInput } from 'react-imask';

import classes from './Stopwatch.module.css';
import { TimerPriority, TimerType } from './stopwatch.constants';
import { TimerController } from './useTimerController';

interface EditableTimerProps {
  controller: TimerController;
  stopwatchController: TimerController;
  priority: TimerPriority;
  showControls: boolean;
  tooltipLabel: string;
  checkIsStopwatchStopped: boolean;
  onMainTimerChange: (timerType: TimerType) => void;
  onPauseStopwatch: () => void;
  onResumeStopwatch: () => void;
  onTimeChanged?: (timeLeft: number) => void;
  onTimeEdited?: (timerType: TimerType) => void;
}

const TIMER_MASK = '00:00:00';
const MaskedInputBase = InputBase as any;

const EditableTimer: FC<EditableTimerProps> = ({
  controller,
  stopwatchController,
  priority,
  showControls,
  tooltipLabel,
  checkIsStopwatchStopped,
  onMainTimerChange,
  onPauseStopwatch,
  onResumeStopwatch,
  onTimeChanged,
  onTimeEdited,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const checkShouldResumeAfterEditing = useRef(false);
  const [editingValue, setEditingValue] = useState('');
  const [checkIsEditing, setCheckIsEditing] = useState(false);

  const checkIsPrimary = priority === TimerPriority.Primary;
  const checkCanEdit = showControls && checkIsPrimary;
  const displayClassName = clsx(checkIsPrimary ? classes.timerPrimary : classes.timerSecondary, {
    [classes.timerEditable]: checkCanEdit,
    [classes.timerEditing]: checkIsEditing,
  });
  const inputClassName = clsx(classes.timerInput, {
    [classes.timerPrimaryInput]: checkIsPrimary,
    [classes.timerSecondaryInput]: !checkIsPrimary,
  });

  useEffect(() => {
    if (checkIsEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [checkIsEditing]);

  const finishEditing = (checkCommit: boolean): void => {
    if (!checkIsEditing) {
      return;
    }

    if (checkCommit) {
      const nextTime = controller.parseInput(editingValue);

      if (nextTime != null) {
        const appliedTime = controller.setTime(nextTime);
        onTimeChanged?.(appliedTime);
        onTimeEdited?.(controller.timerType);
      }
    }

    const checkShouldResume = checkShouldResumeAfterEditing.current;
    checkShouldResumeAfterEditing.current = false;
    setCheckIsEditing(false);
    controller.setEditing(false);

    if (checkShouldResume && stopwatchController.getTime() > 0) {
      onResumeStopwatch();
    }
  };

  const startEditing = (): void => {
    if (!checkCanEdit) {
      return;
    }

    checkShouldResumeAfterEditing.current = !checkIsStopwatchStopped;
    if (!checkIsStopwatchStopped) {
      onPauseStopwatch();
    }

    onMainTimerChange(controller.timerType);
    controller.setEditing(true);
    setEditingValue(controller.formatTime());
    setCheckIsEditing(true);
  };

  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      startEditing();
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      finishEditing(true);
      return;
    }

    if (event.key === 'Escape') {
      finishEditing(false);
    }
  };

  if (checkIsEditing) {
    return (
      <MaskedInputBase
        inputRef={inputRef}
        component={IMaskInput}
        mask={TIMER_MASK}
        value={editingValue}
        onAccept={(value: string) => setEditingValue(value)}
        onBlur={() => finishEditing(true)}
        onKeyDown={handleInputKeyDown}
        variant='unstyled'
        className={displayClassName}
        classNames={{ input: inputClassName }}
      />
    );
  }

  return (
    <Tooltip
      disabled={!checkCanEdit}
      label={tooltipLabel}
      events={{ hover: true, focus: true, touch: false }}
      withArrow
    >
      <Text
        className={displayClassName}
        ref={controller.textRef}
        c={controller.timerType === 'total' ? 'primary' : undefined}
        onClick={startEditing}
        onKeyDown={handleDisplayKeyDown}
        tabIndex={showControls ? 0 : -1}
      />
    </Tooltip>
  );
};

export default EditableTimer;
