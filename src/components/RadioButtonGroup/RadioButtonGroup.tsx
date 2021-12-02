import React, { Key, useCallback } from 'react';
import { Button, ButtonGroup, ButtonGroupProps } from '@material-ui/core';

export interface Option<KeyType = Key> {
  key: KeyType;
  value: string;
}

interface RadioButtonGroupProps<T = Key> extends ButtonGroupProps {
  options: Option<T>[];
  activeKey: Key;
  onChangeActive: (key: T) => void;
}

const RadioButtonGroup = <T extends Key = Key>({
  onChangeActive,
  options,
  activeKey,
  ...props
}: RadioButtonGroupProps<T>): JSX.Element => {
  const createButton = useCallback(
    ({ key, value }: Option<T>) => {
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
