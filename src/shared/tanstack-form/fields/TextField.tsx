import { TextInput, TextInputProps } from '@mantine/core';

import { useFieldContext } from '@shared/tanstack-form/lib/form';

interface TextFieldProps extends Omit<TextInputProps, 'value' | 'onChange' | 'onBlur'> {
  label?: string;
}

function TextField({ label, ...props }: TextFieldProps) {
  const field = useFieldContext<string>();

  return (
    <TextInput
      label={label}
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      {...props}
    />
  );
}

export default TextField;

