import React, { FC } from 'react';
import { FormGroup, Typography } from '@material-ui/core';
import { UseFormMethods } from 'react-hook-form';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import FormInput from '../../Form/FormInput/FormInput';
import FormSwitch from '../../Form/FormSwitch/FormSwitch';

interface StopwatchSettingsProps {
  control: UseFormMethods['control'];
}

const StopwatchSettings: FC<StopwatchSettingsProps> = ({ control }) => (
  <>
    <SettingsGroupTitle title="Таймер" />
    <FormGroup className="auc-settings-list">
      <FormGroup row className="auc-settings-row">
        <FormInput name="startTime" label="Начальное время" control={control} type="number" className="field sm" />
        <Typography variant="body1">мин.</Typography>
      </FormGroup>
      <div className="hint">Время на которое возвращается таймер при сбросе.</div>
      <FormGroup row className="auc-settings-row">
        <FormInput
          name="timeStep"
          label="Время прибавления таймера"
          control={control}
          type="number"
          className="field sm"
        />
        <Typography variant="body1">с.</Typography>
      </FormGroup>
      <div className="hint">Время на которое изменится таймер при нажатии на +/-.</div>
      <FormGroup row className="auc-settings-row">
        <FormSwitch name="isAutoincrementActive" control={control} label="Добавлять время при смене лидера" />
        <FormInput name="autoincrementTime" className="field sm" control={control} type="number" />
        <Typography variant="body1">с.</Typography>
      </FormGroup>
      <FormGroup row className="auc-settings-row">
        <FormSwitch name="isNewSlotIncrement" control={control} label="Добавлять время за новую позицию" />
        <FormInput name="newSlotIncrement" className="field sm" control={control} type="number" />
        <Typography variant="body1">с.</Typography>
      </FormGroup>
      <FormGroup row className="auc-settings-row">
        <FormSwitch name="isMaxTimeActive" control={control} label="Макс. время автоматического добавления" />
        <FormInput name="maxTime" className="field sm" control={control} type="number" />
        <Typography variant="body1">мин.</Typography>
      </FormGroup>
    </FormGroup>
  </>
);

export default StopwatchSettings;
