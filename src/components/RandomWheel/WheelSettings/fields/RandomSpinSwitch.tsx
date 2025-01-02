import React from 'react';
import { IconButton, SxProps, Tooltip } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const filledStyles: SxProps = [
  { '&:hover': { bgcolor: 'primary.light' } },
  { bgcolor: 'primary.main', color: 'primary.contrastText' },
];

const RandomSpinSwitch = () => {
  const { field } = useController({ name: 'randomSpinEnabled' });
  const { t } = useTranslation();

  return (
    <Tooltip title={t('wheel.randomSpin')}>
      <IconButton
        onClick={() => field.onChange(!field.value)}
        onBlur={field.onBlur}
        color={'primary'}
        sx={[
          {
            borderColor: 'primary.main',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 2,
            bgcolor: 'transparent',
            color: 'primary.main',
          },
          ...(field.value ? filledStyles : []),
        ]}
      >
        <CasinoIcon />
      </IconButton>
    </Tooltip>
  );
};

export default RandomSpinSwitch;
