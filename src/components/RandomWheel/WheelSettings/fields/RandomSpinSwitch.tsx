import React from 'react';
import { IconButton } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import { useController } from 'react-hook-form';

const RandomSpinSwitch = () => {
  const { field } = useController({ name: 'randomSpinEnabled' });

  return (
    <IconButton
      onClick={() => field.onChange(!field.value)}
      onBlur={field.onBlur}
      color={field.value ? 'primary' : 'default'}
    >
      <CasinoIcon />
    </IconButton>
  );
};

export default RandomSpinSwitch;
