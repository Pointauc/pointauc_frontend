import React, { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { FormControlLabel, OutlinedInput, OutlinedInputProps, Typography } from '@material-ui/core';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { Controller, ControllerRenderProps } from 'react-hook-form';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';
import { ErrorMessage } from '@hookform/error-message';

interface FormInputProps extends OutlinedInputProps {
  name: string;
  control: UseFormMethods['control'];
  label?: string;
  className?: string;
  type?: string;
  hint?: string;
  rules?: Exclude<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  errors?: UseFormMethods['errors'];
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
  const normalizeNumber = useCallback((value) => value && Number(value), []);
  const renderInput = useCallback(
    ({ onBlur, onChange, value: formValue }: ControllerRenderProps) => {
      const handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>): void =>
        onChange(isNumber ? normalizeNumber(value) : value);

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <OutlinedInput onChange={handleChange} value={formValue} type={type} onBlur={onBlur} {...restProps} />
          <ErrorMessage as={<Typography className="error-hint" />} errors={errors} name={name} />
        </div>
      );
    },
    [errors, isNumber, name, normalizeNumber, restProps, type],
  );

  const renderField = useCallback(
    (data: ControllerRenderProps) =>
      label ? <FormControlLabel control={renderInput(data)} label={label} labelPlacement="start" /> : renderInput(data),
    [label, renderInput],
  );

  return (
    <div>
      <Controller rules={rules} name={name} defaultValue={defaultValue} control={control} render={renderField} />
      {!!hint && <div className="hint">{hint}</div>}
    </div>
  );
};

export default FormInput;
