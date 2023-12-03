import { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { FormControlLabel, OutlinedInput, OutlinedInputProps, Typography } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

import FieldLabel from '@components/Form/FieldLabel';

import type { ControllerRenderProps, FormState, RegisterOptions } from 'react-hook-form';

interface FormInputProps extends OutlinedInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  className?: string;
  type?: string;
  hint?: string;
  rules?: Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  errors?: FormState<any>['errors'];
}

const FormInput: FC<FormInputProps> = ({
  label,
  control,
  type,
  name,
  defaultValue,
  hint,
  errors = {},
  rules,
  ...restProps
}) => {
  const isNumber = useMemo(() => type === 'number', [type]);
  const normalizeNumber = useCallback((value: string) => Number(value) || undefined, []);
  const renderInput = useCallback(
    ({ onBlur, onChange, value: formValue }: ControllerRenderProps) => {
      const handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>): void =>
        onChange(isNumber ? normalizeNumber(value) : value);

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <OutlinedInput onChange={handleChange} value={formValue ?? ''} type={type} onBlur={onBlur} {...restProps} />
          <ErrorMessage as={<Typography className='error-hint' />} errors={errors} name={name} />
        </div>
      );
    },
    [errors, isNumber, name, normalizeNumber, restProps, type],
  );

  const renderField = useCallback(
    ({ field }: { field: ControllerRenderProps }) =>
      label ? (
        <FormControlLabel
          control={renderInput(field)}
          label={<FieldLabel label={label} hint={hint} />}
          labelPlacement='start'
        />
      ) : (
        renderInput(field)
      ),
    [hint, label, renderInput],
  );

  return (
    <div>
      <Controller rules={rules} name={name} defaultValue={defaultValue} control={control} render={renderField} />
    </div>
  );
};

export default FormInput;
