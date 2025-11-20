import React, { Key, useCallback } from 'react';
import { Button } from '@mantine/core';

import { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';

interface CheckboxButtonGroupProps<T = Key> {
  options: Option<T>[];
  activeKeys: T[];
  onChangeActive: (key: T[]) => void;
}

const CheckboxButtonGroup = <T extends Key = Key>({
  onChangeActive,
  options,
  activeKeys,
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
        <Button
          key={key}
          color='primary.3'
          autoContrast
          size='sm'
          variant={activeKeys.includes(key) ? 'filled' : 'outline'}
          onClick={handleClick}
        >
          {label}
        </Button>
      );
    },
    [activeKeys, onChangeActive],
  );

  return <Button.Group>{options.map(createButton)}</Button.Group>;
};

export default CheckboxButtonGroup;
