import React from 'react';
import { Controller } from 'react-hook-form';
import { Grid, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SpinTimeField = () => {
  const { t } = useTranslation();
  return (
    <Grid container alignItems='end'>
      <Controller
        name='spinTime'
        render={({ field: { onChange, value } }) => (
          <TextField
            className='wheel-controls-input'
            variant='outlined'
            margin='dense'
            label={t('wheel.duration')}
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

export default SpinTimeField;
