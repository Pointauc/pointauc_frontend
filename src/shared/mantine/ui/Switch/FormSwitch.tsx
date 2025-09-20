import { Switch, SwitchProps } from '@mantine/core';
import { Control, Controller } from 'react-hook-form';

interface FormSwitchProps extends SwitchProps {
  name: string;
  control: Control<any>;
}
const FormSwitch = ({ name, control, ...props }: FormSwitchProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Switch
          checked={field.value}
          onChange={(event) => {
            field.onChange(event);
            field.onBlur();
          }}
          onBlur={field.onBlur}
          ref={field.ref}
          {...props}
        />
      )}
    />
  );
};

export default FormSwitch;
