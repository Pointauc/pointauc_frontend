import React from 'react';
import ForwardIcon from '@mui/icons-material/Forward';
import { Link, SvgIcon, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Grid2 from '@mui/material/Grid2';

import PointsIcon from '@assets/icons/channelPoints.svg?react';
import FormInput from '@components/Form/FormInput/FormInput.tsx';

const examplePresets = [50, 100, 200];

const ExchangeRate = () => {
  const { control, setValue } = useFormContext();
  const { t } = useTranslation();

  const pointsRate = useWatch({ name: 'pointsRate' });
  const reversePointsRate = useWatch({ name: 'reversePointsRate' });
  const showExample = pointsRate > 1;

  return (
    <Grid2 container alignItems='center' color='#f3f3f3' sx={{ mb: showExample ? 3 : 0 }}>
      <Typography sx={{ mr: 4 }}>{t('settings.donations.conversion')}</Typography>
      <Grid2 container alignItems='center' position='relative'>
        <Typography fontSize='larger'>{`1 ${t('common.currencySign')}`}</Typography>
        <ForwardIcon
          sx={{
            marginLeft: 2,
            marginRight: 2,
            transition: 'transform 0.3s',
            transform: reversePointsRate ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fontSize='large'
        />
        <FormInput name='pointsRate' control={control} type='number' className='field md' />
        <SvgIcon color='primary' fontSize='small' sx={{ mr: 4 }}>
          <PointsIcon />
        </SvgIcon>
        {showExample && (
          <Typography
            color='#808080'
            fontSize='smaller'
            sx={{ transform: 'translateY(100%)', position: 'absolute', bottom: -2, left: 0, whiteSpace: 'nowrap' }}
          >
            {examplePresets
              .map((money) => `${money} ${t('common.currencySign')} > ${(money * pointsRate).toLocaleString()}`)
              .join(' | ')}
          </Typography>
        )}
      </Grid2>
      <Link
        sx={{ display: 'flex', alignItems: 'center', gap: 1, userSelect: 'none' }}
        onClick={() => setValue('reversePointsRate', !reversePointsRate, { shouldDirty: true, shouldTouch: true })}
      >
        {t('settings.donations.switchRates')}
        <SwapHorizIcon fontSize='medium' />
      </Link>
    </Grid2>
  );
};

export default ExchangeRate;
