import { Box, Checkbox, Group } from '@mantine/core';
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
        <Group align='center' gap='sm' wrap='nowrap' style={{ minWidth: 0 }}>
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
          <Box component='span' id={labelId} style={{ flex: 1, minWidth: 0 }}>
            {label}
          </Box>
        </Group>
      )}
    />
  );
};

export default FormCheckboxField;
