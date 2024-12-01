import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, Grid, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AvTimerIcon from '@mui/icons-material/AvTimer';

import SettingsGroup from '@pages/settings/SettingsGroup/SettingsGroup.tsx';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch.tsx';
import FormInput from '@components/Form/FormInput/FormInput.tsx';

import '@pages/settings/AuctionSettings/TimerSettings/TimerSettings.scss';

const TimerSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <SettingsGroup title={t('settings.stopwatch.stopwatch')}>
      <Grid container spacing={1} direction='column'>
        <Grid item zIndex={1}>
          <FormSwitch
            name='showTotalTime'
            control={control}
            hint={t('settings.stopwatch.totalTimeHint')}
            label={
              <Grid container alignItems='center' gap={1}>
                {t('settings.stopwatch.totalTime')}
              </Grid>
            }
          />
        </Grid>
        <Grid container item spacing={4} className='timer-settings'>
          <Grid container item direction='column' wrap='nowrap' xs={6} gap={1}>
            <Typography className='add-time' variant='h6'>
              {t('settings.stopwatch.addOnCondition')}
            </Typography>
            <div className='c' style={{ marginLeft: 36 }}>
              <FormGroup row className='auc-settings-row'>
                <FormSwitch
                  name='isAutoincrementActive'
                  control={control}
                  label={
                    <Grid container alignItems='center' gap={1}>
                      <SwapVertIcon fontSize='small' />
                      {t('settings.stopwatch.addTimeOnLeaderChange')}
                    </Grid>
                  }
                />
                <FormInput name='autoincrementTime' className='field sm' control={control} type='number' />
                <Typography variant='body1'>{t('common.sec')}</Typography>
              </FormGroup>
              <FormGroup row className='auc-settings-row'>
                <FormSwitch
                  name='isNewSlotIncrement'
                  control={control}
                  label={
                    <Grid container alignItems='center' gap={1}>
                      <AddBoxIcon fontSize='small' />
                      {t('settings.stopwatch.addTimeOnNewPosition')}
                    </Grid>
                  }
                />
                <FormInput name='newSlotIncrement' className='field sm' control={control} type='number' />
                <Typography variant='body1'>{t('common.sec')}</Typography>
              </FormGroup>
              <FormGroup row className='auc-settings-row'>
                <FormSwitch
                  name='isIncrementActive'
                  control={control}
                  label={
                    <Grid container alignItems='center' gap={1}>
                      <AttachMoneyIcon fontSize='small' />
                      {t('settings.stopwatch.addTimeOnDonation')}
                    </Grid>
                  }
                />
                <FormInput name='incrementTime' className='field sm' control={control} type='number' />
                <Typography variant='body1'>{t('common.sec')}</Typography>
              </FormGroup>
            </div>
          </Grid>
          <Grid container item direction='column' wrap='nowrap' xs={6} gap={1}>
            <Typography className='not-add-time' variant='h6'>
              {t('settings.stopwatch.notOnCondition')}
            </Typography>
            <div className='c' style={{ marginLeft: 36 }}>
              <FormGroup row className='auc-settings-row'>
                <FormSwitch
                  name='isMinTimeActive'
                  control={control}
                  label={
                    <Grid container alignItems='center' gap={1}>
                      <AvTimerIcon fontSize='small' />
                      {t('settings.stopwatch.maxAdditionalTime')}
                    </Grid>
                  }
                />
                <FormInput name='minTime' className='field sm' control={control} type='number' />
                <Typography variant='body1'>{t('common.min')}</Typography>
              </FormGroup>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </SettingsGroup>
  );
};

export default TimerSettings;
