import { ActionIcon, Button, ColorInput, Group, NumberInput, Stack, Table, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import {
  Control,
  Path,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormClearErrors,
  UseFormHandleSubmit,
  UseFormReset,
  UseFormSetError,
  useController,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { updateRewardPresets } from '@api/twitchApi.ts';
import ConfirmFormOnLeave from '@components/ConfirmFormOnLeave/ConfirmFormOnLeave';
import withLoading from '@decorators/withLoading';
import { SettingsForm } from '@models/settings.model.ts';
import { RootState } from '@reducers';
import { setAucSettings } from '@reducers/AucSettings/AucSettings.ts';

import RewardPresetsConfirmation from './RewardPresetsConfirmation';

type PresetsForm = Pick<SettingsForm, 'rewardPresets' | 'rewardsPrefix'>;

const MAX_REWARD_TITLE_LENGTH = 45;

interface RewardPresetsTableProps {
  control: Control<PresetsForm>;
  fields: { id: string }[];
  onAppendReward: UseFieldArrayAppend<PresetsForm, 'rewardPresets'>;
  onRemoveReward: UseFieldArrayRemove;
  handleSubmit: UseFormHandleSubmit<PresetsForm>;
  reset: UseFormReset<PresetsForm>;
  clearErrors: UseFormClearErrors<PresetsForm>;
  setError: UseFormSetError<PresetsForm>;
  isDirty: boolean;
  isValid: boolean;
}

interface RewardPresetRowProps {
  control: Control<PresetsForm>;
  index: number;
  onRemoveReward: UseFieldArrayRemove;
  costLabel: string;
  colorLabel: string;
  deleteLabel: string;
}

const checkIsRewardsPrefixValid = (rewardsPrefix: string, rewardPresets: PresetsForm['rewardPresets']): boolean => {
  if (!rewardPresets?.length) {
    return true;
  }

  return rewardPresets.every(({ cost }) => `${rewardsPrefix} ${cost}`.length <= MAX_REWARD_TITLE_LENGTH);
};

const RewardPresetRow = ({
  control,
  index,
  onRemoveReward,
  costLabel,
  colorLabel,
  deleteLabel,
}: RewardPresetRowProps) => {
  const { field: costField } = useController({
    control,
    name: `rewardPresets.${index}.cost` as Path<PresetsForm>,
  });
  const { field: colorField } = useController({
    control,
    name: `rewardPresets.${index}.color` as Path<PresetsForm>,
  });

  return (
    <Table.Tr className='border-b border-white/5 transition-colors hover:bg-white/[0.02]'>
      <Table.Td className='w-[240px] p-2 align-middle'>
        <NumberInput
          ref={costField.ref}
          value={typeof costField.value === 'number' ? costField.value : 0}
          onChange={(value) => costField.onChange(typeof value === 'number' ? value : 0)}
          onBlur={costField.onBlur}
          min={0}
          allowDecimal={false}
          allowLeadingZeros={false}
          clampBehavior='strict'
          size='sm'
          aria-label={costLabel}
          className='w-full max-w-[180px]'
        />
      </Table.Td>
      <Table.Td className='w-[240px] p-2 align-middle'>
        <ColorInput
          ref={colorField.ref}
          value={typeof colorField.value === 'string' ? colorField.value : '#e3924c'}
          onChange={colorField.onChange}
          onBlur={colorField.onBlur}
          size='sm'
          format='hex'
          aria-label={colorLabel}
          className='w-full max-w-[180px]'
        />
      </Table.Td>
      <Table.Td className='w-[72px] p-2 text-right align-middle'>
        <ActionIcon
          onClick={() => onRemoveReward(index)}
          variant='subtle'
          color='red'
          size='lg'
          aria-label={deleteLabel}
          title={deleteLabel}
        >
          <IconTrash />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};

const RewardPresetsTable = ({
  control,
  fields,
  onAppendReward,
  onRemoveReward,
  handleSubmit,
  reset,
  clearErrors,
  setError,
  isDirty,
  isValid,
}: RewardPresetsTableProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpened, setConfirmOpened] = useState(false);
  const { activeSettingsPresetId } = useSelector((root: RootState) => root.user);
  const currentRewardsPrefix = useWatch({ control, name: 'rewardsPrefix' });
  const currentRewardPresets = useWatch({ control, name: 'rewardPresets' });

  const savePresets = (data: PresetsForm) => {
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
  };

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

  const costLabel = t('settings.twitch.cost');
  const colorLabel = t('settings.twitch.color');
  const deleteLabel = t('delete');

  return (
    <Stack gap='xs'>
      <ConfirmFormOnLeave
        isDirtyForm={isDirty}
        onSubmit={handleSubmit(savePresets)}
        content={(onClose, onConfirm) => <RewardPresetsConfirmation open onClose={onClose} onConfirm={onConfirm} />}
      />
      <RewardPresetsConfirmation
        open={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        onConfirm={handleSubmit(savePresets)}
      />

      <Text className='text-md font-semibold text-[var(--mantine-color-dimmed)]'>
        {t('settings.twitch.rewardsList')}
      </Text>

      <div className='overflow-hidden rounded-lg border border-white/10 bg-[var(--mantine-color-dark-8)] shadow-[0_18px_36px_rgba(0,0,0,0.18)]'>
        <Table className='w-full border-collapse'>
          <Table.Thead className='bg-[var(--mantine-color-dark-7)]'>
            <Table.Tr className='border-b border-white/10'>
              <Table.Th className='px-4 py-3 text-left text-xs font-semibold tracking-[0.1em] text-[var(--mantine-color-gray-4)] uppercase'>
                {costLabel}
              </Table.Th>
              <Table.Th className='px-4 py-3 text-left text-xs font-semibold tracking-[0.1em] text-[var(--mantine-color-gray-4)] uppercase'>
                {colorLabel}
              </Table.Th>
              <Table.Th className='px-4 py-3 text-right text-xs font-semibold tracking-[0.1em] text-[var(--mantine-color-gray-4)] uppercase' />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {fields.map((field, index) => (
              <RewardPresetRow
                key={field.id}
                control={control}
                index={index}
                onRemoveReward={onRemoveReward}
                costLabel={costLabel}
                colorLabel={colorLabel}
                deleteLabel={deleteLabel}
              />
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Group justify='space-between'>
        <Button onClick={() => onAppendReward({ cost: 1000, color: '#e3924c' })} variant='outline' size='sm'>
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
  );
};

export default RewardPresetsTable;
