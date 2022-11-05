import React, { FC } from 'react';
import { FormGroup, Typography } from '@material-ui/core';
import { UseFormMethods } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import FormInput from '../../Form/FormInput/FormInput';
import FormSwitch from '../../Form/FormSwitch/FormSwitch';

interface StopwatchSettingsProps {
  control: UseFormMethods['control'];
}

const StopwatchSettings: FC<StopwatchSettingsProps> = ({ control }) => {
  const { t } = useTranslation();

  return (
    <>
      <SettingsGroupTitle title={t('settings.stopwatch.stopwatch')} />
      <FormGroup className="auc-settings-list">
        <FormGroup row className="auc-settings-row">
          <FormInput
            name="startTime"
            label={t('settings.stopwatch.startTime')}
            control={control}
            type="number"
            className="field sm"
          />
          <Typography variant="body1">{t('common.min')}</Typography>
        </FormGroup>
        <div className="hint">{t('settings.stopwatch.startTimeDesc')}</div>
        <FormGroup row className="auc-settings-row">
          <FormInput
            name="timeStep"
            label={t('settings.stopwatch.additionalTime')}
            control={control}
            type="number"
            className="field sm"
          />
          <Typography variant="body1">{t('common.sec')}</Typography>
        </FormGroup>
        <div className="hint">{t('settings.stopwatch.additionalTimeDesc')}</div>
        <FormGroup row className="auc-settings-row">
          <FormSwitch
            name="isAutoincrementActive"
            control={control}
            label={t('settings.stopwatch.addTimeOnLeaderChange')}
          />
          <FormInput name="autoincrementTime" className="field sm" control={control} type="number" />
          <Typography variant="body1">{t('common.sec')}</Typography>
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormSwitch
            name="isNewSlotIncrement"
            control={control}
            label={t('settings.stopwatch.addTimeOnNewPosition')}
          />
          <FormInput name="newSlotIncrement" className="field sm" control={control} type="number" />
          <Typography variant="body1">{t('common.sec')}</Typography>
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormSwitch name="isMaxTimeActive" control={control} label={t('settings.stopwatch.maxAdditionalTime')} />
          <FormInput name="maxTime" className="field sm" control={control} type="number" />
          <Typography variant="body1">{t('common.min')}</Typography>
        </FormGroup>
      </FormGroup>
    </>
  );
};

export default StopwatchSettings;
