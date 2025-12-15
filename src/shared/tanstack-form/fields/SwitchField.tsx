import { ReactNode } from 'react';
import { Switch, SwitchProps } from '@mantine/core';

import { useFieldContext } from '@shared/tanstack-form/lib/form';

interface SwitchFieldProps extends Omit<SwitchProps, 'checked' | 'onChange' | 'onBlur'> {
  label?: ReactNode;
}

function SwitchField({ label, ...props }: SwitchFieldProps) {
  const field = useFieldContext<boolean>();

  return (
    <Switch
      label={label}
      checked={field.state.value}
      onChange={(e) => field.handleChange(e.currentTarget.checked)}
      onBlur={field.handleBlur}
      {...props}
    />
  );
}

export default SwitchField;

