import { Text, TextInput, Tooltip } from '@mantine/core';
import { FC, KeyboardEvent, RefObject, useEffect, useRef } from 'react';

import { TimerType } from './stopwatch.constants';

interface EditableTimerProps {
  timerType: TimerType;
  checkIsEditing: boolean;
  displayClassName: string;
  inputClassName: string;
  showControls: boolean;
  tooltipLabel: string;
  textRef: RefObject<HTMLDivElement | null>;
  color?: string;
  editingValue: string;
  onStartEditing: (timerType: TimerType) => void;
  onEditingValueChange: (value: string) => void;
  onCommitEditing: () => void;
  onCancelEditing: () => void;
}

const EditableTimer: FC<EditableTimerProps> = ({
  timerType,
  checkIsEditing,
  displayClassName,
  inputClassName,
  showControls,
  tooltipLabel,
  textRef,
  color,
  editingValue,
  onStartEditing,
  onEditingValueChange,
  onCommitEditing,
  onCancelEditing,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (checkIsEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [checkIsEditing]);

  const handleDisplayKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onStartEditing(timerType);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      onCommitEditing();
      return;
    }

    if (event.key === 'Escape') {
      onCancelEditing();
    }
  };

  if (checkIsEditing) {
    return (
      <TextInput
        ref={inputRef}
        value={editingValue}
        onChange={(event) => onEditingValueChange(event.currentTarget.value)}
        onBlur={onCommitEditing}
        onKeyDown={handleInputKeyDown}
        variant='unstyled'
        className={displayClassName}
        classNames={{ input: inputClassName }}
      />
    );
  }

  const timerText = (
    <Text
      className={displayClassName}
      ref={textRef}
      c={color}
      onClick={() => onStartEditing(timerType)}
      onKeyDown={handleDisplayKeyDown}
      tabIndex={showControls ? 0 : -1}
    />
  );

  if (!showControls) {
    return timerText;
  }

  return (
    <Tooltip label={tooltipLabel} events={{ hover: true, focus: true, touch: false }} withArrow>
      {timerText}
    </Tooltip>
  );
};

export default EditableTimer;
