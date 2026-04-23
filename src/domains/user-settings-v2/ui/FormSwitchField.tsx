import { Box, Group } from '@mantine/core';
import { Control } from 'react-hook-form';

import FormSwitch from '@shared/mantine/ui/Switch/FormSwitch.tsx';

import type { ReactNode } from 'react';

interface FormSwitchFieldProps {
  name: string;
  control: Control<any>;
  label: ReactNode;
  disabled?: boolean;
}

const FormSwitchField = ({ name, control, label, disabled }: FormSwitchFieldProps) => {
  const labelId = `${name}-label`;

  return (
    <Group align='center' justify='space-between' gap='md' wrap='wrap'>
      <Group component='span' style={{ flex: 1, minWidth: 0 }} wrap='nowrap'>
        <Box component='span' id={labelId} style={{ flex: 1, minWidth: 0 }}>
          {label}
        </Box>
      </Group>
      <Group component='span' wrap='nowrap'>
        <FormSwitch name={name} control={control} disabled={disabled} aria-labelledby={labelId} />
      </Group>
    </Group>
  );
};

export default FormSwitchField;
