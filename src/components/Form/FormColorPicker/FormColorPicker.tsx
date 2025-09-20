import { FC, useCallback } from 'react';
import { Control, Controller } from 'react-hook-form';

import ColorPicker from '../ColorPicker/ColorPicker';

interface FormColorPickerProps {
  name: string;
  control: Control;
  defaultValue?: string;
  disabled?: boolean;
}

const FormColorPicker: FC<FormColorPickerProps> = (props) => {
  const renderColorPicker = useCallback(
    ({ field }: any) => <ColorPicker {...field} disabled={props.disabled} />,
    [props.disabled],
  );

  return <Controller {...props} render={renderColorPicker} />;
};

export default FormColorPicker;
