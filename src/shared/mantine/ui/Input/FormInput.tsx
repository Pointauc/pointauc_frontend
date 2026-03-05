import { Group, TextInput, TextInputProps, Text } from '@mantine/core';
import { Control, Controller } from 'react-hook-form';
import clsx from 'clsx';

import classes from './FormInput.module.css';

interface FormInputProps extends TextInputProps {
  name: string;
  control: Control<any>;
  inputWidth?: 'sm';
  lablePlacement?: 'left' | 'top';
}

const FormInput = ({ name, control, inputWidth, lablePlacement = 'left', label, ...props }: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Group wrap='nowrap'>
          {label && lablePlacement === 'left' && (
            <Text component='label' htmlFor={name} className={classes.label}>
              {label}
            </Text>
          )}
          <TextInput
            id={name}
            {...field}
            classNames={{
              root: clsx(classes.root, inputWidth && classes[inputWidth]),
            }}
            {...props}
          />
        </Group>
      )}
    />
  );
};

export default FormInput;
