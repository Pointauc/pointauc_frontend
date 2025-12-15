import { NumberInput, NumberInputProps } from '@mantine/core';

import { useFieldContext } from '@shared/tanstack-form/lib/form';

interface NumberFieldProps extends Omit<NumberInputProps, 'value' | 'onChange' | 'onBlur'> {
  label?: string;
}

function NumberField({ label, ...props }: NumberFieldProps) {
  const field = useFieldContext<number>();

  return (
    <NumberInput
      label={label}
      value={field.state.value}
      onChange={(val) => field.handleChange(typeof val === 'number' ? val : 0)}
      onBlur={field.handleBlur}
      {...props}
    />
  );
}

export default NumberField;

