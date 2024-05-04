import { ChangeEvent, FC, ReactNode, useCallback } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { Control, Controller, ControllerRenderProps } from 'react-hook-form';

import FieldLabel from '@components/Form/FieldLabel';

interface FormSwitchProps {
  name: string;
  control: Control<any>;
  label: ReactNode;
  hint?: string;
}

const FormSwitch: FC<FormSwitchProps> = ({ label, control, name, hint }) => {
  const renderSwitch = useCallback(({ onBlur, onChange, value, ref }: ControllerRenderProps) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean): void => {
      onChange(checked);
      onBlur();
    };
    return <Switch color='secondary' onChange={handleChange} checked={value} inputRef={ref} />;
  }, []);

  const renderField = useCallback(
    ({ field }: any) => (
      <FormControlLabel
        control={renderSwitch(field)}
        label={<FieldLabel label={label} hint={hint} />}
        labelPlacement='start'
      />
    ),
    [hint, label, renderSwitch],
  );

  return (
    <div>
      <Controller control={control} name={name} render={renderField} />
    </div>
  );
};

export default FormSwitch;
