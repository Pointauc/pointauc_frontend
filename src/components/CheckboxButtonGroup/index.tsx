import React, { Key, useCallback } from 'react';
import { Button, ButtonGroup, ButtonGroupProps } from '@mui/material';

import { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';

interface CheckboxButtonGroupProps<T = Key> extends ButtonGroupProps {
  options: Option<T>[];
  activeKeys: T[];
  onChangeActive: (key: T[]) => void;
}

const CheckboxButtonGroup = <T extends Key = Key>({
  onChangeActive,
  options,
  activeKeys,
  ...props
}: CheckboxButtonGroupProps<T>): JSX.Element => {
  const createButton = useCallback(
    ({ key, label }: Option<T>) => {
      const handleClick = (): void => {
        const index = activeKeys.indexOf(key);

        if (index >= 0) {
          onChangeActive(activeKeys.filter((active) => active !== key));
        } else {
          onChangeActive([...activeKeys, key]);
        }
      };

      return (
        <Button key={key} variant={activeKeys.includes(key) ? 'contained' : 'outlined'} onClick={handleClick}>
          {label}
        </Button>
      );
    },
    [activeKeys, onChangeActive],
  );

  return (
    <ButtonGroup color='primary' {...props}>
      {options.map(createButton)}
    </ButtonGroup>
  );
};

export default CheckboxButtonGroup;
