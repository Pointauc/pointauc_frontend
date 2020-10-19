import React, { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button, FormControlLabel, FormGroup, Input, Switch, Typography } from '@material-ui/core';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import './Settings.scss';
import { setAucSettings, SettingFields } from '../../../reducers/AucSettings/AucSettings';
import { useDispatch, useSelector } from 'react-redux';
import { MESSAGE_TYPES } from '../../../constants/webSocket.constants';
import { RootState } from '../../../reducers';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const { username } = useSelector((root: RootState) => root.user);
  const [defaultSettings] = useState<SettingFields>(settings);
  const { register, control } = useForm<SettingFields>({ defaultValues: defaultSettings });
  const formValues = useWatch<SettingFields>({ control });
  const { isSubscribed } = formValues;

  const subscribeTwitchPoints = useCallback((): void => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.CHANNEL_POINTS_SUBSCRIBE, username }));
    }
  }, [username, webSocket]);

  const unsubscribeTwitchPoints = useCallback((): void => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.CHANNEL_POINTS_UNSUBSCRIBE, username }));
    }
  }, [username, webSocket]);

  const requestMockData = (): void => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.MOCK_PURCHASE }));
    }
  };

  useEffect(() => {
    isSubscribed ? subscribeTwitchPoints() : unsubscribeTwitchPoints();
  }, [isSubscribed, subscribeTwitchPoints, unsubscribeTwitchPoints]);

  useEffect(() => {
    dispatch(setAucSettings(formValues));
  }, [dispatch, formValues]);

  return (
    <form className="auc-settings">
      <SettingsGroupTitle title="Twitch" />
      <FormGroup className="auc-settings-list">
        <FormGroup row>
          <FormControlLabel
            control={<Switch name="isSubscribed" inputRef={register} />}
            label="Подписаться на покупку поинтов"
            labelPlacement="start"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={requestMockData}
            disabled={!webSocket}
            className="mock-data-button"
            size="small"
          >
            Get mock data
          </Button>
        </FormGroup>
      </FormGroup>
      <SettingsGroupTitle title="Аукцион" />
      <FormGroup className="auc-settings-list">
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1">Начальное время</Typography>
          <Input
            name="startTime"
            className="auc-settings-start-time"
            inputRef={register}
            type="number"
          />
          <Typography variant="body1">минут</Typography>
        </FormGroup>
      </FormGroup>
    </form>
  );
};

export default Settings;
