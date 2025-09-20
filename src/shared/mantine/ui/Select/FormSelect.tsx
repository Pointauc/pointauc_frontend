import { Select, SelectProps } from '@mantine/core';
import clsx from 'clsx';
import { Control, Controller } from 'react-hook-form';

import classes from './FormSelect.module.css';

interface FormSelectProps extends SelectProps {
  name: string;
  control: Control<any>;
  isInlineLabel?: boolean;
  isNumberValue?: boolean;
  inputWidth?: 'md';
}

const FormSelect = ({
  name,
  control,
  isInlineLabel,
  isNumberValue,
  inputWidth,
  size = 'sm',
  ...props
}: FormSelectProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          {...field}
          size={size}
          value={isNumberValue ? field.value.toString() : field.value}
          onChange={(value) => field.onChange(isNumberValue ? Number(value) : value)}
          classNames={{
            root: clsx(classes.root, { [classes.inlineLabel]: isInlineLabel }),
            input: clsx({ [classes[inputWidth || 'md']]: inputWidth }),
          }}
          {...props}
        />
      )}
    />
  );
};

export default FormSelect;
