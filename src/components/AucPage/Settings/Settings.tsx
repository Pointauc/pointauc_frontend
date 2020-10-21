import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  Button,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';
import ArrowUpwardOutlinedIcon from '@material-ui/icons/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@material-ui/icons/ArrowDownwardOutlined';
import { useDispatch, useSelector } from 'react-redux';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import './Settings.scss';
import { setAucSettings, SettingFields } from '../../../reducers/AucSettings/AucSettings';
import { MESSAGE_TYPES } from '../../../constants/webSocket.constants';
import { RootState } from '../../../reducers';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const { username } = useSelector((root: RootState) => root.user);
  const [defaultSettings] = useState<SettingFields>(settings);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);
  const [currentRewardPrefix, setCurrentRewardPrefix] = useState(defaultSettings.aucRewardPrefix);
  const isFormValuesChanged = useRef<boolean>(false);

  const { register, control, setValue } = useForm<SettingFields>({ defaultValues: defaultSettings });
  const formValues = useWatch<SettingFields>({ control });
  const { isSubscribed, isAutoincrementActive } = formValues;
  const { aucRewardPrefix } = settings;

  useEffect(() => {
    register()({ name: 'aucRewardPrefix', type: 'custom' });
  }, [aucRewardPrefix, register]);

  const handleSubscribeMessage = ({ data }: MessageEvent): void => {
    const { type } = JSON.parse(data);
    if (type === MESSAGE_TYPES.CP_SUBSCRIBED || type === MESSAGE_TYPES.CP_UNSUBSCRIBED) {
      setIsSubscribeLoading(false);
    }
  };

  useEffect(() => {
    if (webSocket) {
      webSocket.addEventListener('message', handleSubscribeMessage);
    }

    return (): void => {
      if (webSocket) {
        webSocket.removeEventListener('message', handleSubscribeMessage);
      }
    };
  }, [webSocket]);

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

  const submitAucRewardPrefix = (): void => {
    setValue('aucRewardPrefix', currentRewardPrefix);

    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.SET_AUC_REWARD_PREFIX, rewardPrefix: currentRewardPrefix }));
    }
  };

  useEffect(() => {
    if (isFormValuesChanged.current) {
      setIsSubscribeLoading(true);
      isSubscribed ? subscribeTwitchPoints() : unsubscribeTwitchPoints();
    }
  }, [isSubscribed, subscribeTwitchPoints, unsubscribeTwitchPoints]);

  useEffect(() => {
    isFormValuesChanged.current = true;
    dispatch(setAucSettings(formValues));
  }, [dispatch, formValues]);

  const handleCurrentRewardChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCurrentRewardPrefix(e.target.value);
  };

  const isSubscribedSwitch = (
    <Switch name="isSubscribed" inputRef={register} defaultChecked={defaultSettings.isSubscribed} />
  );

  const isBuyoutVisibleSwitch = (
    <Switch name="isBuyoutVisible" inputRef={register} defaultChecked={defaultSettings.isBuyoutVisible} />
  );

  const isAutoincrementActiveSwitch = (
    <Switch name="isAutoincrementActive" inputRef={register} defaultChecked={defaultSettings.isAutoincrementActive} />
  );

  return (
    <form className="auc-settings">
      <SettingsGroupTitle title="Twitch" />
      <FormGroup className="auc-settings-list">
        <FormGroup row className="auc-settings-row">
          <FormControlLabel
            control={isSubscribedSwitch}
            label="Подписаться на покупку поинтов"
            labelPlacement="start"
            disabled={isSubscribeLoading}
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
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1" className="auc-settings-label">
            Префикс наград аукциона
          </Typography>
          <TextField
            className="auc-settings-reward-prefix"
            variant="outlined"
            onChange={handleCurrentRewardChange}
            value={currentRewardPrefix}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={submitAucRewardPrefix}
            disabled={currentRewardPrefix === aucRewardPrefix}
            size="small"
          >
            Сохранить
          </Button>
        </FormGroup>
      </FormGroup>
      <SettingsGroupTitle title="Аукцион" />
      <FormGroup className="auc-settings-list">
        <FormGroup row className="auc-settings-row">
          <FormControlLabel control={isBuyoutVisibleSwitch} label="Показать выкуп" labelPlacement="start" />
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1" className="auc-settings-label">
            Начальное время
          </Typography>
          <TextField
            name="startTime"
            className="auc-settings-start-time"
            inputRef={register}
            type="number"
            variant="outlined"
          />
          <Typography variant="body1">мин.</Typography>
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1" className="auc-settings-label">
            Время прибавления таймера
          </Typography>
          <TextField
            name="timeStep"
            className="auc-settings-start-time"
            inputRef={register}
            type="number"
            variant="outlined"
          />
          <Typography variant="body1">с.</Typography>
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <FormControlLabel
            control={isAutoincrementActiveSwitch}
            label="Добавлять время при смене лидера"
            labelPlacement="start"
          />
          <TextField
            name="autoincrementTime"
            className="auc-settings-start-time"
            inputRef={register}
            type="number"
            variant="outlined"
            disabled={!isAutoincrementActive}
          />
          <Typography variant="body1">с.</Typography>
        </FormGroup>
        <FormGroup row className="auc-settings-row">
          <Typography variant="body1" className="auc-settings-label">
            Сортировать покупки за поинты
          </Typography>
          <Controller
            control={control}
            as={Select}
            name="purchaseSort"
            defaultValue={defaultSettings.purchaseSort}
            className="auc-settings-option"
          >
            <MenuItem value={0}>
              <Typography>Дата</Typography>
              <ArrowUpwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={1}>
              <Typography>Дата</Typography>
              <ArrowDownwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={2}>
              <Typography>Стоимость</Typography>
              <ArrowUpwardOutlinedIcon fontSize="small" />
            </MenuItem>
            <MenuItem value={3}>
              <Typography>Стоимость</Typography>
              <ArrowDownwardOutlinedIcon fontSize="small" />
            </MenuItem>
          </Controller>
        </FormGroup>
      </FormGroup>
    </form>
  );
};

export default Settings;
