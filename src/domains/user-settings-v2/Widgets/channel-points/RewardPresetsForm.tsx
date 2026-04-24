import { TextInput } from '@mantine/core';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import { SettingsForm } from '@models/settings.model.ts';
import { RootState } from '@reducers';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';

import RewardPresetsTable from './RewardPresetsTable';

type PresetsForm = Pick<SettingsForm, 'rewardPresets' | 'rewardsPrefix'>;

const RewardPresetsForm = () => {
  const { t } = useTranslation();
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rewardPresets',
  });

  return (
    <div>
      <SettingsRow compact htmlFor='rewardsPrefix'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FieldLabel text={t('settings.twitch.commonRewardsName')} hint={t('settings.twitch.commonRewardsNameDesc')} />
          <Controller
            control={control}
            name='rewardsPrefix'
            render={({ field }) => (
              <TextInput {...field} id='rewardsPrefix' w={220} error={errors.rewardsPrefix?.message} />
            )}
          />
        </div>
      </SettingsRow>

      <SettingsRow>
        <RewardPresetsTable
          control={control}
          fields={fields}
          onAppendReward={append}
          onRemoveReward={remove}
          handleSubmit={handleSubmit}
          reset={reset}
          clearErrors={clearErrors}
          setError={setError}
          isDirty={isDirty}
          isValid={isValid}
        />
      </SettingsRow>
    </div>
  );
};

export default RewardPresetsForm;
