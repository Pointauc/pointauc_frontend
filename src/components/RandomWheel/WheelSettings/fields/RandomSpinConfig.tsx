import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';

const RandomSpinConfig = () => {
  const { t } = useTranslation();

  return (
    <Grid container alignItems='end'>
      <Controller
        name='randomSpinConfig.min'
        render={({ field: { onChange, value } }) => (
          <TextField
            className='wheel-controls-input small'
            variant='outlined'
            margin='dense'
            label={t('common.from')}
            type='number'
            onChange={(e) => (e.target.value === '' ? onChange(null) : onChange(Number(e.target.value)))}
            value={Number.isNaN(value) || value == null ? '' : value}
          />
        )}
      />
      <Typography className='wheel-controls-tip wheel-controls-input-delimiter'>–</Typography>
      <Controller
        name='randomSpinConfig.max'
        render={({ field: { onChange, value } }) => (
          <TextField
            className='wheel-controls-input small'
            variant='outlined'
            margin='dense'
            label={t('common.to')}
            type='number'
            onChange={(e) => (e.target.value === '' ? onChange(null) : onChange(Number(e.target.value)))}
            value={Number.isNaN(value) || value == null ? '' : value}
          />
        )}
      />
      <Typography className='wheel-controls-tip'>с.</Typography>
    </Grid>
  );
};

export default RandomSpinConfig;
