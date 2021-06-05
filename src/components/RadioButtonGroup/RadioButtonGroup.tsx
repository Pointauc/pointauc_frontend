import React, { FC, Key, useCallback } from 'react';
import { Button, ButtonGroup, ButtonGroupProps } from '@material-ui/core';

export interface Option {
  key: Key;
  value: string;
}

interface RadioButtonGroupProps extends ButtonGroupProps {
  options: Option[];
  activeKey: Key;
  onChangeActive: (key: Key) => void;
}

const RadioButtonGroup: FC<RadioButtonGroupProps> = ({ onChangeActive, options, activeKey, ...props }) => {
  const createButton = useCallback(
    ({ key, value }: Option) => {
      const handleClick = (): void => onChangeActive(key);

      return (
        <Button key={key} variant={activeKey === key ? 'contained' : 'outlined'} onClick={handleClick}>
          {value}
        </Button>
      );
    },
    [activeKey, onChangeActive],
  );

  return (
    <ButtonGroup color="primary" {...props}>
      {options.map(createButton)}
    </ButtonGroup>
  );
};

export default RadioButtonGroup;
