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
import { useTranslation } from 'react-i18next';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import { RootState } from '../../../reducers';
import './TwitchIntegration.scss';
import FormInput from '../../Form/FormInput/FormInput';
import FormSwitch from '../../Form/FormSwitch/FormSwitch';
import FormColorPicker from '../../Form/FormColorPicker/FormColorPicker';
import { sendCpSubscribedState } from '../../../reducers/Subscription/Subscription';
import LoadingButton from '../../LoadingButton/LoadingButton';
import { closeTwitchRewards } from '../../../api/twitchApi';
import TwitchLoginButton from '../TwitchLoginButton/TwitchLoginButton';

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
  const { t } = useTranslation();
  const { username, hasTwitchAuth } = useSelector((root: RootState) => root.user);
  const {
    twitch: { actual, loading },
  } = useSelector((root: RootState) => root.subscription);
  const [, setIsSubscribed] = useState<boolean>(actual);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'twitch.rewardPresets',
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
          name={`twitch.rewardPresets[${index}].cost`}
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
      <FormColorPicker name={`twitch.rewardPresets[${index}].color`} control={control} defaultValue={value} />
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
        {hasTwitchAuth && <span className="username">{username}</span>}
      </SettingsGroupTitle>
      {username && hasTwitchAuth ? (
        <FormGroup className="auc-settings-list">
          <div style={{ display: 'flex', marginBottom: 10 }}>
            <LoadingButton
              isLoading={loading}
              variant="outlined"
              color="primary"
              className={classNames('open-rewards-button', { close: actual })}
              onClick={toggleSubscribe}
            >
              {actual ? t('settings.twitch.closeRewards') : t('settings.twitch.openRewards')}
            </LoadingButton>
            <Button
              variant="outlined"
              color="secondary"
              style={{ width: 175, marginLeft: 20 }}
              onClick={closeTwitchRewards}
            >
              {t('settings.twitch.deleteRewards')}
            </Button>
          </div>
          <FormGroup row className="auc-settings-row">
            <FormSwitch name="twitch.alwaysAddNew" control={control} label={t('settings.addNewBids')} />
          </FormGroup>
          <div className="hint">Не рекомендуется для обычных аукционов!</div>
          <FormGroup row className="auc-settings-row">
            <FormSwitch
              name="twitch.isRefundAvailable"
              control={control}
              label={t('settings.twitch.returnCanceledBids')}
            />
          </FormGroup>
          <FormGroup row className="auc-settings-row">
            <FormSwitch
              name="twitch.dynamicRewards"
              control={control}
              label={t('settings.twitch.bindRewardsToTimer')}
            />
          </FormGroup>
          <div className="hint">{t('settings.twitch.bindRewardsToTimerDesc')}</div>
          <FormGroup row className="auc-settings-row">
            <FormInput
              name="twitch.rewardsPrefix"
              control={control}
              label={t('settings.twitch.commonRewardsName')}
              className="field lg"
            />
          </FormGroup>
          <div className="hint">{t('settings.twitch.commonRewardsNameDesc')}</div>
          <Typography variant="body1" className="MuiFormControlLabel-label">
            {t('settings.twitch.rewardsList')}
          </Typography>
          <TableContainer component={Paper} style={{ width: 490, marginTop: 15 }}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>{t('settings.twitch.cost')}</StyledTableCell>
                  <StyledTableCell align="center">{t('settings.twitch.color')}</StyledTableCell>
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
            {t('settings.twitch.addReward')}
          </Button>
        </FormGroup>
      ) : (
        <TwitchLoginButton />
      )}
    </div>
  );
};

export default TwitchIntegration;
