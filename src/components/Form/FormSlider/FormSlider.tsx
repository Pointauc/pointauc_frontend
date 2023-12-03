import { FC, useCallback } from 'react';
import { Control, Controller, ControllerRenderProps } from 'react-hook-form';
import { FormControlLabel, Slider, SliderProps } from '@mui/material';

import './FormSlider.scss';

interface FormSliderProps extends SliderProps {
  name: string;
  control: Control;
  label?: string;
  hint?: string;
}

const FormSlider: FC<FormSliderProps> = ({ name, control, hint, label, ...sliderProps }) => {
  const renderSlider = useCallback(
    ({ onBlur, onChange, value: formValue }: ControllerRenderProps) => {
      const handleChange = (e: any, value: number | number[]): void => {
        onChange(value);
      };

      return <Slider onChange={handleChange} value={formValue} onBlur={onBlur} {...sliderProps} />;
    },
    [sliderProps],
  );

  const renderField = useCallback(
    ({ field }: any) =>
      label ? (
        <FormControlLabel control={renderSlider(field)} label={label} labelPlacement='start' />
      ) : (
        renderSlider(field)
      ),
    [label, renderSlider],
  );

  return (
    <div className='form-slider-wrapper'>
      <Controller name={name} control={control} render={renderField} />
      {!!hint && (
        <div className='hint'>
          {hint.split('\\n').map((value) => (
            <div key={value}>{value}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormSlider;
