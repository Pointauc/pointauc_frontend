import React, { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { FormControlLabel, OutlinedInput, OutlinedInputProps } from '@material-ui/core';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { Controller, ControllerRenderProps } from 'react-hook-form';

interface FormInputProps extends OutlinedInputProps {
  name: string;
  control: UseFormMethods['control'];
  label?: string;
  className?: string;
  type?: string;
  hint?: string;
}

const FormInput: FC<FormInputProps> = ({ label, control, type, name, defaultValue, hint, ...restProps }) => {
  const isNumber = useMemo(() => type === 'number', [type]);
  const normalizeNumber = useCallback((value) => value && Number(value), []);
  const renderInput = useCallback(
    ({ onBlur, onChange, value: formValue }: ControllerRenderProps) => {
      const handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>): void =>
        onChange(isNumber ? normalizeNumber(value) : value);

      return <OutlinedInput onChange={handleChange} value={formValue} type={type} onBlur={onBlur} {...restProps} />;
    },
    [isNumber, normalizeNumber, restProps, type],
  );

  const renderField = useCallback(
    (data: ControllerRenderProps) =>
      label ? <FormControlLabel control={renderInput(data)} label={label} labelPlacement="start" /> : renderInput(data),
    [label, renderInput],
  );

  return (
    <div>
      <Controller name={name} defaultValue={defaultValue} control={control} render={renderField} />
      {!!hint && <div className="hint">{hint}</div>}
    </div>
  );
};

export default FormInput;
