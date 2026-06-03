import { InputBase, Text, Tooltip } from '@mantine/core';
import clsx from 'clsx';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { IMaskInput } from 'react-imask';
import { useTranslation } from 'react-i18next';

import classes from './Timer.module.css';
import { TimerPriority, TimerType } from './timer.constants';
import { TimerController } from './useTimerController';

interface EditableTimerProps {
  controller: TimerController;
  timerController: TimerController;
  priority: TimerPriority;
  showControls: boolean;
  tooltipLabel: string;
  checkIsTimerStopped: boolean;
  onMainTimerChange: (timerType: TimerType) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onTimeChanged?: (timeLeft: number) => void;
  onTimeEdited?: (timerType: TimerType) => void;
  showManualEditHint?: boolean;
  hideManualEditHint?: () => void;
}

const TIMER_MASK = '00:00:00';
const MaskedInputBase = InputBase as any;

const EditableTimer: FC<EditableTimerProps> = ({
  controller,
  timerController,
  priority,
  showControls,
  tooltipLabel,
  checkIsTimerStopped,
  onMainTimerChange,
  onPauseTimer,
  onResumeTimer,
  onTimeChanged,
  onTimeEdited,
  showManualEditHint,
  hideManualEditHint,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const checkShouldResumeAfterEditing = useRef(false);
  const [editingValue, setEditingValue] = useState('');
  const [checkIsEditing, setCheckIsEditing] = useState(false);
  const { t } = useTranslation();

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

  useEffect(() => {
    if (showManualEditHint) {
      const timeoutId = window.setTimeout(() => {
        hideManualEditHint?.();
      }, 7000);

      return () => window.clearTimeout(timeoutId);
    }
  }, [showManualEditHint, hideManualEditHint]);

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

    if (checkShouldResume && timerController.getTime() > 0) {
      onResumeTimer();
    }
  };

  const startEditing = (): void => {
    if (!checkCanEdit) {
      return;
    }
    hideManualEditHint?.();

    checkShouldResumeAfterEditing.current = !checkIsTimerStopped;
    if (!checkIsTimerStopped) {
      onPauseTimer();
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
      <Tooltip label={t('stopwatch.keyboardEditHint')} withArrow opened={showManualEditHint} position='left'>
        <Text
          className={displayClassName}
          ref={controller.textRef}
          c={controller.timerType === 'total' ? 'primary' : undefined}
          onClick={startEditing}
          onKeyDown={handleDisplayKeyDown}
          tabIndex={showControls ? 0 : -1}
        />
      </Tooltip>
    </Tooltip>
  );
};

export default EditableTimer;
