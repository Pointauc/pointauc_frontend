import { ReactNode, useCallback, useState } from 'react';
import {
  Button,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFieldArray, useForm } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import FormColorPicker from '@components/Form/FormColorPicker/FormColorPicker';
import { SettingsForm } from '@models/settings.model.ts';
import FormInput from '@components/Form/FormInput/FormInput';
import { updateRewardPresets } from '@api/twitchApi.ts';
import { setAucSettings } from '@reducers/AucSettings/AucSettings.ts';
import LoadingButton from '@components/LoadingButton/LoadingButton';
import withLoading from '@decorators/withLoading';
import ConfirmFormOnLeave from '@components/ConfirmFormOnLeave/ConfirmFormOnLeave';
import { RootState } from '@reducers';

import RewardPresetsConfirmation from './RewardPresetsConfirmation';

type PresetsForm = Pick<SettingsForm, 'rewardPresets' | 'rewardsPrefix'>;

const StyledTableCell = styled(TableCell)<TableCellProps>({
  '&.MuiTableCell-head': {
    backgroundColor: '#505754',
    color: '#fff',
    fontSize: 15,
  },
  '&.MuiTableCell-body': {
    paddingTop: 7,
    paddingBottom: 7,
    fontSize: 14,
  },
}) as any;

const RewardPresetsForm: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpened, setConfirmOpened] = useState(false);
  const { activeSettingsPresetId } = useSelector((root: RootState) => root.user);
  const {
    settings: { rewardPresets, rewardsPrefix },
  } = useSelector((root: RootState) => root.aucSettings);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<PresetsForm>({ defaultValues: { rewardPresets, rewardsPrefix } });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewardPresets',
  });

  const handleAppendReward = useCallback(() => append({ cost: 1000, color: '#e3924c' }), [append]);

  const renderActionColumn = useCallback(
    (index: number): ReactNode => {
      const handleDeleteReward = (): void => remove(index);

      return (
        <IconButton onClick={handleDeleteReward} size='large'>
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
          name={`rewardPresets[${index}].cost`}
          control={control}
          type='number'
          defaultValue={cost}
          className='field lg'
        />
      );
    },
    [control],
  );

  const renderColorColumn = useCallback(
    (value: string, index: number) => (
      <FormColorPicker name={`rewardPresets[${index}].color`} control={control} defaultValue={value} />
    ),
    [control],
  );

  const savePresets = useCallback(
    (data: PresetsForm) => {
      dispatch(setAucSettings(data));
      reset(data);

      if (activeSettingsPresetId) {
        withLoading(
          setIsLoading,
          updateRewardPresets,
        )({
          presets: data.rewardPresets ?? [],
          prefix: data.rewardsPrefix ?? '',
          settingsId: activeSettingsPresetId,
        });
      }
    },
    [reset, activeSettingsPresetId, dispatch],
  );

  const confirmationModal = (onClose: () => void, onConfirm: () => void): ReactNode => (
    <RewardPresetsConfirmation open onCLose={onClose} onConfirm={onConfirm} />
  );

  return (
    <div>
      <ConfirmFormOnLeave isDirtyForm={isDirty} onSubmit={handleSubmit(savePresets)} content={confirmationModal} />
      <RewardPresetsConfirmation
        open={confirmOpened}
        onCLose={() => setConfirmOpened(false)}
        onConfirm={handleSubmit(savePresets)}
      />
      <FormGroup row className='auc-settings-row'>
        <FormInput
          name='rewardsPrefix'
          control={control}
          label={t('settings.twitch.commonRewardsName')}
          className='field lg'
          hint={t('settings.twitch.commonRewardsNameDesc')}
        />
      </FormGroup>
      <Typography variant='body1' className='MuiFormControlLabel-label'>
        {t('settings.twitch.rewardsList')}
      </Typography>
      <TableContainer component={Paper} style={{ width: 490, marginTop: 15 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>{t('settings.twitch.cost')}</StyledTableCell>
              <StyledTableCell align='center'>{t('settings.twitch.color')}</StyledTableCell>
              <StyledTableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map(({ cost, color, id }, index) => {
              return (
                <TableRow key={id}>
                  <StyledTableCell>{renderCostColumn(cost, index)}</StyledTableCell>
                  <StyledTableCell align='center'>{renderColorColumn(color, index)}</StyledTableCell>
                  <StyledTableCell align='right'>{renderActionColumn(index)}</StyledTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container justifyContent='space-between' style={{ marginTop: 15, width: 490 }}>
        <Button onClick={handleAppendReward} color='primary' variant='outlined'>
          {t('settings.twitch.addReward')}
        </Button>
        <LoadingButton
          isLoading={isLoading}
          onClick={() => setConfirmOpened(true)}
          color='primary'
          variant='contained'
          disabled={!isDirty}
        >
          {t('settings.twitch.saveRewards')}
        </LoadingButton>
      </Grid>
    </div>
  );
};

export default RewardPresetsForm;
