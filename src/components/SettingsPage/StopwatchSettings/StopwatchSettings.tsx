import { FC } from 'react';
import { FormGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';

import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle';
import FormInput from '@components/Form/FormInput/FormInput';
import FormSwitch from '@components/Form/FormSwitch/FormSwitch';

interface StopwatchSettingsProps {
  control: UseFormReturn['control'];
}

const StopwatchSettings: FC<StopwatchSettingsProps> = ({ control }) => {
  const { t } = useTranslation();

  return (
    <>
      <SettingsGroupTitle title={t('settings.stopwatch.stopwatch')} />
      <FormGroup className='auc-settings-list'>
        <FormGroup row className='auc-settings-row'>
          <FormInput
            name='startTime'
            label={t('settings.stopwatch.startTime')}
            control={control}
            type='number'
            className='field sm'
            hint={t('settings.stopwatch.startTimeDesc')}
          />
          <Typography variant='body1'>{t('common.min')}</Typography>
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormInput
            name='timeStep'
            label={t('settings.stopwatch.additionalTime')}
            control={control}
            type='number'
            className='field sm'
            hint={t('settings.stopwatch.additionalTimeDesc')}
          />
          <Typography variant='body1'>{t('common.sec')}</Typography>
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch
            name='isAutoincrementActive'
            control={control}
            label={t('settings.stopwatch.addTimeOnLeaderChange')}
          />
          <FormInput name='autoincrementTime' className='field sm' control={control} type='number' />
          <Typography variant='body1'>{t('common.sec')}</Typography>
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='isIncrementActive' control={control} label={t('settings.donations.addTimeOnDonation')} />
          <FormInput name='incrementTime' className='field sm' control={control} type='number' />
          <Typography variant='body1'>{t('common.sec')}</Typography>
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch
            name='isNewSlotIncrement'
            control={control}
            label={t('settings.stopwatch.addTimeOnNewPosition')}
          />
          <FormInput name='newSlotIncrement' className='field sm' control={control} type='number' />
          <Typography variant='body1'>{t('common.sec')}</Typography>
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='isMaxTimeActive' control={control} label={t('settings.stopwatch.maxAdditionalTime')} />
          <FormInput name='maxTime' className='field sm' control={control} type='number' />
          <Typography variant='body1'>{t('common.min')}</Typography>
        </FormGroup>
        <FormGroup row className='auc-settings-row'>
          <FormSwitch name='isMinTimeActive' control={control} label={t('settings.stopwatch.minTimeRequired')} />
          <FormInput name='minTime' className='field sm' control={control} type='number' />
          <Typography variant='body1'>{t('common.min')}</Typography>
        </FormGroup>
      </FormGroup>
    </>
  );
};

export default StopwatchSettings;
