import { ActionIcon, Button, Group, Paper, Stack, Table, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { updateRewardPresets } from '@api/twitchApi.ts';
import ConfirmFormOnLeave from '@components/ConfirmFormOnLeave/ConfirmFormOnLeave';
import FormColorPicker from '@components/Form/FormColorPicker/FormColorPicker';
import withLoading from '@decorators/withLoading';
import SettingLabel from '@domains/user-settings/ui/SettingLabel';
import { SettingsForm } from '@models/settings.model.ts';
import { RootState } from '@reducers';
import { setAucSettings } from '@reducers/AucSettings/AucSettings.ts';
import FormInput from '@shared/mantine/ui/Input/FormInput';
import { OutlineInput } from '@shared/mantine/ui/Input';

import RewardPresetsConfirmation from './RewardPresetsConfirmation';
import classes from './RewardPresetsForm.module.css';

type PresetsForm = Pick<SettingsForm, 'rewardPresets' | 'rewardsPrefix'>;
const MAX_REWARD_TITLE_LENGTH = 45;

const checkIsRewardsPrefixValid = (rewardsPrefix: string, rewardPresets: PresetsForm['rewardPresets']): boolean => {
  if (!rewardPresets?.length) {
    return true;
  }

  return rewardPresets.every(({ cost }) => `${rewardsPrefix} ${cost}`.length <= MAX_REWARD_TITLE_LENGTH);
};

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
    clearErrors,
    setError,
    formState: { isDirty, errors, isValid },
  } = useForm<PresetsForm>({ defaultValues: { rewardPresets, rewardsPrefix } });
  const currentRewardsPrefix = useWatch({ control, name: 'rewardsPrefix' });
  const currentRewardPresets = useWatch({ control, name: 'rewardPresets' });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewardPresets',
  });

  const handleAppendReward = useCallback(() => append({ cost: 1000, color: '#e3924c' }), [append]);

  const renderActionColumn = useCallback(
    (index: number): ReactNode => {
      const handleDeleteReward = (): void => remove(index);

      return (
        <ActionIcon onClick={handleDeleteReward} variant='subtle' color='red' size='lg'>
          <IconTrash />
        </ActionIcon>
      );
    },
    [remove],
  );

  const renderCostColumn = useCallback(
    (cost: number, index: number): ReactNode => {
      return (
        <Controller
          control={control}
          name={`rewardPresets.${index}.cost`}
          render={({ field }) => <OutlineInput {...field} type='number' />}
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
      if (!checkIsRewardsPrefixValid(data.rewardsPrefix ?? '', data.rewardPresets)) {
        setError('rewardsPrefix', {
          type: 'validate',
          message: t('settings.twitch.rewardsPrefixLengthError', { maxLength: MAX_REWARD_TITLE_LENGTH }),
        });
        return;
      }

      clearErrors('rewardsPrefix');
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
    [reset, activeSettingsPresetId, dispatch, clearErrors, setError, t],
  );

  const confirmationModal = (onClose: () => void, onConfirm: () => void): ReactNode => (
    <RewardPresetsConfirmation open onClose={onClose} onConfirm={onConfirm} />
  );

  useEffect(() => {
    if (!checkIsRewardsPrefixValid(currentRewardsPrefix ?? '', currentRewardPresets)) {
      setError('rewardsPrefix', {
        type: 'validate',
        message: t('settings.twitch.rewardsPrefixLengthError', { maxLength: MAX_REWARD_TITLE_LENGTH }),
      });
      return;
    }

    clearErrors('rewardsPrefix');
  }, [clearErrors, currentRewardPresets, currentRewardsPrefix, setError, t]);

  return (
    <>
      <ConfirmFormOnLeave isDirtyForm={isDirty} onSubmit={handleSubmit(savePresets)} content={confirmationModal} />
      <RewardPresetsConfirmation
        open={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        onConfirm={handleSubmit(savePresets)}
      />
      <Stack gap='xs'>
        <FormInput
          name='rewardsPrefix'
          control={control}
          error={errors.rewardsPrefix?.message}
          size='sm'
          label={
            <SettingLabel
              size='lg'
              text={t('settings.twitch.commonRewardsName')}
              hint={t('settings.twitch.commonRewardsNameDesc')}
            />
          }
        />
      </Stack>
      <Stack gap='xs'>
        <Text size='lg' fw={600}>
          {t('settings.twitch.rewardsList')}
        </Text>
        <Paper withBorder radius='md' className={classes.tableWrapper}>
          <Table stripedColor='dark.8' classNames={{ thead: classes.thead, td: classes.td }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Td>
                  <Text size='md' fw={600}>
                    {t('settings.twitch.cost')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size='md' fw={600}>
                    {t('settings.twitch.color')}
                  </Text>
                </Table.Td>
                <Table.Td />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {fields.map(({ cost, color, id }, index) => {
                return (
                  <Table.Tr key={id}>
                    <Table.Td>{renderCostColumn(cost, index)}</Table.Td>
                    <Table.Td align='center'>{renderColorColumn(color, index)}</Table.Td>
                    <Table.Td align='right'>{renderActionColumn(index)}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>
        <Group justify='space-between'>
          <Button onClick={handleAppendReward} variant='outline' size='sm'>
            {t('settings.twitch.addReward')}
          </Button>
          <Button
            loading={isLoading}
            onClick={() => setConfirmOpened(true)}
            variant='filled'
            size='sm'
            disabled={!isDirty || !isValid}
          >
            {t('settings.twitch.saveRewards')}
          </Button>
        </Group>
      </Stack>
    </>
  );
};

export default RewardPresetsForm;
