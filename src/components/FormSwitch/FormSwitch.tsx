import React, { ChangeEvent, FC, useCallback } from 'react';
import { FormControlLabel, Switch } from '@material-ui/core';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { Controller, ControllerRenderProps } from 'react-hook-form';

interface FormSwitchProps {
  name: string;
  control: UseFormMethods['control'];
  label: string;
  hint?: string;
}

const FormSwitch: FC<FormSwitchProps> = ({ label, control, name, hint }) => {
  const renderSwitch = useCallback(({ onBlur, onChange, value, ref }: ControllerRenderProps) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => onChange(checked);
    return <Switch onBlur={onBlur} onChange={handleChange} checked={value} inputRef={ref} />;
  }, []);

  const renderField = useCallback(
    (props: ControllerRenderProps) => (
      <FormControlLabel control={renderSwitch(props)} label={label} labelPlacement="start" />
    ),
    [label, renderSwitch],
  );

  return (
    <div>
      <Controller control={control} name={name} render={renderField} />
      {!!hint && <div className="hint">{hint}</div>}
    </div>
  );
};

export default FormSwitch;
