import { TextInput, TextInputProps } from '@mantine/core';
import { Control, Controller } from 'react-hook-form';
import clsx from 'clsx';

import classes from './FormInput.module.css';

interface FormInputProps extends TextInputProps {
  name: string;
  control: Control<any>;
  inputWidth?: 'sm';
}

const FormInput = ({ name, control, inputWidth, ...props }: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextInput
          {...field}
          classNames={{
            root: classes.root,
            label: classes.label,
            input: clsx(classes.input, inputWidth && classes[inputWidth]),
          }}
          {...props}
        />
      )}
    />
  );
};

export default FormInput;
