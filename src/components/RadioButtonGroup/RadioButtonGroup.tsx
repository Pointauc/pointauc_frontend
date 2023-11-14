import { Key, ReactNode, useCallback } from 'react';
import { Button, ButtonGroup, ButtonGroupProps } from '@mui/material';

export interface Option<KeyType = Key> {
  key: KeyType;
  label: ReactNode;
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
    ({ key, label }: Option<T>) => {
      const handleClick = (): void => onChangeActive(key);

      return (
        <Button key={key} variant={activeKey === key ? 'contained' : 'outlined'} onClick={handleClick}>
          {label}
        </Button>
      );
    },
    [activeKey, onChangeActive],
  );

  return (
    <ButtonGroup color='primary' {...props}>
      {options.map(createButton)}
    </ButtonGroup>
  );
};

export default RadioButtonGroup;
