import React, { ChangeEvent, FC, useCallback } from 'react';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { Controller, ControllerRenderProps } from 'react-hook-form';
import { FormControlLabel, Slider, SliderProps } from '@material-ui/core';
import './FormSlider.scss';

interface FormSliderProps extends SliderProps {
  name: string;
  control: UseFormMethods['control'];
  label?: string;
  hint?: string;
}

const FormSlider: FC<FormSliderProps> = ({ name, control, hint, label, ...sliderProps }) => {
  const renderSlider = useCallback(
    ({ onBlur, onChange, value: formValue }: ControllerRenderProps) => {
      const handleChange = (e: ChangeEvent<{}>, value: number | number[]): void => {
        onChange(value);
      };

      return <Slider onChange={handleChange} value={formValue} onBlur={onBlur} {...sliderProps} />;
    },
    [sliderProps],
  );

  const renderField = useCallback(
    (data: ControllerRenderProps) =>
      label ? (
        <FormControlLabel control={renderSlider(data)} label={label} labelPlacement="start" />
      ) : (
        renderSlider(data)
      ),
    [label, renderSlider],
  );

  return (
    <div className="form-slider-wrapper">
      <Controller name={name} control={control} render={renderField} />
      {!!hint && (
        <div className="hint">
          {hint.split('\\n').map((value) => (
            <div key={value}>{value}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormSlider;
