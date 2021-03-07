import React, { FC, useCallback } from 'react';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { Controller, ControllerRenderProps } from 'react-hook-form';
import ColorPicker from '../ColorPicker/ColorPicker';

interface FormColorPickerProps {
  name: string;
  control: UseFormMethods['control'];
  defaultValue?: string;
}

const FormColorPicker: FC<FormColorPickerProps> = (props) => {
  const renderColorPicker = useCallback(
    ({ onChange, value }: ControllerRenderProps) => <ColorPicker value={value} onChange={onChange} />,
    [],
  );

  return <Controller {...props} render={renderColorPicker} />;
};

export default FormColorPicker;
