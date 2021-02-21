import React, { FC, ReactNode, useCallback, useState } from 'react';
import {
  Button,
  createStyles,
  FormGroup,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
  withStyles,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { useFieldArray } from 'react-hook-form';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import DeleteIcon from '@material-ui/icons/Delete';
import classNames from 'classnames';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import { RootState } from '../../../reducers';
import { ReactComponent as TwitchSvg } from '../../../assets/icons/twitch.svg';
import './TwitchIntegration.scss';
import FormInput from '../../Form/FormInput/FormInput';
import FormSwitch from '../../Form/FormSwitch/FormSwitch';
import FormColorPicker from '../../Form/FormColorPicker/FormColorPicker';
import { sendCpSubscribedState } from '../../../reducers/Subscription/Subscription';
import LoadingButton from '../../LoadingButton/LoadingButton';
import { closeTwitchRewards } from '../../../api/twitchApi';

const authParams = {
  client_id: '83xjs5k4yvqo0yn2cxu1v5lan2eeam',
  redirect_uri: `${window.location.origin}/twitch/redirect`,
  response_type: 'code',
  scope: 'channel:read:redemptions channel:manage:redemptions',
  force_verify: 'true',
};

const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: '#505754',
      color: theme.palette.common.white,
      fontSize: 15,
    },
    body: {
      paddingTop: 7,
      paddingBottom: 7,
      fontSize: 14,
    },
  }),
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }),
)(TableRow);

interface TwitchIntegrationProps {
  control: UseFormMethods['control'];
}

const TwitchIntegration: FC<TwitchIntegrationProps> = ({ control }) => {
  const dispatch = useDispatch();
  const { username } = useSelector((root: RootState) => root.user);
  const {
    twitch: { actual, loading },
  } = useSelector((root: RootState) => root.subscription);
  const [, setIsSubscribed] = useState<boolean>(actual);

  const handleAuth = (): void => {
    const params = new URLSearchParams(authParams);
    authUrl.search = params.toString();

    window.open(authUrl.toString(), '_self');
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'twitch.rewards',
  });

  const handleAppendReward = useCallback(() => append({ cost: 1000, color: '#e3924c' }), [append]);

  const renderActionColumn = useCallback(
    (index: number): ReactNode => {
      const handleDeleteReward = (): void => remove(index);

      return (
        <IconButton onClick={handleDeleteReward}>
          <DeleteIcon />
        </IconButton>
      );
    },
    [remove],
  );

  const renderCostColumn = useCallback(
    (cost: number, index: number): ReactNode => {
      return (
        <FormInput
          name={`twitch.rewards[${index}].cost`}
          control={control}
          type="number"
          defaultValue={cost}
          className="field lg"
        />
      );
    },
    [control],
  );

  const renderColorColumn = useCallback(
    (value: string, index: number) => (
      <FormColorPicker name={`twitch.rewards[${index}].color`} control={control} defaultValue={value} />
    ),
    [control],
  );

  const toggleSubscribe = useCallback((): void => {
    setIsSubscribed((checked) => {
      dispatch(sendCpSubscribedState(!checked));

      return !checked;
    });
  }, [dispatch]);

  return (
    <div style={{ marginBottom: 20 }}>
      <SettingsGroupTitle title="Twitch">
        <span className="username">{username}</span>
      </SettingsGroupTitle>
      {username ? (
        <FormGroup className="auc-settings-list">
          <div style={{ display: 'flex', marginBottom: 10 }}>
            <LoadingButton
              isLoading={loading}
              variant="outlined"
              color="primary"
              className={classNames('open-rewards-button', { close: actual })}
              onClick={toggleSubscribe}
            >
              {actual ? 'Скрыть награды' : 'Включить награды'}
            </LoadingButton>
            <Button
              variant="outlined"
              color="secondary"
              style={{ width: 175, marginLeft: 20 }}
              onClick={closeTwitchRewards}
            >
              Удалить награды
            </Button>
          </div>
          <FormGroup row className="auc-settings-row">
            <FormSwitch name="twitch.isRefundAvailable" control={control} label="Возвращать отмененные награды" />
          </FormGroup>
          <FormGroup row className="auc-settings-row">
            <FormSwitch name="twitch.dynamicRewards" control={control} label="Привязать включение наград к таймеру" />
          </FormGroup>
          <div className="hint">
            Награды будут автомачески включаться при возобновлении таймера и отключаться при паузе или окончании.
          </div>
          <FormGroup row className="auc-settings-row">
            <FormInput
              name="twitch.rewardsPrefix"
              control={control}
              label="Общее название для наград"
              className="field lg"
            />
          </FormGroup>
          <div className="hint">
            При включении интеграции, на канале автоматически создаются награды в формате "Название + Стоимость".
          </div>
          <Typography variant="body1" className="MuiFormControlLabel-label">
            Список наград:
          </Typography>
          <TableContainer component={Paper} style={{ width: 490, marginTop: 15 }}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Стоимость</StyledTableCell>
                  <StyledTableCell align="center">Цвет</StyledTableCell>
                  <StyledTableCell />
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {fields.map(({ cost, color, id }, index) => {
                  return (
                    <StyledTableRow key={id}>
                      <StyledTableCell>{renderCostColumn(cost, index)}</StyledTableCell>
                      <StyledTableCell align="center">{renderColorColumn(color, index)}</StyledTableCell>
                      <StyledTableCell align="right">{renderActionColumn(index)}</StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Button onClick={handleAppendReward} color="primary" style={{ marginTop: 15, width: 220 }} variant="outlined">
            Добавить награду
          </Button>
        </FormGroup>
      ) : (
        <Button
          className="twitch-login-button"
          variant="contained"
          size="large"
          startIcon={<TwitchSvg className="base-icon" />}
          onClick={handleAuth}
        >
          Подключить twitch
        </Button>
      )}
    </div>
  );
};

export default TwitchIntegration;
