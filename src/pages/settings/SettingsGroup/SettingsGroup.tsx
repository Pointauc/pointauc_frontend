import React, { useEffect } from 'react';
import { Typography } from '@mui/material';
import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';

import FormSwitch from '@components/Form/FormSwitch/FormSwitch.tsx';

import '@pages/settings/SettingsGroup/SettingsGroup.scss';

interface SettingsGroupProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  hint?: string;
  controlName?: string;
  open?: boolean;
}

const SettingsGroup = ({ title, controlName, children, className, hint, open: _open }: SettingsGroupProps) => {
  const { control, watch } = useFormContext();
  const contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && _open != null) {
      contentRef.current.style.maxHeight = _open ? `${contentRef.current.scrollHeight}px` : '0';
    }
  }, [_open]);

  const open = _open ?? true;

  return (
    <div className={classNames('settings-group', className, open ? 'open' : 'close')}>
      <div className='group-title'>
        {controlName && (
          <FormSwitch
            name={controlName}
            control={control}
            label={<Typography variant='h5'>{title}</Typography>}
            hint={hint}
          />
        )}
        {!controlName && <Typography variant='h5'>{title}</Typography>}
      </div>
      <div className='content' ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default SettingsGroup;
