import { ActionIcon, Button, ColorInput, NumberInput, Popover, Table, Text, Tooltip } from '@mantine/core';
import { IconCopyCheckFilled, IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
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
  UseFormSetValue,
  useController,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { updateRewardPresets } from '@api/twitchApi.ts';
import { vkVideoLiveRewardsApi } from '@api/vkVideoLiveApi';
import ConfirmFormOnLeave from '@components/ConfirmFormOnLeave/ConfirmFormOnLeave';
import withLoading from '@decorators/withLoading';
import vkVideoLive from '@domains/bids/external-integrations/VkVideoLive';
import { SettingsForm } from '@models/settings.model.ts';
import { RootState } from '@reducers';
import { setAucSettings } from '@reducers/AucSettings/AucSettings.ts';

import RewardPresetsConfirmation from './RewardPresetsConfirmation';

type PresetsForm = Pick<SettingsForm, 'rewardPresets' | 'rewardsPrefix'>;

const MAX_REWARD_TITLE_LENGTH = 45;
const DEFAULT_REWARD_COLOR = '#e3924c';
const COST_SUGGESTIONS = [500, 1000, 5000, 20000, 50000];
const REWARD_COLOR_SWATCHES = [
  '#D66E34',
  '#B8AAFF',
  '#1D90FF',
  '#9961F9',
  '#59A840',
  '#E73629',
  '#DE6489',
  '#20BBA1',
  '#F8B301',
  '#0099BB',
  '#7BBEFF',
  '#E542FF',
  '#A36C59',
  '#8BA259',
  '#00A9FF',
  '#A20BFF',
];

interface RewardPresetsTableProps {
  control: Control<PresetsForm>;
  fields: { id: string }[];
  onAppendReward: UseFieldArrayAppend<PresetsForm, 'rewardPresets'>;
  onRemoveReward: UseFieldArrayRemove;
  handleSubmit: UseFormHandleSubmit<PresetsForm>;
  reset: UseFormReset<PresetsForm>;
  clearErrors: UseFormClearErrors<PresetsForm>;
  setError: UseFormSetError<PresetsForm>;
  setValue: UseFormSetValue<PresetsForm>;
  isDirty: boolean;
  isValid: boolean;
}

interface RewardPresetRowProps {
  control: Control<PresetsForm>;
  index: number;
  onRemoveReward: UseFieldArrayRemove;
  onApplyColorToAll: (color: string) => void;
  costLabel: string;
  colorLabel: string;
  deleteLabel: string;
  applyColorToAllLabel: string;
  costSuggestions: number[];
  usedCosts: Set<number>;
}

const checkIsRewardsPrefixValid = (rewardsPrefix: string, rewardPresets: PresetsForm['rewardPresets']): boolean => {
  if (!rewardPresets?.length) {
    return true;
  }

  return rewardPresets.every(({ cost }) => `${rewardsPrefix} ${cost}`.length <= MAX_REWARD_TITLE_LENGTH);
};

const getMostCommonRewardColor = (rewardPresets: PresetsForm['rewardPresets']): string => {
  if (!rewardPresets?.length) {
    return DEFAULT_REWARD_COLOR;
  }

  const colorCounts = new Map<string, number>();
  let mostCommonColor = DEFAULT_REWARD_COLOR;
  let highestCount = 0;

  rewardPresets.forEach(({ color }) => {
    if (!color) {
      return;
    }

    const normalizedColor = color.toLowerCase();
    const count = (colorCounts.get(normalizedColor) ?? 0) + 1;
    colorCounts.set(normalizedColor, count);

    if (count > highestCount) {
      mostCommonColor = color;
      highestCount = count;
    }
  });

  return mostCommonColor;
};

const RewardPresetRow = ({
  control,
  index,
  onRemoveReward,
  onApplyColorToAll,
  costLabel,
  colorLabel,
  deleteLabel,
  applyColorToAllLabel,
  costSuggestions,
  usedCosts,
}: RewardPresetRowProps) => {
  const [isCostFocused, setIsCostFocused] = useState(false);
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
        <Popover opened={isCostFocused} position='left' withArrow shadow='md' withinPortal offset={8}>
          <Popover.Target>
            <NumberInput
              ref={costField.ref}
              value={typeof costField.value === 'number' ? costField.value : 0}
              onChange={(value) => costField.onChange(typeof value === 'number' ? value : 0)}
              onFocus={() => setIsCostFocused(true)}
              onBlur={() => {
                setIsCostFocused(false);
                costField.onBlur();
              }}
              min={0}
              allowDecimal={false}
              allowLeadingZeros={false}
              clampBehavior='strict'
              size='sm'
              aria-label={costLabel}
              className='w-full max-w-[180px]'
            />
          </Popover.Target>
          <Popover.Dropdown className='border-white/10 bg-[var(--mantine-color-dark-7)] p-2'>
            <div className='flex flex-wrap gap-1.5'>
              {costSuggestions.map((cost) => (
                <Button
                  key={cost}
                  size='compact-xs'
                  variant='light'
                  leftSection={<IconPlus size={12} />}
                  disabled={usedCosts.has(cost)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => costField.onChange(cost)}
                >
                  {cost.toLocaleString()}
                </Button>
              ))}
            </div>
          </Popover.Dropdown>
        </Popover>
      </Table.Td>
      <Table.Td className='w-[240px] p-2 align-middle'>
        <div className='flex w-full max-w-[220px] items-center gap-2'>
          <ColorInput
            ref={colorField.ref}
            value={typeof colorField.value === 'string' ? colorField.value : DEFAULT_REWARD_COLOR}
            onChange={colorField.onChange}
            onBlur={colorField.onBlur}
            size='sm'
            format='hex'
            swatches={REWARD_COLOR_SWATCHES}
            swatchesPerRow={8}
            aria-label={colorLabel}
            className='min-w-0 flex-1'
          />
          <Tooltip label={applyColorToAllLabel} position='top' withArrow withinPortal>
            <ActionIcon
              onClick={() =>
                onApplyColorToAll(typeof colorField.value === 'string' ? colorField.value : DEFAULT_REWARD_COLOR)
              }
              variant='subtle'
              color='blue'
              size='lg'
              aria-label={applyColorToAllLabel}
            >
              <IconCopyCheckFilled size={18} />
            </ActionIcon>
          </Tooltip>
        </div>
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
  setValue,
  isDirty,
  isValid,
}: RewardPresetsTableProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpened, setConfirmOpened] = useState(false);
  const { activeSettingsPresetId, authData } = useSelector((root: RootState) => root.user);
  const currentRewardsPrefix = useWatch({ control, name: 'rewardsPrefix' });
  const currentRewardPresets = useWatch({ control, name: 'rewardPresets' });
  const hasDescriptionHint = Boolean(authData.kick?.isValid || authData.vkVideoLive?.isValid);
  const usedCosts = new Set(
    currentRewardPresets?.map(({ cost }) => cost).filter((cost): cost is number => typeof cost === 'number'),
  );

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
      withLoading(setIsLoading, async () => {
        const presetsRequest = {
          presets: data.rewardPresets ?? [],
          prefix: data.rewardsPrefix ?? '',
        };

        await updateRewardPresets({
          ...presetsRequest,
          settingsId: activeSettingsPresetId,
        });

        if (vkVideoLive.pubsubFlow.store.state.subscribed && authData.vkVideoLive?.channelUrl) {
          await vkVideoLiveRewardsApi.openRewards(presetsRequest, authData.vkVideoLive.channelUrl);
        }
      })();
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
  const applyColorToAllLabel = t('settings.twitch.applyColorToAll');

  const handleApplyColorToAll = (color: string) => {
    setValue('rewardPresets', currentRewardPresets?.map((rewardPreset) => ({ ...rewardPreset, color })) ?? [], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className='flex flex-col gap-2'>
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
                onApplyColorToAll={handleApplyColorToAll}
                costLabel={costLabel}
                colorLabel={colorLabel}
                deleteLabel={deleteLabel}
                applyColorToAllLabel={applyColorToAllLabel}
                costSuggestions={COST_SUGGESTIONS}
                usedCosts={usedCosts}
              />
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {hasDescriptionHint && (
        <Text className='mb-0.5 flex items-center gap-1.5 text-xs text-blue-400'>
          <IconInfoCircle size={14} />
          {t('settings.twitch.rewardDescriptionHint')}
        </Text>
      )}

      <div className='flex items-center justify-between gap-4'>
        <Button
          onClick={() => onAppendReward({ cost: 1000, color: getMostCommonRewardColor(currentRewardPresets) })}
          variant='outline'
          size='sm'
        >
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
      </div>
    </div>
  );
};

export default RewardPresetsTable;
