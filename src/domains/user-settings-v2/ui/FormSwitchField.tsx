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
    <div className='flex items-center justify-between gap-4'>
      <span className='flex min-w-0 flex-1 flex-nowrap'>
        <span id={labelId} className='min-w-0 flex-1'>
          {label}
        </span>
      </span>
      <span className='flex flex-nowrap'>
        <FormSwitch name={name} control={control} disabled={disabled} aria-labelledby={labelId} />
      </span>
    </div>
  );
};

export default FormSwitchField;
