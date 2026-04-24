import { Checkbox } from '@mantine/core';
import { Control, Controller } from 'react-hook-form';

import type { ReactNode } from 'react';

interface FormCheckboxFieldProps {
  name: string;
  control: Control<any>;
  label: ReactNode;
  disabled?: boolean;
}

const FormCheckboxField = ({ name, control, label, disabled }: FormCheckboxFieldProps) => {
  const labelId = `${name}-label`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className='flex min-w-0 flex-nowrap items-center gap-2.5'>
          <Checkbox
            checked={Boolean(field.value)}
            disabled={disabled}
            id={name}
            size='sm'
            aria-labelledby={labelId}
            onBlur={field.onBlur}
            onChange={(event) => {
              field.onChange(event.currentTarget.checked);
              field.onBlur();
            }}
            ref={field.ref}
          />
          <span id={labelId} className='min-w-0 flex-1'>
            {label}
          </span>
        </div>
      )}
    />
  );
};

export default FormCheckboxField;
